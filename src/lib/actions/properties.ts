'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createProperty(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ei kirjautunut sisään' }
  }

  const data = {
    user_id: user.id,
    name: formData.get('name') as string,
    address: formData.get('address') as string || null,
    city: formData.get('city') as string || null,
    postal_code: formData.get('postalCode') as string || null,
    property_type: formData.get('propertyType') as string || null,
    size_sqm: formData.get('sizeSqm') ? Number(formData.get('sizeSqm')) : null,
    purchase_price: formData.get('purchasePrice') ? Number(formData.get('purchasePrice')) : null,
    purchase_date: formData.get('purchaseDate') as string || null,
    maintenance_contact_name: formData.get('maintenanceContactName') as string || null,
    maintenance_contact_phone: formData.get('maintenanceContactPhone') as string || null,
    maintenance_contact_email: formData.get('maintenanceContactEmail') as string || null,
    property_manager_name: formData.get('propertyManagerName') as string || null,
    property_manager_phone: formData.get('propertyManagerPhone') as string || null,
    property_manager_email: formData.get('propertyManagerEmail') as string || null,
    property_manager_company: formData.get('propertyManagerCompany') as string || null,
    notes: formData.get('notes') as string || null,
  }

  const { error } = await supabase.from('properties').insert(data as never)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/properties')
  redirect('/app/properties')
}

export async function updateProperty(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ei kirjautunut sisään' }
  }

  const data = {
    name: formData.get('name') as string,
    address: formData.get('address') as string || null,
    city: formData.get('city') as string || null,
    postal_code: formData.get('postalCode') as string || null,
    property_type: formData.get('propertyType') as string || null,
    size_sqm: formData.get('sizeSqm') ? Number(formData.get('sizeSqm')) : null,
    purchase_price: formData.get('purchasePrice') ? Number(formData.get('purchasePrice')) : null,
    purchase_date: formData.get('purchaseDate') as string || null,
    maintenance_contact_name: formData.get('maintenanceContactName') as string || null,
    maintenance_contact_phone: formData.get('maintenanceContactPhone') as string || null,
    maintenance_contact_email: formData.get('maintenanceContactEmail') as string || null,
    property_manager_name: formData.get('propertyManagerName') as string || null,
    property_manager_phone: formData.get('propertyManagerPhone') as string || null,
    property_manager_email: formData.get('propertyManagerEmail') as string || null,
    property_manager_company: formData.get('propertyManagerCompany') as string || null,
    notes: formData.get('notes') as string || null,
  }

  const { error } = await supabase
    .from('properties')
    .update(data as never)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/properties')
  revalidatePath(`/app/properties/${id}`)
  redirect(`/app/properties/${id}`)
}

export async function deleteProperty(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ei kirjautunut sisään' }
  }

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/properties')
  redirect('/app/properties')
}
