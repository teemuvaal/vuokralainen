'use client'

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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/actions/auth'

const navigation = [
  { name: 'Kojelauta', href: '/app', icon: LayoutDashboard },
  { name: 'Kohteet', href: '/app/properties', icon: Home },
  { name: 'Vuokralaiset', href: '/app/tenants', icon: Users },
  { name: 'Vuokrat', href: '/app/rent', icon: Wallet },
  { name: 'Kulut', href: '/app/expenses', icon: Receipt },
  { name: 'Raportit', href: '/app/reports', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-4 border-b">
        <Building2 className="h-6 w-6" />
        <span className="font-bold">Vuokralainen</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/app' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
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

      {/* Bottom section */}
      <div className="px-4 py-4 border-t space-y-1">
        <Link
          href="/app/settings"
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
    </aside>
  )
}
