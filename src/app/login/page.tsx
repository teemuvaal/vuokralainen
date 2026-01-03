import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'
import { Building2 } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Vuokralainen</h1>
          </div>
          <p className="text-muted-foreground text-center">
            Hallitse vuokra-asuntojasi helposti
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Tervetuloa</CardTitle>
            <CardDescription>
              Kirjaudu sisään tai luo uusi tili
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Kirjaudu</TabsTrigger>
                <TabsTrigger value="register">Rekisteröidy</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
