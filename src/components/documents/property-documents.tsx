'use client'

import { useState, useEffect } from 'react'
import { DocumentUpload } from './document-upload'
import { DocumentList } from './document-list'
import { getPropertyDocuments } from '@/lib/actions/documents'
import { Database } from '@/lib/database.types'

type PropertyDocument = Database['public']['Tables']['property_documents']['Row']

interface PropertyDocumentsProps {
  propertyId: string
  initialDocuments: PropertyDocument[]
}

export function PropertyDocuments({ propertyId, initialDocuments }: PropertyDocumentsProps) {
  const [documents, setDocuments] = useState<PropertyDocument[]>(initialDocuments)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshDocuments = async () => {
    setIsRefreshing(true)
    try {
      const updatedDocuments = await getPropertyDocuments(propertyId)
      setDocuments(updatedDocuments)
    } catch (error) {
      console.error('Error refreshing documents:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-4">
      <DocumentUpload propertyId={propertyId} onUploadComplete={refreshDocuments} />
      <DocumentList
        documents={documents}
        propertyId={propertyId}
        onDocumentDeleted={refreshDocuments}
      />
    </div>
  )
}
