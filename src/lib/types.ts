// Type definitions and helper functions for Vuokralainen app

export interface VastikeBreakdown {
  yhtiövastike: number
  rahoitusvastike: number
  saunamaksu: number
  vesimaksu: number
}

export function isVastikeBreakdown(value: unknown): value is VastikeBreakdown {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.yhtiövastike === 'number' &&
    typeof obj.rahoitusvastike === 'number' &&
    typeof obj.saunamaksu === 'number' &&
    typeof obj.vesimaksu === 'number'
  )
}

export function parseVastikeBreakdown(json: unknown): VastikeBreakdown | null {
  if (isVastikeBreakdown(json)) return json
  return null
}

export interface LainaBreakdown {
  pääoma: number
  korko: number
}

export function isLainaBreakdown(value: unknown): value is LainaBreakdown {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.pääoma === 'number' &&
    typeof obj.korko === 'number'
  )
}

export function parseLainaBreakdown(json: unknown): LainaBreakdown | null {
  if (isLainaBreakdown(json)) return json
  return null
}
