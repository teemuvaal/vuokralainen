'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { applyRentIncrease } from '@/lib/actions/rent'
import type { PendingIncrease } from '@/lib/types/rent-increases'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Toteutetaan...
        </>
      ) : (
        'Toteuta vuokrankorotus'
      )}
    </Button>
  )
}

interface ApplyIncreaseFormProps {
  increase: PendingIncrease
  onSuccess?: () => void
}

export function ApplyIncreaseForm({ increase, onSuccess }: ApplyIncreaseFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(false)

    const result = await applyRentIncrease(increase.scheduleId, formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        window.location.reload() // Refresh to show updated data
      }, 1500)
    }
  }

  const increaseAmount = increase.newAmount - increase.currentAmount

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>Vuokrankorotus toteutettu onnistuneesti!</AlertDescription>
        </Alert>
      )}

      <div className="p-4 rounded-lg bg-muted space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Nykyinen vuokra:</span>
          <span className="font-medium">{increase.currentAmount.toLocaleString('fi-FI')} €</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Korotusprosentti:</span>
          <span className="font-medium">{increase.increasePercentage}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Korotus:</span>
          <span className="font-medium text-green-600">+{increaseAmount.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t">
          <span className="font-medium">Uusi vuokra:</span>
          <span className="font-bold text-lg">{increase.newAmount.toLocaleString('fi-FI')} €</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="increaseDate">Voimaantulopäivä *</Label>
        <Input
          id="increaseDate"
          name="increaseDate"
          type="date"
          defaultValue={increase.nextIncreaseDate}
          required
        />
        <p className="text-xs text-muted-foreground">
          Päivä, jolloin uusi vuokra tulee voimaan
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Muistiinpanot</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Lisätietoja korotuksesta..."
          rows={3}
        />
      </div>

      <SubmitButton />
    </form>
  )
}
