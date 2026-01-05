'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/database.types'

type PropertyDocument = Database['public']['Tables']['property_documents']['Row']

export async function getPropertyDocuments(propertyId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('property_documents')
    .select('*')
    .eq('property_id', propertyId)
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deletePropertyDocument(documentId: string, propertyId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get document to verify ownership and get file path
  const { data: document, error: fetchError } = await supabase
    .from('property_documents')
    .select('*')
    .eq('id', documentId)
    .eq('property_id', propertyId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !document) {
    throw new Error('Document not found or access denied')
  }

  const doc = document as PropertyDocument

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([doc.file_path])

  if (storageError) {
    console.error('Storage deletion error:', storageError)
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('property_documents')
    .delete()
    .eq('id', documentId)

  if (dbError) {
    throw new Error(dbError.message)
  }

  revalidatePath(`/app/properties/${propertyId}`)
  return { success: true }
}

export async function getDocumentDownloadUrl(documentId: string, propertyId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get document to verify ownership
  const { data: document, error: fetchError } = await supabase
    .from('property_documents')
    .select('*')
    .eq('id', documentId)
    .eq('property_id', propertyId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !document) {
    throw new Error('Document not found or access denied')
  }

  const doc = document as PropertyDocument

  // Get signed URL for download
  const { data: signedUrlData, error: urlError } = await supabase.storage
    .from('documents')
    .createSignedUrl(doc.file_path, 60) // 60 seconds expiry

  if (urlError || !signedUrlData) {
    throw new Error('Failed to generate download URL')
  }

  return signedUrlData.signedUrl
}
