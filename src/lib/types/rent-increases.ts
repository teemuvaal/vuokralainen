export type IncreaseType = 'index_tied' | 'contract_based'
export type IncreaseDateType = 'lease_anniversary' | 'manual'

export interface RentIncreaseSettings {
  enabled: boolean
  type: IncreaseType | null
  percentage: number | null
  dateType: IncreaseDateType | null
  nextIncreaseDate: string | null
  notes: string | null
}

export interface PendingIncrease {
  scheduleId: string
  propertyId: string
  propertyName: string
  tenantId: string | null
  tenantName: string | null
  currentAmount: number
  increasePercentage: number
  newAmount: number
  nextIncreaseDate: string
  increaseType: string
  daysUntilIncrease: number
}

export interface RentIncreaseHistoryItem {
  id: string
  propertyId: string
  tenantId: string | null
  oldAmount: number
  newAmount: number
  increasePercentage: number
  increaseType: string
  increaseDate: string
  appliedAt: string
  notes: string | null
}
