-- Add contact fields to properties table for maintenance and property manager (isännöitsijä)

-- Add maintenance contact fields
ALTER TABLE public.properties
  ADD COLUMN maintenance_contact_name TEXT,
  ADD COLUMN maintenance_contact_phone TEXT,
  ADD COLUMN maintenance_contact_email TEXT;

-- Add property manager (isännöitsijä) fields
ALTER TABLE public.properties
  ADD COLUMN property_manager_name TEXT,
  ADD COLUMN property_manager_phone TEXT,
  ADD COLUMN property_manager_email TEXT,
  ADD COLUMN property_manager_company TEXT;

-- Add email validation constraints
ALTER TABLE public.properties
  ADD CONSTRAINT maintenance_email_format
    CHECK (maintenance_contact_email IS NULL OR maintenance_contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

ALTER TABLE public.properties
  ADD CONSTRAINT manager_email_format
    CHECK (property_manager_email IS NULL OR property_manager_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
