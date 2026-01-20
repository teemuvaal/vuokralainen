import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Building2, TrendingUp, Users, Receipt, FileText, Wallet, BarChart3, Sparkles, Calendar, PiggyBank } from 'lucide-react'

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
            Kattava vuokra-asuntojen hallintajärjestelmä
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Hallitse vuokrakohteita, vuokralaisia ja taloutta yhdessä paikassa.
            Tekoälyavusteinen kulujen kirjaus, automaattinen vuokrankorotusseuranta
            ja kattavat raportit auttavat pitämään sijoituksesi hallinnassa.
          </p>
          <Link href="/login">
            <Button size="lg">
              Aloita ilmaiseksi
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          <div className="p-6 rounded-lg border bg-card">
            <Building2 className="h-10 w-10 mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Kohteiden hallinta</h3>
            <p className="text-sm text-muted-foreground">
              Lisää ja hallitse vuokra-asuntojasi yhdessä paikassa. Tallenna kohdetiedot,
              liitä dokumentteja ja seuraa jokaisen kohteen kannattavuutta erikseen.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <Users className="h-10 w-10 mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Vuokralaishallinta</h3>
            <p className="text-sm text-muted-foreground">
              Pidä kirjaa vuokralaisista, vuokrasopimuksista ja yhteystiedoista.
              Näe vuokralaiskohtaiset maksutiedot ja sopimushistoria yhdellä silmäyksellä.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <Wallet className="h-10 w-10 mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Vuokraseuranta</h3>
            <p className="text-sm text-muted-foreground">
              Kirjaa vuokramaksut, seuraa maksuaikatauluja ja näe kuukausittaiset
              vuokratulot. Helppo näkymä odottaviin ja maksettuihin vuokriin.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <Calendar className="h-10 w-10 mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Vuokrankorotukset</h3>
            <p className="text-sm text-muted-foreground">
              Aseta automaattiset vuokrankorotukset elinkustannusindeksin tai
              kiinteän prosentin mukaan. Järjestelmä muistuttaa tulevista korotuksista
              ja auttaa niiden toteuttamisessa.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <Receipt className="h-10 w-10 mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Kulujen kirjaus</h3>
            <p className="text-sm text-muted-foreground">
              Kirjaa kulut kätevästi käsin tai skannaa kuitit tekoälyn avulla.
              Tallenna yhtiövastikkeiden ja lainanhoitokulujen erittely automaattisesti.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <PiggyBank className="h-10 w-10 mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Kulujen erittely</h3>
            <p className="text-sm text-muted-foreground">
              Kirjaa yhtiövastikkeiden (hoitovastike, pääomavastike, lämmitysvastike)
              ja lainanhoitokulujen (korko, lyhennys, marginaali) erittely tarkasti.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <BarChart3 className="h-10 w-10 mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Raportit ja analytiikka</h3>
            <p className="text-sm text-muted-foreground">
              Selkeät raportit tuloista ja menoista kuukausittain ja vuosittain.
              Kohdekohtainen erittely auttaa tunnistamaan kannattavimmat sijoitukset.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <FileText className="h-10 w-10 mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Dokumenttien hallinta</h3>
            <p className="text-sm text-muted-foreground">
              Tallenna vuokrasopimukset, kuitit ja muut tärkeät dokumentit
              suoraan kohteen tietoihin. Kaikki materiaali aina käden ulottuvilla.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <Sparkles className="h-10 w-10 mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Tekoälyavusteisuus</h3>
            <p className="text-sm text-muted-foreground">
              Skannaa kuitit kameralla ja anna tekoälyn tunnistaa summa,
              päivämäärä ja kategoria automaattisesti. Säästä aikaa kirjaamisessa.
            </p>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="max-w-4xl mx-auto mt-16 p-8 rounded-lg border bg-card">
          <h2 className="text-2xl font-bold mb-4 text-center">Miksi Vuokralainen?</h2>
          <div className="grid md:grid-cols-2 gap-6 text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Kojelauta</h3>
              <p className="text-sm mb-4">
                Aloitusnäkymä näyttää yhdellä silmäyksellä kohteiden määrän,
                aktiiviset vuokralaiset, kuukauden tulot ja nettotuloksen.
              </p>

              <h3 className="font-semibold text-foreground mb-2">Kattavat erittelyt</h3>
              <p className="text-sm">
                Tallenna tarkasti yhtiövastikkeiden ja lainanhoitokulujen
                erittely. Hyödyllistä verotusta ja kassavirtalaskelmia varten.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Helppokäyttöinen</h3>
              <p className="text-sm mb-4">
                Selkeä ja intuitiivinen käyttöliittymä tekee vuokra-asuntojen
                hallinnasta vaivatonta. Kaikki tärkeä tieto löytyy nopeasti.
              </p>

              <h3 className="font-semibold text-foreground mb-2">Turvallinen</h3>
              <p className="text-sm">
                Kaikki tietosi on turvallisesti tallessa ja varmuuskopioitu.
                Pääset tietoihisi käsiksi mistä tahansa, milloin tahansa.
              </p>
            </div>
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
