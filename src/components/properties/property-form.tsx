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
import type { Database } from '@/lib/database.types'

type Property = Database['public']['Tables']['properties']['Row']

const propertyTypes = [
  { value: 'apartment', label: 'Kerrostalo' },
  { value: 'row_house', label: 'Rivitalo' },
  { value: 'house', label: 'Omakotitalo' },
  { value: 'studio', label: 'Yksiö' },
  { value: 'other', label: 'Muu' },
]

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
        isEdit ? 'Tallenna muutokset' : 'Luo kohde'
      )}
    </Button>
  )
}

interface PropertyFormProps {
  property?: Property
  action: (formData: FormData) => Promise<{ error?: string } | void>
}

export function PropertyForm({ property, action }: PropertyFormProps) {
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!property

  async function handleSubmit(formData: FormData) {
    setError(null)
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
          <Label htmlFor="name">Kohteen nimi *</Label>
          <Input
            id="name"
            name="name"
            placeholder="esim. Kalliontie 5 A 12"
            defaultValue={property?.name || ''}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertyType">Kohteen tyyppi</Label>
          <Select name="propertyType" defaultValue={property?.property_type || undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Valitse tyyppi" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Osoite</Label>
          <Input
            id="address"
            name="address"
            placeholder="Katuosoite"
            defaultValue={property?.address || ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode">Postinumero</Label>
          <Input
            id="postalCode"
            name="postalCode"
            placeholder="00100"
            defaultValue={property?.postal_code || ''}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">Kaupunki</Label>
          <Input
            id="city"
            name="city"
            placeholder="Helsinki"
            defaultValue={property?.city || ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sizeSqm">Pinta-ala (m²)</Label>
          <Input
            id="sizeSqm"
            name="sizeSqm"
            type="number"
            step="0.1"
            placeholder="45.5"
            defaultValue={property?.size_sqm || ''}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="purchasePrice">Ostohinta (€)</Label>
          <Input
            id="purchasePrice"
            name="purchasePrice"
            type="number"
            step="0.01"
            placeholder="150000"
            defaultValue={property?.purchase_price || ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchaseDate">Ostopäivä</Label>
          <Input
            id="purchaseDate"
            name="purchaseDate"
            type="date"
            defaultValue={property?.purchase_date || ''}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Muistiinpanot</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Lisätietoja kohteesta..."
          rows={4}
          defaultValue={property?.notes || ''}
        />
      </div>

      <div className="flex gap-4">
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  )
}
