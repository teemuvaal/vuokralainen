import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Key, Bell } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single()

  const profile = profileData as Profile | null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Asetukset</h1>
        <p className="text-muted-foreground">
          Hallitse tilisi asetuksia
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profiili</CardTitle>
            </div>
            <CardDescription>
              Perustiedot tililtäsi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Sähköposti</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nimi</Label>
                <Input
                  id="fullName"
                  defaultValue={profile?.full_name || ''}
                  placeholder="Nimesi"
                />
              </div>
            </div>
            <Button>Tallenna muutokset</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle>Turvallisuus</CardTitle>
            </div>
            <CardDescription>
              Salasana ja kirjautumisasetukset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Salasana</Label>
              <p className="text-sm text-muted-foreground">
                Vaihda salasanasi säännöllisesti turvallisuuden parantamiseksi.
              </p>
              <Button variant="outline">Vaihda salasana</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Ilmoitukset</CardTitle>
            </div>
            <CardDescription>
              Sähköposti-ilmoitusten asetukset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ilmoitusasetukset tulevat saataville myöhemmin.
            </p>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Tilin tiedot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tili luotu</span>
              <span>
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('fi-FI')
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Viimeksi päivitetty</span>
              <span>
                {profile?.updated_at
                  ? new Date(profile.updated_at).toLocaleDateString('fi-FI')
                  : '-'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
