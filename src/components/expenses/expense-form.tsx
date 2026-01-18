'use client'

import { useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { createExpense, updateExpense } from '@/lib/actions/expenses'
import { VastikeBreakdownInput } from './vastike-breakdown-input'
import { parseVastikeBreakdown } from '@/lib/types'
import type { Database } from '@/lib/database.types'

type Property = Database['public']['Tables']['properties']['Row']
type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row']
type Expense = Database['public']['Tables']['expenses']['Row']

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Tallennetaan...
        </>
      ) : (
        mode === 'edit' ? 'Tallenna muutokset' : 'Kirjaa kulu'
      )}
    </Button>
  )
}

interface ExpenseFormProps {
  properties: Property[]
  categories: ExpenseCategory[]
  expense?: Expense
  defaultAmount?: number
  defaultDate?: string
  onSuccess?: () => void
}

export function ExpenseForm({
  properties,
  categories,
  expense,
  defaultAmount,
  defaultDate,
  onSuccess,
}: ExpenseFormProps) {
  const mode: 'create' | 'edit' = expense ? 'edit' : 'create'
  const breakdown = expense ? parseVastikeBreakdown(expense.vastike_breakdown) : null

  const [error, setError] = useState<string | null>(null)
  const [isRecurring, setIsRecurring] = useState(expense?.is_recurring || false)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    expense?.category_id || undefined
  )
  const [amount, setAmount] = useState<number>(
    expense?.amount ? Number(expense.amount) : (defaultAmount || 0)
  )
  const [showVastikeBreakdown, setShowVastikeBreakdown] = useState(false)

  // Find "Vastike" category
  const vastikeCategory = categories.find(c => c.name === 'Vastike')
  const isVastikeSelected = selectedCategory === vastikeCategory?.id

  // Update breakdown visibility when category changes
  useEffect(() => {
    setShowVastikeBreakdown(isVastikeSelected)
  }, [isVastikeSelected])

  async function handleSubmit(formData: FormData) {
    setError(null)
    formData.set('isRecurring', String(isRecurring))

    const result = mode === 'edit' && expense
      ? await updateExpense(expense.id, formData)
      : await createExpense(formData)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      onSuccess?.()
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Summa (€) *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            placeholder="50.00"
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expenseDate">Päivämäärä *</Label>
          <Input
            id="expenseDate"
            name="expenseDate"
            type="date"
            defaultValue={
              expense?.expense_date ||
              defaultDate ||
              new Date().toISOString().split('T')[0]
            }
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="propertyId">Kohde</Label>
          <Select name="propertyId" defaultValue={expense?.property_id || undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Valitse kohde" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Kategoria</Label>
          <Select name="categoryId" value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Valitse kategoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vastike Breakdown - shown only when Vastike category is selected */}
      {isVastikeSelected && (
        <div className="space-y-2">
          <input type="hidden" name="hasVastikeBreakdown" value="true" />
          <VastikeBreakdownInput
            totalAmount={amount}
            defaultValues={breakdown || undefined}
          />
        </div>
      )}


      <div className="space-y-2">
        <Label htmlFor="description">Kuvaus</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Kulun kuvaus..."
          rows={2}
          defaultValue={expense?.description || ''}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isRecurring"
          checked={isRecurring}
          onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
        />
        <Label htmlFor="isRecurring" className="font-normal">
          Toistuva kulu (kuukausittain)
        </Label>
      </div>

      {isRecurring && (
        <div className="space-y-2">
          <Label htmlFor="recurringDay">Toistuu kuukauden päivänä</Label>
          <Input
            id="recurringDay"
            name="recurringDay"
            type="number"
            min="1"
            max="31"
            placeholder="1"
            defaultValue={expense?.recurring_day || undefined}
          />
        </div>
      )}

      <SubmitButton mode={mode} />
    </form>
  )
}
