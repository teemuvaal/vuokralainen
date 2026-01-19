'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface LainaBreakdownInputProps {
  totalAmount: number
  defaultValues?: {
    pääoma?: number
    korko?: number
  }
}

export function LainaBreakdownInput({
  totalAmount,
  defaultValues
}: LainaBreakdownInputProps) {
  const [pääoma, setPääoma] = useState(defaultValues?.pääoma || 0)
  const [korko, setKorko] = useState(defaultValues?.korko || 0)

  const sum = pääoma + korko
  const isValid = Math.abs(sum - totalAmount) < 0.01
  const difference = totalAmount - sum

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Lainanmaksun erittely</h4>
        <div className="text-sm text-muted-foreground">
          Yhteensä: {sum.toFixed(2)} € / {totalAmount.toFixed(2)} €
        </div>
      </div>

      {!isValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {difference > 0
              ? `Puuttuu ${difference.toFixed(2)} €`
              : `Ylimääräistä ${Math.abs(difference).toFixed(2)} €`}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pääoma">Pääoma (€)</Label>
          <Input
            id="pääoma"
            name="pääoma"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={pääoma || ''}
            onChange={(e) => setPääoma(Number(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="korko">Korko (€)</Label>
          <Input
            id="korko"
            name="korko"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={korko || ''}
            onChange={(e) => setKorko(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Quick fill buttons for common scenarios */}
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setPääoma(totalAmount)
            setKorko(0)
          }}
        >
          Kaikki pääomaan
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const remaining = totalAmount - korko
            setPääoma(Math.max(0, remaining))
          }}
        >
          Loput pääomaan
        </Button>
      </div>
    </div>
  )
}
