'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'
import type { VastikeBreakdown } from '@/lib/types'

type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']
type ExpenseCategoryInsert = Database['public']['Tables']['expense_categories']['Insert']

export async function createExpense(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ei kirjautunut sisään' }
  }

  // Handle vastike breakdown if present
  let vastikeBreakdown: VastikeBreakdown | null = null
  const hasBreakdown = formData.get('hasVastikeBreakdown') === 'true'

  if (hasBreakdown) {
    const yhtiövastike = Number(formData.get('yhtiövastike')) || 0
    const rahoitusvastike = Number(formData.get('rahoitusvastike')) || 0
    const saunamaksu = Number(formData.get('saunamaksu')) || 0
    const vesimaksu = Number(formData.get('vesimaksu')) || 0

    // Validate sum matches total amount
    const breakdownSum = yhtiövastike + rahoitusvastike + saunamaksu + vesimaksu
    const amount = Number(formData.get('amount'))

    if (Math.abs(breakdownSum - amount) > 0.01) {
      return {
        error: `Vastikkeen osat (${breakdownSum.toFixed(2)} €) eivät täsmää kokonaissumman (${amount.toFixed(2)} €) kanssa`
      }
    }

    vastikeBreakdown = {
      yhtiövastike,
      rahoitusvastike,
      saunamaksu,
      vesimaksu,
    }
  }

  const data: ExpenseInsert = {
    user_id: user.id,
    property_id: formData.get('propertyId') as string || null,
    category_id: formData.get('categoryId') as string || null,
    amount: Number(formData.get('amount')),
    description: formData.get('description') as string || null,
    expense_date: formData.get('expenseDate') as string,
    is_recurring: formData.get('isRecurring') === 'true',
    recurring_day: formData.get('recurringDay') ? Number(formData.get('recurringDay')) : null,
    vastike_breakdown: vastikeBreakdown as never,
  }

  const { error } = await supabase.from('expenses').insert(data as never)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/expenses')
  revalidatePath('/app')
  return { success: true }
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ei kirjautunut sisään' }
  }

  // Handle vastike breakdown if present
  let vastikeBreakdown: VastikeBreakdown | null = null
  const hasBreakdown = formData.get('hasVastikeBreakdown') === 'true'

  if (hasBreakdown) {
    const yhtiövastike = Number(formData.get('yhtiövastike')) || 0
    const rahoitusvastike = Number(formData.get('rahoitusvastike')) || 0
    const saunamaksu = Number(formData.get('saunamaksu')) || 0
    const vesimaksu = Number(formData.get('vesimaksu')) || 0

    // Validate sum matches total amount
    const breakdownSum = yhtiövastike + rahoitusvastike + saunamaksu + vesimaksu
    const amount = Number(formData.get('amount'))

    if (Math.abs(breakdownSum - amount) > 0.01) {
      return {
        error: `Vastikkeen osat (${breakdownSum.toFixed(2)} €) eivät täsmää kokonaissumman (${amount.toFixed(2)} €) kanssa`
      }
    }

    vastikeBreakdown = {
      yhtiövastike,
      rahoitusvastike,
      saunamaksu,
      vesimaksu,
    }
  }

  const data: ExpenseUpdate = {
    property_id: formData.get('propertyId') as string || null,
    category_id: formData.get('categoryId') as string || null,
    amount: Number(formData.get('amount')),
    description: formData.get('description') as string || null,
    expense_date: formData.get('expenseDate') as string,
    is_recurring: formData.get('isRecurring') === 'true',
    recurring_day: formData.get('recurringDay') ? Number(formData.get('recurringDay')) : null,
    vastike_breakdown: vastikeBreakdown as any,
  }

  const { error } = await supabase
    .from('expenses')
    .update(data as never)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/expenses')
  revalidatePath('/app')
  return { success: true }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ei kirjautunut sisään' }
  }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/expenses')
  revalidatePath('/app')
  return { success: true }
}

export async function createExpenseCategory(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Ei kirjautunut sisään' }
  }

  const data = {
    user_id: user.id,
    name: formData.get('name') as string,
    icon: formData.get('icon') as string || null,
    is_system: false,
  }

  const { error } = await supabase.from('expense_categories').insert(data as never)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/expenses')
  return { success: true }
}
