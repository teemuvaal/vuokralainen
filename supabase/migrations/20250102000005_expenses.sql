-- Create expense categories table
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  icon TEXT
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  amount DECIMAL NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurring_day INTEGER CHECK (recurring_day IS NULL OR (recurring_day >= 1 AND recurring_day <= 31)),
  receipt_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Expense categories policies (users can see system categories + their own)
CREATE POLICY "Users can view system and own categories"
  ON public.expense_categories
  FOR SELECT
  USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own categories"
  ON public.expense_categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can update own categories"
  ON public.expense_categories
  FOR UPDATE
  USING (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can delete own categories"
  ON public.expense_categories
  FOR DELETE
  USING (auth.uid() = user_id AND is_system = false);

-- Expenses policies
CREATE POLICY "Users can view own expenses"
  ON public.expenses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own expenses"
  ON public.expenses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON public.expenses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON public.expenses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_property_id ON public.expenses(property_id);
CREATE INDEX idx_expenses_category_id ON public.expenses(category_id);
CREATE INDEX idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX idx_expense_categories_user_id ON public.expense_categories(user_id);

-- Insert default system expense categories (Finnish names as values, but identifiers in English)
INSERT INTO public.expense_categories (id, user_id, name, is_system, icon) VALUES
  (gen_random_uuid(), NULL, 'Vastike', true, 'building'),
  (gen_random_uuid(), NULL, 'Laina', true, 'landmark'),
  (gen_random_uuid(), NULL, 'Korjaukset', true, 'wrench'),
  (gen_random_uuid(), NULL, 'Vakuutus', true, 'shield'),
  (gen_random_uuid(), NULL, 'Verot', true, 'receipt'),
  (gen_random_uuid(), NULL, 'Sähkö', true, 'zap'),
  (gen_random_uuid(), NULL, 'Vesi', true, 'droplets'),
  (gen_random_uuid(), NULL, 'Internet', true, 'wifi'),
  (gen_random_uuid(), NULL, 'Muu', true, 'more-horizontal');
