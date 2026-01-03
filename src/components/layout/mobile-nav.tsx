'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Building2,
  LayoutDashboard,
  Home,
  Users,
  Wallet,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { signOut } from '@/lib/actions/auth'

const navigation = [
  { name: 'Kojelauta', href: '/app', icon: LayoutDashboard },
  { name: 'Kohteet', href: '/app/properties', icon: Home },
  { name: 'Vuokralaiset', href: '/app/tenants', icon: Users },
  { name: 'Vuokrat', href: '/app/rent', icon: Wallet },
  { name: 'Kulut', href: '/app/expenses', icon: Receipt },
  { name: 'Raportit', href: '/app/reports', icon: BarChart3 },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          <span className="font-bold">Vuokralainen</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Avaa valikko</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex items-center gap-2 px-6 py-4 border-b">
              <Building2 className="h-6 w-6" />
              <span className="font-bold">Vuokralainen</span>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/app' && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="px-4 py-4 border-t space-y-1">
              <Link
                href="/app/settings"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === '/app/settings'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Settings className="h-5 w-5" />
                Asetukset
              </Link>
              <form action={signOut}>
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-5 w-5" />
                  Kirjaudu ulos
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
