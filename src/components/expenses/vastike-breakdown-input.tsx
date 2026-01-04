'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface VastikeBreakdownInputProps {
  totalAmount: number
  defaultValues?: {
    yhtiövastike?: number
    rahoitusvastike?: number
    saunamaksu?: number
    vesimaksu?: number
  }
}

export function VastikeBreakdownInput({
  totalAmount,
  defaultValues
}: VastikeBreakdownInputProps) {
  const [yhtiövastike, setYhtiövastike] = useState(defaultValues?.yhtiövastike || 0)
  const [rahoitusvastike, setRahoitusvastike] = useState(defaultValues?.rahoitusvastike || 0)
  const [saunamaksu, setSaunamaksu] = useState(defaultValues?.saunamaksu || 0)
  const [vesimaksu, setVesimaksu] = useState(defaultValues?.vesimaksu || 0)

  const sum = yhtiövastike + rahoitusvastike + saunamaksu + vesimaksu
  const isValid = Math.abs(sum - totalAmount) < 0.01
  const difference = totalAmount - sum

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Vastikkeen erittely</h4>
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
          <Label htmlFor="yhtiövastike">Yhtiövastike (€)</Label>
          <Input
            id="yhtiövastike"
            name="yhtiövastike"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={yhtiövastike || ''}
            onChange={(e) => setYhtiövastike(Number(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rahoitusvastike">Rahoitusvastike (€)</Label>
          <Input
            id="rahoitusvastike"
            name="rahoitusvastike"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={rahoitusvastike || ''}
            onChange={(e) => setRahoitusvastike(Number(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="saunamaksu">Saunamaksu (€)</Label>
          <Input
            id="saunamaksu"
            name="saunamaksu"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={saunamaksu || ''}
            onChange={(e) => setSaunamaksu(Number(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vesimaksu">Vesimaksu (€)</Label>
          <Input
            id="vesimaksu"
            name="vesimaksu"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={vesimaksu || ''}
            onChange={(e) => setVesimaksu(Number(e.target.value) || 0)}
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
            setYhtiövastike(totalAmount)
            setRahoitusvastike(0)
            setSaunamaksu(0)
            setVesimaksu(0)
          }}
        >
          Kaikki yhtiövastikkeeseen
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const remaining = totalAmount - rahoitusvastike - saunamaksu - vesimaksu
            setYhtiövastike(Math.max(0, remaining))
          }}
        >
          Loput yhtiövastikkeeseen
        </Button>
      </div>
    </div>
  )
}
