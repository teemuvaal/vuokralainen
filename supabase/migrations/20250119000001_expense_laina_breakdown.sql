-- Add JSONB column for laina (loan) breakdown to expenses table

-- Add laina_breakdown column
ALTER TABLE public.expenses
  ADD COLUMN laina_breakdown JSONB;

-- Add check constraint to ensure breakdown components are non-negative numbers
ALTER TABLE public.expenses
  ADD CONSTRAINT laina_breakdown_format
    CHECK (
      laina_breakdown IS NULL OR (
        jsonb_typeof(laina_breakdown) = 'object' AND
        (laina_breakdown->>'pääoma')::DECIMAL >= 0 AND
        (laina_breakdown->>'korko')::DECIMAL >= 0
      )
    );

-- Create function to validate breakdown sum equals total amount
CREATE OR REPLACE FUNCTION validate_laina_breakdown()
RETURNS TRIGGER AS $$
DECLARE
  breakdown_sum DECIMAL;
BEGIN
  IF NEW.laina_breakdown IS NOT NULL THEN
    breakdown_sum :=
      COALESCE((NEW.laina_breakdown->>'pääoma')::DECIMAL, 0) +
      COALESCE((NEW.laina_breakdown->>'korko')::DECIMAL, 0);

    IF ABS(breakdown_sum - NEW.amount) > 0.01 THEN
      RAISE EXCEPTION 'Laina breakdown sum (%) must equal expense amount (%)', breakdown_sum, NEW.amount;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to validate breakdown
CREATE TRIGGER validate_expense_laina_breakdown
  BEFORE INSERT OR UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION validate_laina_breakdown();

-- Add GIN index for querying expenses with breakdowns
CREATE INDEX idx_expenses_laina_breakdown ON public.expenses USING GIN (laina_breakdown);
