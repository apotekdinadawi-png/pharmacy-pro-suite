import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_drugs",
  title: "Cari obat",
  description:
    "Cari obat di inventaris apotek berdasarkan nama, kandungan aktif, atau kategori. Mengembalikan stok, satuan dasar, harga jual, dan rak.",
  inputSchema: {
    query: z.string().trim().describe("Kata kunci nama obat / kandungan aktif. Kosongkan untuk semua obat."),
    limit: z.number().int().describe("Jumlah maksimum hasil (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const take = Math.min(Math.max(limit || 20, 1), 100);
    let q = supabase
      .from("drugs")
      .select("id, name, active_ingredient, category, stock, base_unit, sell_price, min_stock, rack")
      .order("name")
      .limit(take);
    if (query) q = q.or(`name.ilike.%${query}%,active_ingredient.ilike.%${query}%,category.ilike.%${query}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { drugs: data ?? [] },
    };
  },
});
