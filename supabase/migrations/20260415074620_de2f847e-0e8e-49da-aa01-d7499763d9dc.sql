
-- ==================== INVENTARIS ====================

-- Tabel master obat
CREATE TABLE public.drugs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  barcode TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  active_ingredient TEXT NOT NULL DEFAULT '',
  kegunaan TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  base_unit TEXT NOT NULL DEFAULT '',
  sell_price NUMERIC NOT NULL DEFAULT 0,
  rack TEXT NOT NULL DEFAULT '',
  stock NUMERIC NOT NULL DEFAULT 0,
  min_stock NUMERIC NOT NULL DEFAULT 0,
  conversions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view drugs" ON public.drugs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert drugs" ON public.drugs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update drugs" ON public.drugs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete drugs" ON public.drugs FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON public.drugs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabel penerimaan barang (GRN)
CREATE TABLE public.grn_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_no TEXT NOT NULL DEFAULT '',
  supplier_id TEXT NOT NULL DEFAULT '',
  supplier_name TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  top_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.grn_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view grn" ON public.grn_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert grn" ON public.grn_entries FOR INSERT TO authenticated WITH CHECK (true);

-- Item GRN
CREATE TABLE public.grn_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grn_id UUID NOT NULL REFERENCES public.grn_entries(id) ON DELETE CASCADE,
  drug_id TEXT NOT NULL DEFAULT '',
  drug_name TEXT NOT NULL DEFAULT '',
  qty NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT '',
  batch TEXT NOT NULL DEFAULT '',
  exp_date TEXT NOT NULL DEFAULT '',
  buy_price NUMERIC NOT NULL DEFAULT 0,
  buy_price_with_ppn NUMERIC NOT NULL DEFAULT 0,
  previous_buy_price NUMERIC NOT NULL DEFAULT 0,
  price_increased BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.grn_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view grn_items" ON public.grn_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert grn_items" ON public.grn_items FOR INSERT TO authenticated WITH CHECK (true);

-- Kartu stok
CREATE TABLE public.stock_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL DEFAULT '',
  drug_name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'Masuk',
  qty NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT '',
  batch TEXT NOT NULL DEFAULT '',
  exp_date TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  "user" TEXT NOT NULL DEFAULT '',
  stock_after NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view stock_cards" ON public.stock_cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert stock_cards" ON public.stock_cards FOR INSERT TO authenticated WITH CHECK (true);

-- Transaksi
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL DEFAULT '',
  total NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT '',
  kasir TEXT NOT NULL DEFAULT '',
  doctor_name TEXT,
  patient_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view transactions" ON public.transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (true);

-- Item transaksi
CREATE TABLE public.transaction_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  drug_id TEXT NOT NULL DEFAULT '',
  drug_name TEXT NOT NULL DEFAULT '',
  qty NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  subtotal NUMERIC NOT NULL DEFAULT 0
);

ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view transaction_items" ON public.transaction_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert transaction_items" ON public.transaction_items FOR INSERT TO authenticated WITH CHECK (true);

-- Peringatan harga
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drug_name TEXT NOT NULL DEFAULT '',
  old_price NUMERIC NOT NULL DEFAULT 0,
  new_price NUMERIC NOT NULL DEFAULT 0,
  date TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view price_alerts" ON public.price_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert price_alerts" ON public.price_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete price_alerts" ON public.price_alerts FOR DELETE TO authenticated USING (true);

-- ==================== PENGADAAN ====================

-- Supplier / PBF
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  top_days INTEGER NOT NULL DEFAULT 0,
  no_izin_pbf TEXT NOT NULL DEFAULT '',
  no_cdob TEXT NOT NULL DEFAULT '',
  bank_name TEXT NOT NULL DEFAULT '',
  bank_account TEXT NOT NULL DEFAULT '',
  bank_account_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert suppliers" ON public.suppliers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update suppliers" ON public.suppliers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete suppliers" ON public.suppliers FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Surat Pesanan
