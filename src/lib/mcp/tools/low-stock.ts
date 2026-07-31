import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "low_stock_report",
  title: "Laporan stok menipis",
  description:
    "Daftar obat yang stoknya berada pada atau di bawah stok minimum, untuk perencanaan pengadaan.",
  inputSchema: {
    limit: z.number().int().describe("Jumlah maksimum hasil (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("drugs")
      .select("id, name, category, stock, min_stock, base_unit, rack")
      .order("stock", { ascending: true })
      .limit(500);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const take = Math.min(Math.max(limit || 50, 1), 200);
    const low = (data ?? []).filter((d) => Number(d.stock) <= Number(d.min_stock)).slice(0, take);
    return {
      content: [{ type: "text", text: JSON.stringify(low) }],
      structuredContent: { items: low, count: low.length },
    };
  },
});
