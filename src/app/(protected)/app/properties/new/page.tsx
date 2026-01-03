import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PropertyForm } from '@/components/properties/property-form'
import { createProperty } from '@/lib/actions/properties'
import { ArrowLeft } from 'lucide-react'

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/properties">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lisää uusi kohde</h1>
          <p className="text-muted-foreground">
            Täytä kohteen tiedot
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kohteen tiedot</CardTitle>
          <CardDescription>
            Syötä vuokra-asunnon perustiedot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PropertyForm action={createProperty} />
        </CardContent>
      </Card>
    </div>
  )
}