CREATE TABLE public.sp_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sp_no TEXT NOT NULL DEFAULT '',
  sp_type TEXT NOT NULL DEFAULT 'REG',
  supplier_id TEXT NOT NULL DEFAULT '',
  supplier_name TEXT NOT NULL DEFAULT '',
  apoteker_pemesan TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  printed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sp_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view sp_records" ON public.sp_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert sp_records" ON public.sp_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update sp_records" ON public.sp_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete sp_records" ON public.sp_records FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_sp_records_updated_at BEFORE UPDATE ON public.sp_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Item SP
CREATE TABLE public.sp_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sp_id UUID NOT NULL REFERENCES public.sp_records(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL DEFAULT '',
  qty TEXT NOT NULL DEFAULT '',
  unit TEXT NOT NULL DEFAULT '',
  keterangan TEXT NOT NULL DEFAULT '',
  harga_satuan TEXT NOT NULL DEFAULT '',
  diskon TEXT NOT NULL DEFAULT ''
);

ALTER TABLE public.sp_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view sp_items" ON public.sp_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert sp_items" ON public.sp_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update sp_items" ON public.sp_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete sp_items" ON public.sp_items FOR DELETE TO authenticated USING (true);

-- Invoice tracker
CREATE TABLE public.invoice_trackers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grn_id TEXT NOT NULL DEFAULT '',
  invoice_no TEXT NOT NULL DEFAULT '',
  supplier_name TEXT NOT NULL DEFAULT '',
  total_amount NUMERIC NOT NULL DEFAULT 0,
  receive_date TEXT NOT NULL DEFAULT '',
  due_date TEXT NOT NULL DEFAULT '',
  top_days INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Belum Bayar',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_trackers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view invoice_trackers" ON public.invoice_trackers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert invoice_trackers" ON public.invoice_trackers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update invoice_trackers" ON public.invoice_trackers FOR UPDATE TO authenticated USING (true);

CREATE TRIGGER update_invoice_trackers_updated_at BEFORE UPDATE ON public.invoice_trackers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== PENGATURAN ====================

-- Pengaturan aplikasi (key-value)
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "APJ can manage settings" ON public.app_settings FOR ALL TO authenticated USING (has_role(auth.uid(), 'apj'::app_role)) WITH CHECK (has_role(auth.uid(), 'apj'::app_role));
CREATE POLICY "Authenticated can insert settings" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update settings" ON public.app_settings FOR UPDATE TO authenticated USING (true);

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Master satuan
CREATE TABLE public.master_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.master_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view units" ON public.master_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert units" ON public.master_units FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete units" ON public.master_units FOR DELETE TO authenticated USING (true);

-- Master kategori
CREATE TABLE public.master_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.master_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view categories" ON public.master_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert categories" ON public.master_categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete categories" ON public.master_categories FOR DELETE TO authenticated USING (true);

-- Seed default units
INSERT INTO public.master_units (name) VALUES ('Tablet'), ('Kapsul'), ('Botol'), ('Box'), ('Strip'), ('Tube'), ('Ampul');

-- Seed default categories
INSERT INTO public.master_categories (name) VALUES ('Obat Bebas'), ('Obat Bebas Terbatas'), ('Obat Keras'), ('Obat Narkotika'), ('Obat Psikotropika');

-- Seed default settings
INSERT INTO public.app_settings (key, value) VALUES
  ('business', '{"namaApotek":"Apotek Dinadawi","alamat":"","noSIA":"","ppnPercent":11,"logoUrl":"","email":"","telepon":"","website":"","namaAPJ":"Apt. Madinatul Adawiyah, S.Farm","noSIPA":"","noSTRA":"","apotekerPendamping":[]}'::jsonb),
  ('inventory', '{"stokKritis":10,"reminderKadaluwarsa":3}'::jsonb),
  ('loyalty', '{"pointValue":5000,"goldThreshold":500000}'::jsonb),
  ('receipt', '{"headerLine1":"","headerLine2":"","headerLine3":"","footerLine1":"Terima kasih atas kunjungan Anda","footerLine2":"Semoga lekas sembuh!"}'::jsonb);
