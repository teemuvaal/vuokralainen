import type { VastikeBreakdown } from '@/lib/types'

interface VastikeBreakdownDisplayProps {
  breakdown: VastikeBreakdown
  compact?: boolean
}

export function VastikeBreakdownDisplay({
  breakdown,
  compact = false
}: VastikeBreakdownDisplayProps) {
  const items = [
    { label: 'Yhtiövastike', value: breakdown.yhtiövastike },
    { label: 'Rahoitusvastike', value: breakdown.rahoitusvastike },
    { label: 'Saunamaksu', value: breakdown.saunamaksu },
    { label: 'Vesimaksu', value: breakdown.vesimaksu },
  ].filter(item => item.value > 0)

  if (compact) {
    return (
      <div className="text-xs space-y-1 text-muted-foreground">
        {items.map(item => (
          <div key={item.label} className="flex justify-between">
            <span>{item.label}:</span>
            <span>{item.value.toFixed(2)} €</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      {items.map(item => (
        <div key={item.label} className="flex justify-between p-2 rounded bg-muted/50">
          <span className="text-muted-foreground">{item.label}:</span>
          <span className="font-medium">{item.value.toFixed(2)} €</span>
        </div>
      ))}
    </div>
  )
}
