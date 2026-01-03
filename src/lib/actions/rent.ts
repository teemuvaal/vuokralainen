'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createRentSchedule(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ei kirjautunut sisään' }
  }

  const data = {
    user_id: user.id,
    property_id: formData.get('propertyId') as string,
    tenant_id: formData.get('tenantId') as string || null,
    amount: Number(formData.get('amount')),
    due_day: Number(formData.get('dueDay')) || 1,
    start_date: formData.get('startDate') as string,
    end_date: formData.get('endDate') as string || null,
    is_active: true,
  }

  const { error } = await supabase.from('rent_schedules').insert(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/rent')
  return { success: true }
}

export async function createRentPayment(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ei kirjautunut sisään' }
  }

  const paymentDate = new Date(formData.get('paymentDate') as string)

  const data = {
    user_id: user.id,
    property_id: formData.get('propertyId') as string,
    tenant_id: formData.get('tenantId') as string || null,
    schedule_id: formData.get('scheduleId') as string || null,
    amount: Number(formData.get('amount')),
    expected_amount: formData.get('expectedAmount') ? Number(formData.get('expectedAmount')) : null,
    payment_date: formData.get('paymentDate') as string,
    period_month: paymentDate.getMonth() + 1,
    period_year: paymentDate.getFullYear(),
    status: formData.get('status') as string || 'received',
    notes: formData.get('notes') as string || null,
  }

  const { error } = await supabase.from('rent_payments').insert(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/rent')
  revalidatePath('/app')
  return { success: true }
}

export async function deleteRentPayment(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ei kirjautunut sisään' }
  }

  const { error } = await supabase
    .from('rent_payments')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/rent')
  revalidatePath('/app')
  return { success: true }
}

export async function updateRentSchedule(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ei kirjautunut sisään' }
  }

  const data = {
    property_id: formData.get('propertyId') as string,
    tenant_id: formData.get('tenantId') as string || null,
    amount: Number(formData.get('amount')),
    due_day: Number(formData.get('dueDay')) || 1,
    start_date: formData.get('startDate') as string,
    end_date: formData.get('endDate') as string || null,
    is_active: formData.get('isActive') === 'true',
  }

  const { error } = await supabase
    .from('rent_schedules')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/rent')
  return { success: true }
}
