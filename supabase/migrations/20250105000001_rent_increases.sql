-- Add rent increase fields to rent_schedules table
ALTER TABLE public.rent_schedules
ADD COLUMN IF NOT EXISTS increase_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS increase_type TEXT CHECK (increase_type IN ('index_tied', 'contract_based', NULL)),
ADD COLUMN IF NOT EXISTS increase_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS increase_date_type TEXT CHECK (increase_date_type IN ('lease_anniversary', 'manual', NULL)),
ADD COLUMN IF NOT EXISTS next_increase_date DATE,
ADD COLUMN IF NOT EXISTS last_increase_date DATE,
ADD COLUMN IF NOT EXISTS increase_notes TEXT;

-- Create rent_increase_history table to track all increases
CREATE TABLE IF NOT EXISTS public.rent_increase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  old_schedule_id UUID REFERENCES public.rent_schedules(id) ON DELETE SET NULL,
  new_schedule_id UUID REFERENCES public.rent_schedules(id) ON DELETE SET NULL,
  old_amount DECIMAL NOT NULL,
  new_amount DECIMAL NOT NULL,
  increase_percentage DECIMAL(5,2) NOT NULL,
  increase_type TEXT NOT NULL,
  increase_date DATE NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  applied_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.rent_increase_history ENABLE ROW LEVEL SECURITY;

-- Rent increase history policies
CREATE POLICY "Users can view own rent increase history"
  ON public.rent_increase_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own rent increase history"
  ON public.rent_increase_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_rent_increase_history_property_id ON public.rent_increase_history(property_id);
CREATE INDEX idx_rent_increase_history_tenant_id ON public.rent_increase_history(tenant_id);
CREATE INDEX idx_rent_increase_history_user_id ON public.rent_increase_history(user_id);
CREATE INDEX idx_rent_increase_history_increase_date ON public.rent_increase_history(increase_date);
CREATE INDEX idx_rent_schedules_next_increase_date ON public.rent_schedules(next_increase_date) WHERE next_increase_date IS NOT NULL;

-- Function to get pending rent increases
CREATE OR REPLACE FUNCTION get_pending_rent_increases(user_uuid UUID)
RETURNS TABLE (
  schedule_id UUID,
  property_id UUID,
  property_name TEXT,
  tenant_id UUID,
  tenant_name TEXT,
  current_amount DECIMAL,
  increase_percentage DECIMAL,
  new_amount DECIMAL,
  next_increase_date DATE,
  increase_type TEXT,
  days_until_increase INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rs.id as schedule_id,
    rs.property_id,
    p.name as property_name,
    rs.tenant_id,
    CONCAT(t.first_name, ' ', t.last_name) as tenant_name,
    rs.amount as current_amount,
    rs.increase_percentage,
    ROUND(rs.amount * (1 + rs.increase_percentage / 100), 2) as new_amount,
    rs.next_increase_date,
    rs.increase_type,
    (rs.next_increase_date - CURRENT_DATE)::INTEGER as days_until_increase
  FROM public.rent_schedules rs
  JOIN public.properties p ON rs.property_id = p.id
  LEFT JOIN public.tenants t ON rs.tenant_id = t.id
  WHERE rs.user_id = user_uuid
    AND rs.is_active = true
    AND rs.increase_enabled = true
    AND rs.next_increase_date IS NOT NULL
    AND rs.next_increase_date <= (CURRENT_DATE + INTERVAL '90 days')
  ORDER BY rs.next_increase_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
