import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaymentForm } from '@/components/rent/payment-form'
import { PendingIncreasesWidget } from '@/components/rent/pending-increases-widget'
import { Plus, Wallet, TrendingUp, Calendar } from 'lucide-react'
import type { Database } from '@/lib/database.types'
import { getPendingRentIncreases } from '@/lib/actions/rent'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Property = Database['public']['Tables']['properties']['Row']
type Tenant = Database['public']['Tables']['tenants']['Row']
type RentPayment = Database['public']['Tables']['rent_payments']['Row']
type RentSchedule = Database['public']['Tables']['rent_schedules']['Row']

export default async function RentPage() {
  const supabase = await createClient()

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const { data: propertiesData } = await supabase.from('properties').select('*').order('name')
  const { data: tenantsData } = await supabase.from('tenants').select('*').eq('is_active', true)
  const { data: paymentsData } = await supabase
    .from('rent_payments')
    .select('*')
    .order('payment_date', { ascending: false })
    .limit(50)
  const { data: schedulesData } = await supabase
    .from('rent_schedules')
    .select('*')
    .eq('is_active', true)

  const properties = propertiesData as Property[] | null
  const tenants = tenantsData as Tenant[] | null
  const payments = paymentsData as RentPayment[] | null
  const schedules = schedulesData as RentSchedule[] | null

  // Get pending rent increases
  const pendingIncreases = await getPendingRentIncreases()

  // Calculate monthly totals
  const thisMonthPayments = payments?.filter((p) => {
    const date = new Date(p.payment_date)
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
  }) || []

  const lastMonthPayments = payments?.filter((p) => {
    const date = new Date(p.payment_date)
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear
    return date.getMonth() + 1 === lastMonth && date.getFullYear() === lastMonthYear
  }) || []

  const thisMonthTotal = thisMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const lastMonthTotal = lastMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const expectedTotal = schedules?.reduce((sum, s) => sum + Number(s.amount), 0) || 0

  // Property lookup
  const propertyMap = (properties || []).reduce((acc, p) => {
    acc[p.id] = p
    return acc
  }, {} as Record<string, Property>)

  // Tenant lookup
  const tenantMap = (tenants || []).reduce((acc, t) => {
    acc[t.id] = t
    return acc
  }, {} as Record<string, Tenant>)

  const statusLabels: Record<string, string> = {
    received: 'Maksettu',
    partial: 'Osittain',
    late: 'Myöhässä',
    pending: 'Odottaa',
  }

  const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    received: 'default',
    partial: 'secondary',
    late: 'destructive',
    pending: 'outline',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vuokrat</h1>
          <p className="text-muted-foreground">
            Seuraa vuokramaksuja ja tuloja
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Kirjaa maksu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Kirjaa vuokramaksu</DialogTitle>
              <DialogDescription>
                Kirjaa vastaanotettu vuokramaksu
              </DialogDescription>
            </DialogHeader>
            <PaymentForm properties={properties || []} tenants={tenants || []} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tämä kuukausi</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{thisMonthTotal.toLocaleString('fi-FI')} €
            </div>
            <p className="text-xs text-muted-foreground">
              {thisMonthPayments.length} maksua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Odotettu / kk</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expectedTotal.toLocaleString('fi-FI')} €
            </div>
            <p className="text-xs text-muted-foreground">
              {schedules?.length || 0} aktiivista vuokrasopimusta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Muutos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${thisMonthTotal >= lastMonthTotal ? 'text-green-600' : 'text-red-600'}`}>
              {thisMonthTotal >= lastMonthTotal ? '+' : ''}
              {(thisMonthTotal - lastMonthTotal).toLocaleString('fi-FI')} €
            </div>
            <p className="text-xs text-muted-foreground">
              vs. edellinen kuukausi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Rent Increases */}
      {pendingIncreases.length > 0 && (
        <PendingIncreasesWidget increases={pendingIncreases} />
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Viimeisimmät maksut</CardTitle>
          <CardDescription>
            Vastaanotetut vuokramaksut
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Päivämäärä</TableHead>
                  <TableHead>Kohde</TableHead>
                  <TableHead>Vuokralainen</TableHead>
                  <TableHead>Tila</TableHead>
                  <TableHead className="text-right">Summa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.payment_date).toLocaleDateString('fi-FI')}
                    </TableCell>
                    <TableCell>
                      {payment.property_id && propertyMap[payment.property_id]?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {payment.tenant_id && tenantMap[payment.tenant_id]
                        ? `${tenantMap[payment.tenant_id].first_name} ${tenantMap[payment.tenant_id].last_name}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[payment.status]}>
                        {statusLabels[payment.status] || payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      +{Number(payment.amount).toLocaleString('fi-FI')} €
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ei vielä maksuja</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
