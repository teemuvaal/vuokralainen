-- Create rent schedules table
CREATE TABLE IF NOT EXISTS public.rent_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL NOT NULL,
  due_day INTEGER DEFAULT 1 CHECK (due_day >= 1 AND due_day <= 31),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create rent payments table
CREATE TABLE IF NOT EXISTS public.rent_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  schedule_id UUID REFERENCES public.rent_schedules(id) ON DELETE SET NULL,
  amount DECIMAL NOT NULL,
  expected_amount DECIMAL,
  payment_date DATE NOT NULL,
  period_month INTEGER CHECK (period_month >= 1 AND period_month <= 12),
  period_year INTEGER,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'partial', 'late', 'pending')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.rent_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;

-- Rent schedules policies
CREATE POLICY "Users can view own rent schedules"
  ON public.rent_schedules
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own rent schedules"
  ON public.rent_schedules
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rent schedules"
  ON public.rent_schedules
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rent schedules"
  ON public.rent_schedules
  FOR DELETE
  USING (auth.uid() = user_id);

-- Rent payments policies
CREATE POLICY "Users can view own rent payments"
  ON public.rent_payments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own rent payments"
  ON public.rent_payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rent payments"
  ON public.rent_payments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rent payments"
  ON public.rent_payments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_rent_schedules_property_id ON public.rent_schedules(property_id);
CREATE INDEX idx_rent_schedules_user_id ON public.rent_schedules(user_id);
CREATE INDEX idx_rent_payments_property_id ON public.rent_payments(property_id);
CREATE INDEX idx_rent_payments_user_id ON public.rent_payments(user_id);
CREATE INDEX idx_rent_payments_period ON public.rent_payments(period_year, period_month);
