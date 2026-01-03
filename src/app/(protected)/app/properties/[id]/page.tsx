import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PropertyForm } from '@/components/properties/property-form'
import { PropertyDocuments } from '@/components/documents/property-documents'
import { updateProperty, deleteProperty } from '@/lib/actions/properties'
import { getPropertyDocuments } from '@/lib/actions/documents'
import type { Database } from '@/lib/database.types'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Ruler,
  Calendar,
  Euro,
  Users,
  Trash2,
  FileText,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type Property = Database['public']['Tables']['properties']['Row']
type Tenant = Database['public']['Tables']['tenants']['Row']
type RentPayment = Database['public']['Tables']['rent_payments']['Row']
type Expense = Database['public']['Tables']['expenses']['Row']
type PropertyDocument = Database['public']['Tables']['property_documents']['Row']

const propertyTypeLabels: Record<string, string> = {
  apartment: 'Kerrostalo',
  row_house: 'Rivitalo',
  house: 'Omakotitalo',
  studio: 'Yksiö',
  other: 'Muu',
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: propertyData } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (!propertyData) {
    notFound()
  }

  const property = propertyData as Property

  // Get tenants for this property
  const { data: tenantsData } = await supabase
    .from('tenants')
    .select('*')
    .eq('property_id', id)
    .eq('is_active', true)

  const tenants = tenantsData as Tenant[] | null

  // Get recent rent payments
  const { data: paymentsData } = await supabase
    .from('rent_payments')
    .select('*')
    .eq('property_id', id)
    .order('payment_date', { ascending: false })
    .limit(5)

  const recentPayments = paymentsData as RentPayment[] | null

  // Get recent expenses
  const { data: expensesData } = await supabase
    .from('expenses')
    .select('*')
    .eq('property_id', id)
    .order('expense_date', { ascending: false })
    .limit(5)

  const recentExpenses = expensesData as Expense[] | null

  // Get property documents
  const documents = await getPropertyDocuments(id)

  const fullAddress = [property.address, property.postal_code, property.city]
    .filter(Boolean)
    .join(', ')

  const updatePropertyWithId = updateProperty.bind(null, id)

  async function handleDelete() {
    'use server'
    await deleteProperty(id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app/properties">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{property.name}</h1>
              {property.property_type && (
                <Badge variant="secondary">
                  {propertyTypeLabels[property.property_type] || property.property_type}
                </Badge>
              )}
            </div>
            {fullAddress && (
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {fullAddress}
              </p>
            )}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Poista
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Poista kohde</DialogTitle>
              <DialogDescription>
                Haluatko varmasti poistaa kohteen &quot;{property.name}&quot;?
                Tätä toimintoa ei voi perua.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <form action={handleDelete}>
                <Button type="submit" variant="destructive">
                  Poista kohde
                </Button>
              </form>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Yleiskatsaus</TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Tiedostot ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="edit">Muokkaa</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pinta-ala</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {property.size_sqm ? `${property.size_sqm} m²` : '-'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ostohinta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {property.purchase_price
                      ? `${Number(property.purchase_price).toLocaleString('fi-FI')} €`
                      : '-'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ostopäivä</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {property.purchase_date
                      ? new Date(property.purchase_date).toLocaleDateString('fi-FI')
                      : '-'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Vuokralaiset</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{tenants?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tenants */}
          <Card>
            <CardHeader>
              <CardTitle>Vuokralaiset</CardTitle>
              <CardDescription>Kohteen aktiiviset vuokralaiset</CardDescription>
            </CardHeader>
            <CardContent>
              {tenants && tenants.length > 0 ? (
                <div className="space-y-2">
                  {tenants.map((tenant) => (
                    <Link
                      key={tenant.id}
                      href={`/app/tenants/${tenant.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">
                          {tenant.first_name} {tenant.last_name}
                        </p>
                        {tenant.email && (
                          <p className="text-sm text-muted-foreground">{tenant.email}</p>
                        )}
                      </div>
                      {tenant.monthly_rent && (
                        <Badge variant="outline">
                          {Number(tenant.monthly_rent).toLocaleString('fi-FI')} €/kk
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Ei vuokralaisia
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Viimeisimmät vuokramaksut</CardTitle>
              </CardHeader>
              <CardContent>
                {recentPayments && recentPayments.length > 0 ? (
                  <div className="space-y-2">
                    {recentPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-2 rounded border"
                      >
                        <span className="text-sm">
                          {new Date(payment.payment_date).toLocaleDateString('fi-FI')}
                        </span>
                        <span className="font-medium text-green-600">
                          +{Number(payment.amount).toLocaleString('fi-FI')} €
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Ei maksuja
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Viimeisimmät kulut</CardTitle>
              </CardHeader>
              <CardContent>
                {recentExpenses && recentExpenses.length > 0 ? (
                  <div className="space-y-2">
                    {recentExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-2 rounded border"
                      >
                        <span className="text-sm">
                          {new Date(expense.expense_date).toLocaleDateString('fi-FI')}
                          {expense.description && ` - ${expense.description}`}
                        </span>
                        <span className="font-medium text-red-600">
                          -{Number(expense.amount).toLocaleString('fi-FI')} €
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Ei kuluja
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {property.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Muistiinpanot</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{property.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tiedostot</CardTitle>
              <CardDescription>
                Lataa ja hallitse kohteeseen liittyviä tiedostoja (sopimuksia, pöytäkirjoja, jne.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropertyDocuments propertyId={id} initialDocuments={documents} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Muokkaa kohteen tietoja</CardTitle>
              <CardDescription>
                Päivitä vuokra-asunnon tiedot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropertyForm property={property} action={updatePropertyWithId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
