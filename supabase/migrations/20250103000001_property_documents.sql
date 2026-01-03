-- Create property documents table
CREATE TABLE IF NOT EXISTS public.property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  document_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;

-- Property documents policies
CREATE POLICY "Users can view own property documents"
  ON public.property_documents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own property documents"
  ON public.property_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own property documents"
  ON public.property_documents
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own property documents"
  ON public.property_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_property_documents_property_id ON public.property_documents(property_id);
CREATE INDEX idx_property_documents_user_id ON public.property_documents(user_id);

-- Add comments for documentation
COMMENT ON TABLE public.property_documents IS 'Stores metadata for files attached to properties (contracts, minutes, etc.)';
COMMENT ON COLUMN public.property_documents.document_type IS 'Type of document: contract, minutes, invoice, inspection_report, insurance, deed, tax_document, other';
