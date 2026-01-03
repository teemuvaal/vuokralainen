import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExpenseForm } from '@/components/expenses/expense-form'
import { Plus, Receipt, TrendingDown, Camera } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Expense = Database['public']['Tables']['expenses']['Row']
type Property = Database['public']['Tables']['properties']['Row']
type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row']
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

export default async function ExpensesPage() {
  const supabase = await createClient()

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const { data: propertiesData } = await supabase.from('properties').select('*').order('name')
  const { data: categoriesData } = await supabase.from('expense_categories').select('*').order('name')
  const { data: expensesData } = await supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false })
    .limit(50)

  const properties = propertiesData as Property[] | null
  const categories = categoriesData as ExpenseCategory[] | null
  const expenses = expensesData as Expense[] | null

  // Calculate monthly totals
  const thisMonthExpenses = expenses?.filter((e) => {
    const date = new Date(e.expense_date)
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
  }) || []

  const lastMonthExpenses = expenses?.filter((e) => {
    const date = new Date(e.expense_date)
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear
    return date.getMonth() + 1 === lastMonth && date.getFullYear() === lastMonthYear
  }) || []

  const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

  // Property and category lookups
  const propertyMap = (properties || []).reduce((acc, p) => {
    acc[p.id] = p
    return acc
  }, {} as Record<string, Property>)

  const categoryMap = (categories || []).reduce((acc, c) => {
    acc[c.id] = c
    return acc
  }, {} as Record<string, ExpenseCategory>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kulut</h1>
          <p className="text-muted-foreground">
            Kirjaa ja seuraa kulujasi
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/expenses/scan">
            <Button variant="outline">
              <Camera className="mr-2 h-4 w-4" />
              Skannaa kuitti
            </Button>
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Lisää kulu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Kirjaa uusi kulu</DialogTitle>
                <DialogDescription>
                  Kirjaa yksittäinen tai toistuva kulu
                </DialogDescription>
              </DialogHeader>
              <ExpenseForm properties={properties || []} categories={categories || []} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tämä kuukausi</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{thisMonthTotal.toLocaleString('fi-FI')} €
            </div>
            <p className="text-xs text-muted-foreground">
              {thisMonthExpenses.length} kulua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edellinen kuukausi</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastMonthTotal.toLocaleString('fi-FI')} €
            </div>
            <p className="text-xs text-muted-foreground">
              {lastMonthExpenses.length} kulua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Muutos</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${thisMonthTotal <= lastMonthTotal ? 'text-green-600' : 'text-red-600'}`}>
              {thisMonthTotal <= lastMonthTotal ? '' : '+'}
              {(thisMonthTotal - lastMonthTotal).toLocaleString('fi-FI')} €
            </div>
            <p className="text-xs text-muted-foreground">
              vs. edellinen kuukausi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Viimeisimmät kulut</CardTitle>
          <CardDescription>
            Kirjatut kulut aikajärjestyksessä
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses && expenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Päivämäärä</TableHead>
                  <TableHead>Kohde</TableHead>
                  <TableHead>Kategoria</TableHead>
                  <TableHead>Kuvaus</TableHead>
                  <TableHead className="text-right">Summa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {new Date(expense.expense_date).toLocaleDateString('fi-FI')}
                    </TableCell>
                    <TableCell>
                      {expense.property_id && propertyMap[expense.property_id]?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {expense.category_id && categoryMap[expense.category_id] ? (
                        <Badge variant="outline">
                          {categoryMap[expense.category_id].name}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {expense.description || '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      -{Number(expense.amount).toLocaleString('fi-FI')} €
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ei vielä kuluja</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
