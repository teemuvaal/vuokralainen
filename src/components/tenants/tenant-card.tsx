import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Home, Euro } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Tenant = Database['public']['Tables']['tenants']['Row']
type Property = Database['public']['Tables']['properties']['Row']

interface TenantCardProps {
  tenant: Tenant
  property?: Property | null
}

export function TenantCard({ tenant, property }: TenantCardProps) {
  return (
    <Link href={`/app/tenants/${tenant.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">
                {tenant.first_name} {tenant.last_name}
              </CardTitle>
            </div>
            <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
              {tenant.is_active ? 'Aktiivinen' : 'Ei aktiivinen'}
            </Badge>
          </div>
          {property && (
            <CardDescription className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              {property.name}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            {tenant.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {tenant.email}
              </div>
            )}
            {tenant.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {tenant.phone}
              </div>
            )}
            {tenant.monthly_rent && (
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4" />
                {Number(tenant.monthly_rent).toLocaleString('fi-FI')} €/kk
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
