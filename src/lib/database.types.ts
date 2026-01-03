export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          user_id: string
          name: string
          address: string | null
          city: string | null
          postal_code: string | null
          property_type: string | null
          size_sqm: number | null
          purchase_price: number | null
          purchase_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          address?: string | null
          city?: string | null
          postal_code?: string | null
          property_type?: string | null
          size_sqm?: number | null
          purchase_price?: number | null
          purchase_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          address?: string | null
          city?: string | null
          postal_code?: string | null
          property_type?: string | null
          size_sqm?: number | null
          purchase_price?: number | null
          purchase_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          user_id: string
          property_id: string | null
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          lease_start: string | null
          lease_end: string | null
          monthly_rent: number | null
          deposit_amount: number | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id?: string | null
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          lease_start?: string | null
          lease_end?: string | null
          monthly_rent?: number | null
          deposit_amount?: number | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string | null
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          lease_start?: string | null
          lease_end?: string | null
          monthly_rent?: number | null
          deposit_amount?: number | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tenant_documents: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          name: string
          file_path: string
          document_type: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          name: string
          file_path: string
          document_type?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          name?: string
          file_path?: string
          document_type?: string | null
          uploaded_at?: string
        }
      }
      property_documents: {
        Row: {
          id: string
          property_id: string
          user_id: string
          name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          document_type: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          property_id: string
          user_id: string
          name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          document_type?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string
          name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          document_type?: string | null
          uploaded_at?: string
        }
      }
      rent_schedules: {
        Row: {
          id: string
          property_id: string
          tenant_id: string | null
          user_id: string
          amount: number
          due_day: number
          start_date: string
          end_date: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          tenant_id?: string | null
          user_id: string
          amount: number
          due_day?: number
          start_date: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          tenant_id?: string | null
          user_id?: string
          amount?: number
          due_day?: number
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      rent_payments: {
        Row: {
          id: string
          property_id: string
          tenant_id: string | null
          user_id: string
          schedule_id: string | null
          amount: number
          expected_amount: number | null
          payment_date: string
          period_month: number | null
          period_year: number | null
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          tenant_id?: string | null
          user_id: string
          schedule_id?: string | null
          amount: number
          expected_amount?: number | null
          payment_date: string
          period_month?: number | null
          period_year?: number | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          tenant_id?: string | null
          user_id?: string
          schedule_id?: string | null
          amount?: number
          expected_amount?: number | null
          payment_date?: string
          period_month?: number | null
          period_year?: number | null
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
      expense_categories: {
        Row: {
          id: string
          user_id: string | null
          name: string
          is_system: boolean
          icon: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          is_system?: boolean
          icon?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          is_system?: boolean
          icon?: string | null
        }
      }
      expenses: {
        Row: {
          id: string
          property_id: string | null
          user_id: string
          category_id: string | null
          amount: number
          description: string | null
          expense_date: string
          is_recurring: boolean
          recurring_day: number | null
          receipt_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id?: string | null
          user_id: string
          category_id?: string | null
          amount: number
          description?: string | null
          expense_date: string
          is_recurring?: boolean
          recurring_day?: number | null
          receipt_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string | null
          user_id?: string
          category_id?: string | null
          amount?: number
          description?: string | null
          expense_date?: string
          is_recurring?: boolean
          recurring_day?: number | null
          receipt_path?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          property_id: string
          user_id: string
          lender: string | null
          original_amount: number | null
          current_balance: number | null
          interest_rate: number | null
          monthly_payment: number | null
          start_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          user_id: string
          lender?: string | null
          original_amount?: number | null
          current_balance?: number | null
          interest_rate?: number | null
          monthly_payment?: number | null
          start_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string
          lender?: string | null
          original_amount?: number | null
          current_balance?: number | null
          interest_rate?: number | null
          monthly_payment?: number | null
          start_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
