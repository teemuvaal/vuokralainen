import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PropertyForm } from '@/components/properties/property-form'
import { PropertyDocuments } from '@/components/documents/property-documents'
import { VastikeBreakdownDisplay } from '@/components/expenses/vastike-breakdown-display'
import { PendingIncreasesWidget } from '@/components/rent/pending-increases-widget'
import { RentIncreaseHistory } from '@/components/rent/rent-increase-history'
import { updateProperty, deleteProperty } from '@/lib/actions/properties'
import { getPropertyDocuments } from '@/lib/actions/documents'
import { getPendingRentIncreases } from '@/lib/actions/rent'
import { parseVastikeBreakdown } from '@/lib/types'
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
  Wrench,
  User,
  Phone,
  Mail,
  Building,
  TrendingUp,
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

  // Get pending rent increases for this property
  const allPendingIncreases = await getPendingRentIncreases()
  const propertyPendingIncreases = allPendingIncreases.filter(
    inc => inc.propertyId === id
  )

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
          <TabsTrigger value="rent">
            <TrendingUp className="mr-2 h-4 w-4" />
            Vuokrat
          </TabsTrigger>
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
                    {recentExpenses.map((expense) => {
                      const breakdown = parseVastikeBreakdown(expense.vastike_breakdown)

                      return (
                        <div key={expense.id} className="rounded border">
                          <div className="flex items-center justify-between p-2">
                            <span className="text-sm">
                              {new Date(expense.expense_date).toLocaleDateString('fi-FI')}
                              {expense.description && ` - ${expense.description}`}
                            </span>
                            <span className="font-medium text-red-600">
                              -{Number(expense.amount).toLocaleString('fi-FI')} €
                            </span>
                          </div>
                          {breakdown && (
                            <div className="px-2 pb-2 pt-0">
                              <VastikeBreakdownDisplay breakdown={breakdown} compact />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Ei kuluja
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Maintenance Contact Card */}
            {(property.maintenance_contact_name || property.maintenance_contact_phone || property.maintenance_contact_email) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Huollon yhteystiedot
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {property.maintenance_contact_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{property.maintenance_contact_name}</span>
                    </div>
                  )}
                  {property.maintenance_contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${property.maintenance_contact_phone}`} className="hover:underline">
                        {property.maintenance_contact_phone}
                      </a>
                    </div>
                  )}
                  {property.maintenance_contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${property.maintenance_contact_email}`} className="hover:underline">
                        {property.maintenance_contact_email}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Property Manager Card */}
            {(property.property_manager_company || property.property_manager_name || property.property_manager_phone || property.property_manager_email) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Isännöitsijä
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {property.property_manager_company && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{property.property_manager_company}</span>
                    </div>
                  )}
                  {property.property_manager_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{property.property_manager_name}</span>
                    </div>
                  )}
                  {property.property_manager_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${property.property_manager_phone}`} className="hover:underline">
                        {property.property_manager_phone}
                      </a>
                    </div>
                  )}
                  {property.property_manager_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${property.property_manager_email}`} className="hover:underline">
                        {property.property_manager_email}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
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

        <TabsContent value="rent" className="space-y-4">
          {propertyPendingIncreases.length > 0 && (
            <PendingIncreasesWidget increases={propertyPendingIncreases} />
          )}

          <RentIncreaseHistory propertyId={id} />
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
