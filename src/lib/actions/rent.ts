'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { PendingIncrease } from '@/lib/types/rent-increases'

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

// Calculate next increase date based on lease start and date type
function calculateNextIncreaseDate(
  leaseStartDate: string,
  dateType: 'lease_anniversary' | 'manual',
  manualDate?: string | null,
  lastIncreaseDate?: string | null
): string | null {
  if (dateType === 'manual' && manualDate) {
    return manualDate
  }

  if (dateType === 'lease_anniversary') {
    const leaseStart = new Date(leaseStartDate)
    const today = new Date()
    const referenceDate = lastIncreaseDate ? new Date(lastIncreaseDate) : leaseStart

    // Calculate next anniversary
    let nextDate = new Date(referenceDate)
    nextDate.setFullYear(nextDate.getFullYear() + 1)

    // If next anniversary is in the past, keep adding years
    while (nextDate <= today) {
      nextDate.setFullYear(nextDate.getFullYear() + 1)
    }

    return nextDate.toISOString().split('T')[0]
  }

  return null
}

// Update rent schedule with increase settings
export async function updateRentIncreaseSettings(scheduleId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ei kirjautunut sisään' }
  }

  // Get schedule to access lease start date
  const { data: schedule } = await supabase
    .from('rent_schedules')
    .select('*, tenants(lease_start)')
    .eq('id', scheduleId)
    .eq('user_id', user.id)
    .single()

  if (!schedule) {
    return { error: 'Vuokrasopimusta ei löytynyt' }
  }

  const enabled = formData.get('increaseEnabled') === 'true'
  const type = formData.get('increaseType') as string | null
  const percentage = formData.get('increasePercentage') ? Number(formData.get('increasePercentage')) : null
  const dateType = formData.get('increaseDateType') as 'lease_anniversary' | 'manual' | null
  const manualDate = formData.get('nextIncreaseDate') as string | null
  const notes = formData.get('increaseNotes') as string | null

  let nextIncreaseDate: string | null = null
  if (enabled && dateType) {
    const leaseStart = (schedule.tenants as any)?.lease_start
    if (!leaseStart && dateType === 'lease_anniversary') {
      return { error: 'Vuokralaisen vuokra-ajan aloituspäivä puuttuu' }
    }

    nextIncreaseDate = calculateNextIncreaseDate(
      leaseStart || '',
      dateType,
      manualDate,
      schedule.last_increase_date
    )
  }

  const data = {
    increase_enabled: enabled,
    increase_type: enabled ? type : null,
    increase_percentage: enabled ? percentage : null,
    increase_date_type: enabled ? dateType : null,
    next_increase_date: enabled ? nextIncreaseDate : null,
    increase_notes: enabled ? notes : null,
  }

  const { error } = await supabase
    .from('rent_schedules')
    .update(data)
    .eq('id', scheduleId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/rent')
  revalidatePath('/app/properties')
  return { success: true }
}

// Get pending rent increases
export async function getPendingRentIncreases(): Promise<PendingIncrease[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data, error } = await supabase.rpc('get_pending_rent_increases', {
    user_uuid: user.id
  })

  if (error) {
    console.error('Error fetching pending increases:', error)
    return []
  }

  return data || []
}

// Apply a rent increase (creates new schedule, ends old one, records history)
export async function applyRentIncrease(scheduleId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ei kirjautunut sisään' }
  }

  // Get current schedule
  const { data: currentSchedule, error: fetchError } = await supabase
    .from('rent_schedules')
    .select('*')
    .eq('id', scheduleId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !currentSchedule) {
    return { error: 'Vuokrasopimusta ei löytynyt' }
  }

  if (!currentSchedule.increase_enabled || !currentSchedule.increase_percentage) {
    return { error: 'Vuokrankorotus ei ole käytössä tälle sopimukselle' }
  }

  const increaseDate = formData.get('increaseDate') as string
  const notes = formData.get('notes') as string | null

  // Calculate new amount
  const newAmount = Number(
    (currentSchedule.amount * (1 + currentSchedule.increase_percentage / 100)).toFixed(2)
  )

  // Start transaction-like operations
  // 1. End current schedule
  const endDate = new Date(increaseDate)
  endDate.setDate(endDate.getDate() - 1)

  const { error: updateError } = await supabase
    .from('rent_schedules')
    .update({
      end_date: endDate.toISOString().split('T')[0],
      is_active: false,
    })
    .eq('id', scheduleId)

  if (updateError) {
    return { error: 'Vanhan vuokran päivitys epäonnistui: ' + updateError.message }
  }

  // 2. Create new schedule with increased rent
  const leaseStart = currentSchedule.start_date
  const nextIncreaseDate = calculateNextIncreaseDate(
    leaseStart,
    currentSchedule.increase_date_type || 'manual',
    null,
    increaseDate
  )

  const { data: newSchedule, error: createError } = await supabase
    .from('rent_schedules')
    .insert({
      user_id: user.id,
      property_id: currentSchedule.property_id,
      tenant_id: currentSchedule.tenant_id,
      amount: newAmount,
      due_day: currentSchedule.due_day,
      start_date: increaseDate,
      end_date: currentSchedule.end_date,
      is_active: true,
      increase_enabled: currentSchedule.increase_enabled,
      increase_type: currentSchedule.increase_type,
      increase_percentage: currentSchedule.increase_percentage,
      increase_date_type: currentSchedule.increase_date_type,
      next_increase_date: nextIncreaseDate,
      last_increase_date: increaseDate,
      increase_notes: currentSchedule.increase_notes,
    })
    .select()
    .single()

  if (createError || !newSchedule) {
    return { error: 'Uuden vuokran luonti epäonnistui: ' + createError?.message }
  }

  // 3. Record in history
  const { error: historyError } = await supabase
    .from('rent_increase_history')
    .insert({
      user_id: user.id,
      property_id: currentSchedule.property_id,
      tenant_id: currentSchedule.tenant_id,
      old_schedule_id: scheduleId,
      new_schedule_id: newSchedule.id,
      old_amount: currentSchedule.amount,
      new_amount: newAmount,
      increase_percentage: currentSchedule.increase_percentage,
      increase_type: currentSchedule.increase_type || 'manual',
      increase_date: increaseDate,
      applied_by: user.id,
      notes: notes,
    })

  if (historyError) {
    console.error('Failed to record history:', historyError)
    // Don't fail the whole operation for history recording failure
  }

  revalidatePath('/app/rent')
  revalidatePath('/app/properties')
  return { success: true, newScheduleId: newSchedule.id }
}

// Get rent increase history for a property or tenant
export async function getRentIncreaseHistory(propertyId?: string, tenantId?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  let query = supabase
    .from('rent_increase_history')
    .select('*, properties(name), tenants(first_name, last_name)')
    .eq('user_id', user.id)
    .order('increase_date', { ascending: false })

  if (propertyId) {
    query = query.eq('property_id', propertyId)
  }

  if (tenantId) {
    query = query.eq('tenant_id', tenantId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching increase history:', error)
    return []
  }

  return data || []
}
