'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { createRentPayment } from '@/lib/actions/rent'
import type { Database } from '@/lib/database.types'

type Property = Database['public']['Tables']['properties']['Row']
type Tenant = Database['public']['Tables']['tenants']['Row']

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
        'Kirjaa maksu'
      )}
    </Button>
  )
}

interface PaymentFormProps {
  properties: Property[]
  tenants: Tenant[]
  onSuccess?: () => void
}

export function PaymentForm({ properties, tenants, onSuccess }: PaymentFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')

  const filteredTenants = tenants.filter(
    (t) => t.is_active && (!selectedPropertyId || t.property_id === selectedPropertyId)
  )

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createRentPayment(formData)
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
          <Label htmlFor="propertyId">Kohde *</Label>
          <Select
            name="propertyId"
            required
            onValueChange={setSelectedPropertyId}
          >
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
          <Label htmlFor="tenantId">Vuokralainen</Label>
          <Select name="tenantId">
            <SelectTrigger>
              <SelectValue placeholder="Valitse vuokralainen" />
            </SelectTrigger>
            <SelectContent>
              {filteredTenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.first_name} {tenant.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Summa (€) *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            placeholder="850.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentDate">Maksupäivä *</Label>
          <Input
            id="paymentDate"
            name="paymentDate"
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Tila</Label>
        <Select name="status" defaultValue="received">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="received">Maksettu</SelectItem>
            <SelectItem value="partial">Osittain maksettu</SelectItem>
            <SelectItem value="late">Myöhässä</SelectItem>
            <SelectItem value="pending">Odottaa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Muistiinpanot</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Lisätietoja maksusta..."
          rows={2}
        />
      </div>

      <SubmitButton />
    </form>
  )
}
