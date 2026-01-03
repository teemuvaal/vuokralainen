import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Users, Wallet, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  // Fetch summary data
  const { count: propertiesCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })

  const { count: tenantsCount } = await supabase
    .from('tenants')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { data: paymentsData } = await supabase
    .from('rent_payments')
    .select('amount')
    .gte('payment_date', startOfMonth)

  const { data: expensesData } = await supabase
    .from('expenses')
    .select('amount')
    .gte('expense_date', startOfMonth)

  const recentPayments = paymentsData as { amount: number }[] | null
  const recentExpenses = expensesData as { amount: number }[] | null

  const monthlyIncome = (recentPayments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const monthlyExpenses = (recentExpenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const netIncome = monthlyIncome - monthlyExpenses

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kojelauta</h1>
          <p className="text-muted-foreground">
            Yleiskatsaus vuokra-asuntoihisi
          </p>
        </div>
        <Link href="/app/properties/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Lisää kohde
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kohteet</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertiesCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              vuokra-asuntoa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vuokralaiset</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenantsCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              aktiivista vuokralaista
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vuokratulot</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyIncome.toLocaleString('fi-FI')} €
            </div>
            <p className="text-xs text-muted-foreground">
              tässä kuussa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nettotulos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netIncome >= 0 ? '+' : ''}{netIncome.toLocaleString('fi-FI')} €
            </div>
            <p className="text-xs text-muted-foreground">
              tulot - kulut tässä kuussa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Aloita tästä</CardTitle>
            <CardDescription>
              Pikalinkit yleisimpiin toimintoihin
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/app/properties/new">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Lisää uusi kohde
              </Button>
            </Link>
            <Link href="/app/tenants">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Hallitse vuokralaisia
              </Button>
            </Link>
            <Link href="/app/expenses">
              <Button variant="outline" className="w-full justify-start">
                <Wallet className="mr-2 h-4 w-4" />
                Kirjaa kulu
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kuukauden yhteenveto</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('fi-FI', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vuokratulot</span>
                <span className="font-medium text-green-600">
                  +{monthlyIncome.toLocaleString('fi-FI')} €
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kulut</span>
                <span className="font-medium text-red-600">
                  -{monthlyExpenses.toLocaleString('fi-FI')} €
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-medium">Netto</span>
                <span className={`font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netIncome >= 0 ? '+' : ''}{netIncome.toLocaleString('fi-FI')} €
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tekoälyominaisuudet</CardTitle>
            <CardDescription>
              Nopeuta työtäsi tekoälyllä
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/app/expenses/scan">
              <Button variant="outline" className="w-full justify-start">
                <Wallet className="mr-2 h-4 w-4" />
                Skannaa kuitti
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
