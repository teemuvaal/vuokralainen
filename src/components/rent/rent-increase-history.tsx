import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TrendingUp, Calendar } from 'lucide-react'
import { getRentIncreaseHistory } from '@/lib/actions/rent'

interface RentIncreaseHistoryProps {
  propertyId?: string
  tenantId?: string
}

export async function RentIncreaseHistory({ propertyId, tenantId }: RentIncreaseHistoryProps) {
  const history = await getRentIncreaseHistory(propertyId, tenantId)

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Vuokrankorotushistoria
          </CardTitle>
          <CardDescription>Ei vielä toteutettuja korotuksia</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Vuokrankorotushistoria
        </CardTitle>
        <CardDescription>
          {history.length} toteutettua korotusta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Päivämäärä</TableHead>
              {!propertyId && <TableHead>Kohde</TableHead>}
              {!tenantId && <TableHead>Vuokralainen</TableHead>}
              <TableHead>Vanha vuokra</TableHead>
              <TableHead>Uusi vuokra</TableHead>
              <TableHead>Korotus</TableHead>
              <TableHead>Tyyppi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item: any) => {
              const increase = item.new_amount - item.old_amount
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(item.increase_date).toLocaleDateString('fi-FI')}
                    </div>
                  </TableCell>
                  {!propertyId && (
                    <TableCell>{item.properties?.name || '-'}</TableCell>
                  )}
                  {!tenantId && (
                    <TableCell>
                      {item.tenants
                        ? `${item.tenants.first_name} ${item.tenants.last_name}`
                        : '-'}
                    </TableCell>
                  )}
                  <TableCell>{Number(item.old_amount).toLocaleString('fi-FI')} €</TableCell>
                  <TableCell className="font-medium">
                    {Number(item.new_amount).toLocaleString('fi-FI')} €
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-medium">
                        +{increase.toFixed(2)} €
                      </span>
                      <Badge variant="outline">
                        +{item.increase_percentage}%
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {item.increase_type === 'index_tied' ? 'Indeksi' : 'Sopimus'}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
