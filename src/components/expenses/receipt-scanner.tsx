'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, Upload, Loader2, CheckCircle2 } from 'lucide-react'

interface ScanResult {
  amount: number
  date: string
  confidence: number
}

interface ReceiptScannerProps {
  onScanComplete: (result: ScanResult) => void
}

export function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Show preview
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setError(null)
    setScanResult(null)
    setIsScanning(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ai/scan-receipt', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Skannaus epäonnistui')
      }

      setScanResult(data)
      onScanComplete(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tuntematon virhe')
    } finally {
      setIsScanning(false)
    }
  }

  function handleCameraClick() {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!previewUrl ? (
        <Card
          className="border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={handleCameraClick}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Camera className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Skannaa kuitti</p>
            <p className="text-sm text-muted-foreground text-center">
              Ota kuva kuitista tai valitse tiedosto
            </p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm">
                <Camera className="mr-2 h-4 w-4" />
                Kamera
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Valitse tiedosto
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-[3/4] max-h-[400px] overflow-hidden rounded-lg border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Kuitti"
              className="object-contain w-full h-full"
            />
            {isScanning && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm font-medium">Luetaan kuittia...</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {scanResult && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p>
                    <strong>Summa:</strong> {scanResult.amount.toLocaleString('fi-FI')} €
                  </p>
                  <p>
                    <strong>Päivämäärä:</strong>{' '}
                    {new Date(scanResult.date).toLocaleDateString('fi-FI')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Luotettavuus: {Math.round(scanResult.confidence * 100)}%
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setPreviewUrl(null)
              setScanResult(null)
              setError(null)
            }}
          >
            Skannaa uusi kuitti
          </Button>
        </div>
      )}
    </div>
  )
}
