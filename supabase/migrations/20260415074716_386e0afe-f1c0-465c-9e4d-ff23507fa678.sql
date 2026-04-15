
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  birth_date TEXT NOT NULL DEFAULT '',
  member_id TEXT NOT NULL DEFAULT '',
  tier TEXT NOT NULL DEFAULT 'Bronze',
  points NUMERIC NOT NULL DEFAULT 0,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  total_visits INTEGER NOT NULL DEFAULT 0,
  allergies JSONB NOT NULL DEFAULT '[]'::jsonb,
  medical_notes TEXT NOT NULL DEFAULT '',
  join_date TEXT NOT NULL DEFAULT '',
  last_visit TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update customers" ON public.customers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete customers" ON public.customers FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
