'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { signup } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Luodaan tiliä...
        </>
      ) : (
        'Luo tili'
      )}
    </Button>
  )
}

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Nimi</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Matti Meikäläinen"
          required
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Sähköposti</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="nimi@esimerkki.fi"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Salasana</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">
          Vähintään 6 merkkiä
        </p>
      </div>

      <SubmitButton />
    </form>
  )
}
