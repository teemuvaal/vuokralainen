import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TenantForm } from '@/components/tenants/tenant-form'
import { updateTenant, deleteTenant } from '@/lib/actions/tenants'
import type { Database } from '@/lib/database.types'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Home,
  Calendar,
  Euro,
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

type Tenant = Database['public']['Tables']['tenants']['Row']
type Property = Database['public']['Tables']['properties']['Row']
type RentPayment = Database['public']['Tables']['rent_payments']['Row']
type TenantDocument = Database['public']['Tables']['tenant_documents']['Row']

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: tenantData } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single()

  if (!tenantData) {
    notFound()
  }

  const tenant = tenantData as Tenant

  const { data: propertiesData } = await supabase
    .from('properties')
    .select('*')
    .order('name')

  const properties = propertiesData as Property[] | null

  // Get property info
  const property = tenant.property_id
    ? properties?.find((p) => p.id === tenant.property_id)
    : null

  // Get rent payments for this tenant
  const { data: paymentsData } = await supabase
    .from('rent_payments')
    .select('*')
    .eq('tenant_id', id)
    .order('payment_date', { ascending: false })
    .limit(10)

  const rentPayments = paymentsData as RentPayment[] | null

  // Get documents
  const { data: documentsData } = await supabase
    .from('tenant_documents')
    .select('*')
    .eq('tenant_id', id)
    .order('uploaded_at', { ascending: false })

  const documents = documentsData as TenantDocument[] | null

  const updateTenantWithId = updateTenant.bind(null, id)

  async function handleDelete() {
    'use server'
    await deleteTenant(id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app/tenants">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {tenant.first_name} {tenant.last_name}
              </h1>
              <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
                {tenant.is_active ? 'Aktiivinen' : 'Ei aktiivinen'}
              </Badge>
            </div>
            {property && (
              <Link
                href={`/app/properties/${property.id}`}
                className="text-muted-foreground flex items-center gap-1 hover:underline"
              >
                <Home className="h-4 w-4" />
                {property.name}
              </Link>
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
              <DialogTitle>Poista vuokralainen</DialogTitle>
              <DialogDescription>
                Haluatko varmasti poistaa vuokralaisen &quot;{tenant.first_name} {tenant.last_name}&quot;?
                Tätä toimintoa ei voi perua.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <form action={handleDelete}>
                <Button type="submit" variant="destructive">
                  Poista vuokralainen
                </Button>
              </form>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Yleiskatsaus</TabsTrigger>
          <TabsTrigger value="payments">Maksut</TabsTrigger>
          <TabsTrigger value="documents">Asiakirjat</TabsTrigger>
          <TabsTrigger value="edit">Muokkaa</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Yhteystiedot</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Nimi</p>
                  <p className="font-medium">{tenant.first_name} {tenant.last_name}</p>
                </div>
              </div>

              {tenant.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sähköposti</p>
                    <a href={`mailto:${tenant.email}`} className="font-medium hover:underline">
                      {tenant.email}
                    </a>
                  </div>
                </div>
              )}

              {tenant.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Puhelin</p>
                    <a href={`tel:${tenant.phone}`} className="font-medium hover:underline">
                      {tenant.phone}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lease Info */}
          <Card>
            <CardHeader>
              <CardTitle>Vuokrasopimus</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Alkaa</p>
                  <p className="font-medium">
                    {tenant.lease_start
                      ? new Date(tenant.lease_start).toLocaleDateString('fi-FI')
                      : '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Päättyy</p>
                  <p className="font-medium">
                    {tenant.lease_end
                      ? new Date(tenant.lease_end).toLocaleDateString('fi-FI')
                      : 'Toistaiseksi'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Euro className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Kuukausivuokra</p>
                  <p className="font-medium">
                    {tenant.monthly_rent
                      ? `${Number(tenant.monthly_rent).toLocaleString('fi-FI')} €`
                      : '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Euro className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Vakuusmaksu</p>
                  <p className="font-medium">
                    {tenant.deposit_amount
                      ? `${Number(tenant.deposit_amount).toLocaleString('fi-FI')} €`
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {tenant.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Muistiinpanot</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{tenant.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Maksuhisoria</CardTitle>
              <CardDescription>Vuokralaisen maksuhistoria</CardDescription>
            </CardHeader>
            <CardContent>
              {rentPayments && rentPayments.length > 0 ? (
                <div className="space-y-2">
                  {rentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">
                          {payment.period_month && payment.period_year
                            ? `${payment.period_month}/${payment.period_year}`
                            : new Date(payment.payment_date).toLocaleDateString('fi-FI')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Maksettu {new Date(payment.payment_date).toLocaleDateString('fi-FI')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={payment.status === 'received' ? 'default' : 'secondary'}>
                          {payment.status === 'received'
                            ? 'Maksettu'
                            : payment.status === 'partial'
                              ? 'Osittain'
                              : payment.status === 'late'
                                ? 'Myöhässä'
                                : 'Odottaa'}
                        </Badge>
                        <p className="font-medium text-green-600 mt-1">
                          {Number(payment.amount).toLocaleString('fi-FI')} €
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Ei maksuja
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Asiakirjat</CardTitle>
              <CardDescription>
                Vuokrasopimukset ja muut asiakirjat
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.document_type || 'Muu'} •{' '}
                            {new Date(doc.uploaded_at).toLocaleDateString('fi-FI')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Ei asiakirjoja. Lataa vuokrasopimus tai muita dokumentteja.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Muokkaa vuokralaisen tietoja</CardTitle>
              <CardDescription>
                Päivitä vuokralaisen tiedot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TenantForm
                tenant={tenant}
                properties={properties || []}
                action={updateTenantWithId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
