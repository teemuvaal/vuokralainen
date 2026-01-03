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
import type { Database } from '@/lib/database.types'

type Tenant = Database['public']['Tables']['tenants']['Row']
type Property = Database['public']['Tables']['properties']['Row']

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEdit ? 'Tallennetaan...' : 'Luodaan...'}
        </>
      ) : (
        isEdit ? 'Tallenna muutokset' : 'Lisää vuokralainen'
      )}
    </Button>
  )
}

interface TenantFormProps {
  tenant?: Tenant
  properties: Property[]
  action: (formData: FormData) => Promise<{ error?: string } | void>
}

export function TenantForm({ tenant, properties, action }: TenantFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(tenant?.is_active ?? true)
  const isEdit = !!tenant

  async function handleSubmit(formData: FormData) {
    setError(null)
    formData.set('isActive', String(isActive))
    const result = await action(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Etunimi *</Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Matti"
            defaultValue={tenant?.first_name || ''}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Sukunimi *</Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Meikäläinen"
            defaultValue={tenant?.last_name || ''}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Sähköposti</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="matti@esimerkki.fi"
            defaultValue={tenant?.email || ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Puhelin</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+358 40 123 4567"
            defaultValue={tenant?.phone || ''}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="propertyId">Kohde</Label>
        <Select name="propertyId" defaultValue={tenant?.property_id || undefined}>
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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="leaseStart">Vuokrasopimus alkaa</Label>
          <Input
            id="leaseStart"
            name="leaseStart"
            type="date"
            defaultValue={tenant?.lease_start || ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="leaseEnd">Vuokrasopimus päättyy</Label>
          <Input
            id="leaseEnd"
            name="leaseEnd"
            type="date"
            defaultValue={tenant?.lease_end || ''}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="monthlyRent">Kuukausivuokra (€)</Label>
          <Input
            id="monthlyRent"
            name="monthlyRent"
            type="number"
            step="0.01"
            placeholder="850"
            defaultValue={tenant?.monthly_rent || ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="depositAmount">Vakuusmaksu (€)</Label>
          <Input
            id="depositAmount"
            name="depositAmount"
            type="number"
            step="0.01"
            placeholder="1700"
            defaultValue={tenant?.deposit_amount || ''}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Muistiinpanot</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Lisätietoja vuokralaisesta..."
          rows={4}
          defaultValue={tenant?.notes || ''}
        />
      </div>

      {isEdit && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={isActive}
            onCheckedChange={(checked) => setIsActive(checked as boolean)}
          />
          <Label htmlFor="isActive" className="font-normal">
            Aktiivinen vuokralainen
          </Label>
        </div>
      )}

      <div className="flex gap-4">
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  )
}
