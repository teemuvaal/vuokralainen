'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReceiptScanner } from '@/components/expenses/receipt-scanner'
import { ExpenseForm } from '@/components/expenses/expense-form'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'

type Property = Database['public']['Tables']['properties']['Row']
type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row']

interface ScanResult {
  amount: number
  date: string
  confidence: number
}

export default function ScanReceiptPage() {
  const router = useRouter()
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  async function handleScanComplete(result: ScanResult) {
    setScanResult(result)

    // Load form data if not already loaded
    if (!dataLoaded) {
      const supabase = createClient()
      const [propertiesRes, categoriesRes] = await Promise.all([
        supabase.from('properties').select('*').order('name'),
        supabase.from('expense_categories').select('*').order('name'),
      ])
      setProperties(propertiesRes.data || [])
      setCategories(categoriesRes.data || [])
      setDataLoaded(true)
    }
  }

  function handleFormSuccess() {
    router.push('/app/expenses')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/expenses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Skannaa kuitti</h1>
          <p className="text-muted-foreground">
            Ota kuva kuitista, niin tekoäly lukee summan ja päivämäärän
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kuitti</CardTitle>
            <CardDescription>
              Ota kuva tai valitse kuva kuitista
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReceiptScanner onScanComplete={handleScanComplete} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kulun tiedot</CardTitle>
            <CardDescription>
              {scanResult
                ? 'Tarkista tiedot ja lisää puuttuvat kentät'
                : 'Skannaa ensin kuitti, tai täytä tiedot manuaalisesti'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoaded ? (
              <ExpenseForm
                properties={properties}
                categories={categories}
                defaultAmount={scanResult?.amount}
                defaultDate={scanResult?.date}
                onSuccess={handleFormSuccess}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Skannaa kuitti aloittaaksesi</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
