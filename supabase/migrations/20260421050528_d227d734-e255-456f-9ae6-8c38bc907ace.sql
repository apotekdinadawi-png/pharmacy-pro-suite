-- Allow updates/deletes on GRN tables for edit functionality
CREATE POLICY "Authenticated can update grn" ON public.grn_entries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete grn" ON public.grn_entries FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated can update grn_items" ON public.grn_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete grn_items" ON public.grn_items FOR DELETE TO authenticated USING (true);