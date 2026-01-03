import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin, Ruler } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Property = Database['public']['Tables']['properties']['Row']

const propertyTypeLabels: Record<string, string> = {
  apartment: 'Kerrostalo',
  row_house: 'Rivitalo',
  house: 'Omakotitalo',
  studio: 'Yksiö',
  other: 'Muu',
}

interface PropertyCardProps {
  property: Property
  tenantCount?: number
}

export function PropertyCard({ property, tenantCount = 0 }: PropertyCardProps) {
  const fullAddress = [property.address, property.postal_code, property.city]
    .filter(Boolean)
    .join(', ')

  return (
    <Link href={`/app/properties/${property.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{property.name}</CardTitle>
            </div>
            {property.property_type && (
              <Badge variant="secondary">
                {propertyTypeLabels[property.property_type] || property.property_type}
              </Badge>
            )}
          </div>
          {fullAddress && (
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {fullAddress}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {property.size_sqm && (
              <div className="flex items-center gap-1">
                <Ruler className="h-4 w-4" />
                {property.size_sqm} m²
              </div>
            )}
            <div>
              {tenantCount} {tenantCount === 1 ? 'vuokralainen' : 'vuokralaista'}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
