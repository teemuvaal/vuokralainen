import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Building2, TrendingUp, Users, Receipt } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            <span className="font-bold text-lg">Vuokralainen</span>
          </div>
          <Link href="/login">
            <Button>Kirjaudu sisään</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4 sm:text-5xl">
            Vuokra-asuntojen hallinta helposti
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Seuraa vuokria, kuluja ja vuokralaisia yhdessä paikassa.
            Saat selkeän kuvan sijoitustesi tuotosta.
          </p>
          <Link href="/login">
            <Button size="lg">
              Aloita ilmaiseksi
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="p-6 rounded-lg border bg-card">
            <Building2 className="h-10 w-10 mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Kohteiden hallinta</h3>
            <p className="text-sm text-muted-foreground">
              Lisää ja hallitse vuokra-asuntojasi yhdessä paikassa.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <Users className="h-10 w-10 mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Vuokralaiset</h3>
            <p className="text-sm text-muted-foreground">
              Pidä kirjaa vuokralaisista, sopimuksista ja yhteystiedoista.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <TrendingUp className="h-10 w-10 mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Vuokraseuranta</h3>
            <p className="text-sm text-muted-foreground">
              Seuraa vuokrien maksuja ja näe tuotot kuukausitasolla.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <Receipt className="h-10 w-10 mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Kulujen kirjaus</h3>
            <p className="text-sm text-muted-foreground">
              Kirjaa kulut ja skannaa kuitit tekoälyn avulla.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Vuokralainen. Kaikki oikeudet pidätetään.</p>
        </div>
      </footer>
    </div>
  )
}
