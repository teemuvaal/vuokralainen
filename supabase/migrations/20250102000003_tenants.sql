-- Create tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  lease_start DATE,
  lease_end DATE,
  monthly_rent DECIMAL,
  deposit_amount DECIMAL,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create tenant documents table
CREATE TABLE IF NOT EXISTS public.tenant_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  document_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_documents ENABLE ROW LEVEL SECURITY;

-- Tenants policies
CREATE POLICY "Users can view own tenants"
  ON public.tenants
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tenants"
  ON public.tenants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tenants"
  ON public.tenants
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tenants"
  ON public.tenants
  FOR DELETE
  USING (auth.uid() = user_id);

-- Tenant documents policies
CREATE POLICY "Users can view own tenant documents"
  ON public.tenant_documents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tenant documents"
  ON public.tenant_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tenant documents"
  ON public.tenant_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_tenants_user_id ON public.tenants(user_id);
CREATE INDEX idx_tenants_property_id ON public.tenants(property_id);
CREATE INDEX idx_tenant_documents_tenant_id ON public.tenant_documents(tenant_id);
