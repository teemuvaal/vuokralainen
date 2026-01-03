import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { PropertyCard } from '@/components/properties/property-card'
import { Plus, Building2 } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Property = Database['public']['Tables']['properties']['Row']

export default async function PropertiesPage() {
  const supabase = await createClient()

  const { data: propertiesData } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  const properties = propertiesData as Property[] | null

  // Get tenant counts for each property
  const { data: tenantCountsData } = await supabase
    .from('tenants')
    .select('property_id')
    .eq('is_active', true)

  const tenantCounts = tenantCountsData as { property_id: string | null }[] | null

  const tenantCountMap = (tenantCounts || []).reduce((acc, tenant) => {
    if (tenant.property_id) {
      acc[tenant.property_id] = (acc[tenant.property_id] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kohteet</h1>
          <p className="text-muted-foreground">
            Hallitse vuokra-asuntojasi
          </p>
        </div>
        <Link href="/app/properties/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Lisää kohde
          </Button>
        </Link>
      </div>

      {properties && properties.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              tenantCount={tenantCountMap[property.id] || 0}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Ei kohteita</h2>
          <p className="text-muted-foreground mb-4">
            Aloita lisäämällä ensimmäinen vuokra-asuntosi
          </p>
          <Link href="/app/properties/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Lisää kohde
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
