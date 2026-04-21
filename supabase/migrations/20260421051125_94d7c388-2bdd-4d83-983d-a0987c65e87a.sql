CREATE POLICY "Authenticated can update transactions" ON public.transactions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete transactions" ON public.transactions FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated can update transaction_items" ON public.transaction_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete transaction_items" ON public.transaction_items FOR DELETE TO authenticated USING (true);