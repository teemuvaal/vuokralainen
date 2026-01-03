'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { createExpense } from '@/lib/actions/expenses'
import type { Database } from '@/lib/database.types'

type Property = Database['public']['Tables']['properties']['Row']
type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row']

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Tallennetaan...
        </>
      ) : (
        'Kirjaa kulu'
      )}
    </Button>
  )
}

interface ExpenseFormProps {
  properties: Property[]
  categories: ExpenseCategory[]
  defaultAmount?: number
  defaultDate?: string
  onSuccess?: () => void
}

export function ExpenseForm({
  properties,
  categories,
  defaultAmount,
  defaultDate,
  onSuccess,
}: ExpenseFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    formData.set('isRecurring', String(isRecurring))
    const result = await createExpense(formData)
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
            defaultValue={defaultAmount}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expenseDate">Päivämäärä *</Label>
          <Input
            id="expenseDate"
            name="expenseDate"
            type="date"
            defaultValue={defaultDate || new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="propertyId">Kohde</Label>
          <Select name="propertyId">
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
          <Select name="categoryId">
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

      <div className="space-y-2">
        <Label htmlFor="description">Kuvaus</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Kulun kuvaus..."
          rows={2}
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
          />
        </div>
      )}

      <SubmitButton />
    </form>
  )
}
