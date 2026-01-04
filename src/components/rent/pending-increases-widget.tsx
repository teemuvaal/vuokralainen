'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ApplyIncreaseForm } from './apply-increase-form'
import type { PendingIncrease } from '@/lib/types/rent-increases'

interface PendingIncreasesWidgetProps {
  increases: PendingIncrease[]
}

export function PendingIncreasesWidget({ increases }: PendingIncreasesWidgetProps) {
  if (increases.length === 0) {
    return null
  }

  const urgentIncreases = increases.filter(i => i.daysUntilIncrease <= 30)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Odottavat vuokrankorotukset
            </CardTitle>
            <CardDescription>
              Seuraavat 90 päivää
            </CardDescription>
          </div>
          {urgentIncreases.length > 0 && (
            <Badge variant="destructive">
              {urgentIncreases.length} kiireellistä
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {increases.map((increase) => {
            const isUrgent = increase.daysUntilIncrease <= 30
            const increaseAmount = increase.newAmount - increase.currentAmount

            return (
              <div
                key={increase.scheduleId}
                className={`p-4 rounded-lg border ${isUrgent ? 'border-orange-200 bg-orange-50' : 'border-border'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{increase.propertyName}</p>
                    {increase.tenantName && (
                      <p className="text-sm text-muted-foreground">{increase.tenantName}</p>
                    )}
                  </div>
                  {isUrgent && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {increase.daysUntilIncrease} pv
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nykyinen vuokra</p>
                    <p className="font-medium">{increase.currentAmount.toLocaleString('fi-FI')} €</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Uusi vuokra</p>
                    <p className="font-medium text-green-600">
                      {increase.newAmount.toLocaleString('fi-FI')} €
                      <span className="text-xs ml-1">
                        (+{increaseAmount.toFixed(2)} €)
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(increase.nextIncreaseDate).toLocaleDateString('fi-FI')}
                    <Badge variant="outline" className="ml-2">
                      +{increase.increasePercentage}%
                    </Badge>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant={isUrgent ? 'default' : 'outline'}>
                        Toteuta korotus
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Toteuta vuokrankorotus</DialogTitle>
                        <DialogDescription>
                          {increase.propertyName} - {increase.tenantName}
                        </DialogDescription>
                      </DialogHeader>
                      <ApplyIncreaseForm increase={increase} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
