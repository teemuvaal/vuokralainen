import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, TrendingDown, Euro } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Property = Database['public']['Tables']['properties']['Row']
type RentPayment = Database['public']['Tables']['rent_payments']['Row']
type Expense = Database['public']['Tables']['expenses']['Row']

export default async function ReportsPage() {
  const supabase = await createClient()

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()

  // Get all payments and expenses for the current year
  const startOfYear = `${currentYear}-01-01`
  const endOfYear = `${currentYear}-12-31`

  const { data: paymentsData } = await supabase
    .from('rent_payments')
    .select('*')
    .gte('payment_date', startOfYear)
    .lte('payment_date', endOfYear)

  const { data: expensesData } = await supabase
    .from('expenses')
    .select('*')
    .gte('expense_date', startOfYear)
    .lte('expense_date', endOfYear)

  const { data: propertiesData } = await supabase.from('properties').select('*')

  const payments = paymentsData as RentPayment[] | null
  const expenses = expensesData as Expense[] | null
  const properties = propertiesData as Property[] | null

  // Calculate monthly totals
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const monthPayments = payments?.filter((p) => {
      const date = new Date(p.payment_date)
      return date.getMonth() + 1 === month
    }) || []
    const monthExpenses = expenses?.filter((e) => {
      const date = new Date(e.expense_date)
      return date.getMonth() + 1 === month
    }) || []

    const income = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0)
    const expense = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

    return {
      month,
      monthName: new Date(currentYear, i).toLocaleDateString('fi-FI', { month: 'long' }),
      income,
      expense,
      net: income - expense,
    }
  })

  const yearlyIncome = monthlyData.reduce((sum, m) => sum + m.income, 0)
  const yearlyExpenses = monthlyData.reduce((sum, m) => sum + m.expense, 0)
  const yearlyNet = yearlyIncome - yearlyExpenses

  // Per-property breakdown
  const propertyData = (properties || []).map((property) => {
    const propertyPayments = payments?.filter((p) => p.property_id === property.id) || []
    const propertyExpenses = expenses?.filter((e) => e.property_id === property.id) || []

    const income = propertyPayments.reduce((sum, p) => sum + Number(p.amount), 0)
    const expense = propertyExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

    return {
      id: property.id,
      name: property.name,
      income,
      expense,
      net: income - expense,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Raportit</h1>
        <p className="text-muted-foreground">
          Vuosittainen yhteenveto tuloista ja menoista
        </p>
      </div>

      {/* Year Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vuositulot {currentYear}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{yearlyIncome.toLocaleString('fi-FI')} €
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vuosikulut {currentYear}</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{yearlyExpenses.toLocaleString('fi-FI')} €
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nettotulos {currentYear}</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${yearlyNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {yearlyNet >= 0 ? '+' : ''}{yearlyNet.toLocaleString('fi-FI')} €
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Kuukausittainen erittely</CardTitle>
          <CardDescription>Tulot ja menot kuukausittain vuonna {currentYear}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((month) => (
              <div key={month.month} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium capitalize">{month.monthName}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-muted-foreground">Tulot</p>
                    <p className="font-medium text-green-600">
                      +{month.income.toLocaleString('fi-FI')} €
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Menot</p>
                    <p className="font-medium text-red-600">
                      -{month.expense.toLocaleString('fi-FI')} €
                    </p>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <p className="text-muted-foreground">Netto</p>
                    <p className={`font-bold ${month.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {month.net >= 0 ? '+' : ''}{month.net.toLocaleString('fi-FI')} €
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Per Property Breakdown */}
      {propertyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kohdekohtainen erittely</CardTitle>
            <CardDescription>Tulot ja menot kohteittain vuonna {currentYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {propertyData.map((property) => (
                <div key={property.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{property.name}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-muted-foreground">Tulot</p>
                      <p className="font-medium text-green-600">
                        +{property.income.toLocaleString('fi-FI')} €
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Menot</p>
                      <p className="font-medium text-red-600">
                        -{property.expense.toLocaleString('fi-FI')} €
                      </p>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="text-muted-foreground">Netto</p>
                      <p className={`font-bold ${property.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {property.net >= 0 ? '+' : ''}{property.net.toLocaleString('fi-FI')} €
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
