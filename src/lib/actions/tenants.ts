'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createTenant(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ei kirjautunut sisään' }
  }

  const data = {
    user_id: user.id,
    property_id: formData.get('propertyId') as string || null,
    first_name: formData.get('firstName') as string,
    last_name: formData.get('lastName') as string,
    email: formData.get('email') as string || null,
    phone: formData.get('phone') as string || null,
    lease_start: formData.get('leaseStart') as string || null,
    lease_end: formData.get('leaseEnd') as string || null,
    monthly_rent: formData.get('monthlyRent') ? Number(formData.get('monthlyRent')) : null,
    deposit_amount: formData.get('depositAmount') ? Number(formData.get('depositAmount')) : null,
    notes: formData.get('notes') as string || null,
    is_active: true,
  }

  const { error } = await supabase.from('tenants').insert(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/tenants')
  revalidatePath('/app/properties')
  redirect('/app/tenants')
}

export async function updateTenant(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ei kirjautunut sisään' }
  }

  const data = {
    property_id: formData.get('propertyId') as string || null,
    first_name: formData.get('firstName') as string,
    last_name: formData.get('lastName') as string,
    email: formData.get('email') as string || null,
    phone: formData.get('phone') as string || null,
    lease_start: formData.get('leaseStart') as string || null,
    lease_end: formData.get('leaseEnd') as string || null,
    monthly_rent: formData.get('monthlyRent') ? Number(formData.get('monthlyRent')) : null,
    deposit_amount: formData.get('depositAmount') ? Number(formData.get('depositAmount')) : null,
    notes: formData.get('notes') as string || null,
    is_active: formData.get('isActive') === 'true',
  }

  const { error } = await supabase
    .from('tenants')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/tenants')
  revalidatePath('/app/properties')
  revalidatePath(`/app/tenants/${id}`)
  redirect(`/app/tenants/${id}`)
}

export async function deleteTenant(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ei kirjautunut sisään' }
  }

  const { error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/tenants')
  revalidatePath('/app/properties')
  redirect('/app/tenants')
}

export async function toggleTenantActive(id: string, isActive: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ei kirjautunut sisään' }
  }

  const { error } = await supabase
    .from('tenants')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/tenants')
  revalidatePath('/app/properties')
  revalidatePath(`/app/tenants/${id}`)
}
