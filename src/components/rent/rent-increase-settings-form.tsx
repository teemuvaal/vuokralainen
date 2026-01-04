'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Info } from 'lucide-react'
import { updateRentIncreaseSettings } from '@/lib/actions/rent'
import type { Database } from '@/lib/database.types'

type RentSchedule = Database['public']['Tables']['rent_schedules']['Row']

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
        'Tallenna asetukset'
      )}
    </Button>
  )
}

interface RentIncreaseSettingsFormProps {
  schedule: RentSchedule
  leaseStartDate?: string | null
  onSuccess?: () => void
}

export function RentIncreaseSettingsForm({
  schedule,
  leaseStartDate,
  onSuccess
}: RentIncreaseSettingsFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(schedule.increase_enabled || false)
  const [dateType, setDateType] = useState<string>(schedule.increase_date_type || 'lease_anniversary')

  async function handleSubmit(formData: FormData) {
    setError(null)
    formData.set('increaseEnabled', enabled.toString())

    const result = await updateRentIncreaseSettings(schedule.id, formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      onSuccess?.()
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="increaseEnabled"
          checked={enabled}
          onCheckedChange={(checked) => setEnabled(checked as boolean)}
        />
        <div className="space-y-0.5">
          <Label htmlFor="increaseEnabled" className="cursor-pointer">
            Automaattinen vuokrankorotus
          </Label>
          <p className="text-sm text-muted-foreground">
            Ota käyttöön säännölliset vuokrankorotukset
          </p>
        </div>
      </div>

      {enabled && (
        <>
          <div className="space-y-2">
            <Label htmlFor="increaseType">Korotuksen tyyppi *</Label>
            <Select
              name="increaseType"
              defaultValue={schedule.increase_type || undefined}
              required={enabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Valitse tyyppi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="index_tied">Sidottu indeksiin</SelectItem>
                <SelectItem value="contract_based">Sopimuksen mukainen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="increasePercentage">Korotusprosentti (%) *</Label>
            <Input
              id="increasePercentage"
              name="increasePercentage"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="3.5"
              defaultValue={schedule.increase_percentage || ''}
              required={enabled}
            />
            <p className="text-xs text-muted-foreground">
              Esim. 3.5 tarkoittaa 3.5% korotusta
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="increaseDateType">Korotuksen ajankohta *</Label>
            <Select
              name="increaseDateType"
              value={dateType}
              onValueChange={setDateType}
              required={enabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lease_anniversary">
                  Vuokrasopimuksen vuosipäivä
                </SelectItem>
                <SelectItem value="manual">Määritä itse päivämäärä</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateType === 'lease_anniversary' && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {leaseStartDate
                  ? `Seuraava korotus lasketaan vuokrasopimuksen alkamispäivän (${new Date(leaseStartDate).toLocaleDateString('fi-FI')}) perusteella.`
                  : 'Vuokralaisen vuokra-ajan alkamispäivä täytyy olla määritelty.'}
              </AlertDescription>
            </Alert>
          )}

          {dateType === 'manual' && (
            <div className="space-y-2">
              <Label htmlFor="nextIncreaseDate">Seuraava korotuspäivä *</Label>
              <Input
                id="nextIncreaseDate"
                name="nextIncreaseDate"
                type="date"
                defaultValue={schedule.next_increase_date || ''}
                required={enabled && dateType === 'manual'}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="increaseNotes">Muistiinpanot</Label>
            <Textarea
              id="increaseNotes"
              name="increaseNotes"
              placeholder="Lisätietoja vuokrankorotuksesta..."
              rows={3}
              defaultValue={schedule.increase_notes || ''}
            />
          </div>
        </>
      )}

      <SubmitButton />
    </form>
  )
}
