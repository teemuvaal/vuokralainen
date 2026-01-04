-- Add JSONB column for vastike (housing company fee) breakdown to expenses table

-- Add vastike_breakdown column
ALTER TABLE public.expenses
  ADD COLUMN vastike_breakdown JSONB;

-- Add check constraint to ensure breakdown components are non-negative numbers
ALTER TABLE public.expenses
  ADD CONSTRAINT vastike_breakdown_format
    CHECK (
      vastike_breakdown IS NULL OR (
        jsonb_typeof(vastike_breakdown) = 'object' AND
        (vastike_breakdown->>'yhtiövastike')::DECIMAL >= 0 AND
        (vastike_breakdown->>'rahoitusvastike')::DECIMAL >= 0 AND
        (vastike_breakdown->>'saunamaksu')::DECIMAL >= 0 AND
        (vastike_breakdown->>'vesimaksu')::DECIMAL >= 0
      )
    );

-- Create function to validate breakdown sum equals total amount
CREATE OR REPLACE FUNCTION validate_vastike_breakdown()
RETURNS TRIGGER AS $$
DECLARE
  breakdown_sum DECIMAL;
BEGIN
  IF NEW.vastike_breakdown IS NOT NULL THEN
    breakdown_sum :=
      COALESCE((NEW.vastike_breakdown->>'yhtiövastike')::DECIMAL, 0) +
      COALESCE((NEW.vastike_breakdown->>'rahoitusvastike')::DECIMAL, 0) +
      COALESCE((NEW.vastike_breakdown->>'saunamaksu')::DECIMAL, 0) +
      COALESCE((NEW.vastike_breakdown->>'vesimaksu')::DECIMAL, 0);

    IF ABS(breakdown_sum - NEW.amount) > 0.01 THEN
      RAISE EXCEPTION 'Vastike breakdown sum (%) must equal expense amount (%)', breakdown_sum, NEW.amount;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to validate breakdown
CREATE TRIGGER validate_expense_vastike_breakdown
  BEFORE INSERT OR UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION validate_vastike_breakdown();

-- Add GIN index for querying expenses with breakdowns
CREATE INDEX idx_expenses_vastike_breakdown ON public.expenses USING GIN (vastike_breakdown);
