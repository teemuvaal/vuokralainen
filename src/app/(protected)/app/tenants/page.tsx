import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { TenantCard } from '@/components/tenants/tenant-card'
import { TenantForm } from '@/components/tenants/tenant-form'
import { createTenant } from '@/lib/actions/tenants'
import { Plus, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Database } from '@/lib/database.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type Tenant = Database['public']['Tables']['tenants']['Row']
type Property = Database['public']['Tables']['properties']['Row']

export default async function TenantsPage() {
  const supabase = await createClient()

  const { data: tenantsData } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: propertiesData } = await supabase
    .from('properties')
    .select('*')
    .order('name')

  const tenants = tenantsData as Tenant[] | null
  const properties = propertiesData as Property[] | null

  const activeTenants = tenants?.filter((t) => t.is_active) || []
  const inactiveTenants = tenants?.filter((t) => !t.is_active) || []

  // Create property lookup
  const propertyMap = (properties || []).reduce((acc, property) => {
    acc[property.id] = property
    return acc
  }, {} as Record<string, Property>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vuokralaiset</h1>
          <p className="text-muted-foreground">
            Hallitse vuokralaisiasi
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Lisää vuokralainen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Lisää uusi vuokralainen</DialogTitle>
              <DialogDescription>
                Täytä vuokralaisen tiedot
              </DialogDescription>
            </DialogHeader>
            <TenantForm properties={properties || []} action={createTenant} />
          </DialogContent>
        </Dialog>
      </div>

      {tenants && tenants.length > 0 ? (
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Aktiiviset ({activeTenants.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Entiset ({inactiveTenants.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeTenants.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeTenants.map((tenant) => (
                  <TenantCard
                    key={tenant.id}
                    tenant={tenant}
                    property={tenant.property_id ? propertyMap[tenant.property_id] : null}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Ei aktiivisia vuokralaisia</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="inactive">
            {inactiveTenants.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inactiveTenants.map((tenant) => (
                  <TenantCard
                    key={tenant.id}
                    tenant={tenant}
                    property={tenant.property_id ? propertyMap[tenant.property_id] : null}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Ei entisiä vuokralaisia</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Ei vuokralaisia</h2>
          <p className="text-muted-foreground mb-4">
            Aloita lisäämällä ensimmäinen vuokralainen
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Lisää vuokralainen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Lisää uusi vuokralainen</DialogTitle>
                <DialogDescription>
                  Täytä vuokralaisen tiedot
                </DialogDescription>
              </DialogHeader>
              <TenantForm properties={properties || []} action={createTenant} />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}
