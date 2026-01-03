'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, Download, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { deletePropertyDocument, getDocumentDownloadUrl } from '@/lib/actions/documents'
import { Database } from '@/lib/database.types'
import { formatDistanceToNow } from 'date-fns'

type PropertyDocument = Database['public']['Tables']['property_documents']['Row']

interface DocumentListProps {
  documents: PropertyDocument[]
  propertyId: string
  onDocumentDeleted?: () => void
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  contract: 'Contract',
  minutes: 'Minutes',
  invoice: 'Invoice',
  inspection_report: 'Inspection Report',
  insurance: 'Insurance',
  deed: 'Deed',
  tax_document: 'Tax Document',
  other: 'Other',
}

export function DocumentList({ documents, propertyId, onDocumentDeleted }: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    setDeletingId(documentId)

    try {
      await deletePropertyDocument(documentId, propertyId)
      toast.success('Document deleted successfully')
      onDocumentDeleted?.()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete document')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownload = async (documentId: string, fileName: string) => {
    setDownloadingId(documentId)

    try {
      const downloadUrl = await getDocumentDownloadUrl(documentId, propertyId)

      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Download started')
    } catch (error) {
      console.error('Download error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to download document')
    } finally {
      setDownloadingId(null)
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown'
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(2)} KB`
    return `${(kb / 1024).toFixed(2)} MB`
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No documents</h3>
        <p className="text-sm text-muted-foreground">
          Upload documents like contracts, minutes, and invoices
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {document.name}
                </div>
              </TableCell>
              <TableCell>
                {document.document_type ? (
                  <Badge variant="outline">
                    {DOCUMENT_TYPE_LABELS[document.document_type] || document.document_type}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatFileSize(document.file_size)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(document.id, document.name)}
                    disabled={downloadingId === document.id}
                  >
                    {downloadingId === document.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(document.id)}
                    disabled={deletingId === document.id}
                  >
                    {deletingId === document.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
