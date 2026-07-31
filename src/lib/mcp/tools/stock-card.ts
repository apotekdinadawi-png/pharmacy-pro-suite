import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_stock_card",
  title: "Kartu stok obat",
  description:
    "Riwayat kartu stok (masuk, keluar, koreksi) untuk sebuah obat berdasarkan nama, termasuk batch, tanggal kedaluwarsa, dan stok akhir.",
  inputSchema: {
    drug_name: z.string().trim().describe("Nama obat (pencocokan sebagian diperbolehkan)."),
    limit: z.number().int().describe("Jumlah maksimum baris (default 30)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ drug_name, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const take = Math.min(Math.max(limit || 30, 1), 100);
    const { data, error } = await supabase
      .from("stock_cards")
      .select("id, date, drug_name, type, qty, unit, batch, exp_date, stock_after, source, user")
      .ilike("drug_name", `%${drug_name}%`)
      .order("date", { ascending: false })
      .limit(take);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { entries: data ?? [] },
    };
  },
});
