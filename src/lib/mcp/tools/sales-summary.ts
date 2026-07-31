import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "sales_summary",
  title: "Ringkasan penjualan",
  description:
    "Ringkasan omzet penjualan pada rentang tanggal tertentu: total transaksi, total omzet, rata-rata nilai transaksi, dan rincian per metode pembayaran.",
  inputSchema: {
    start_date: z.string().trim().describe("Tanggal mulai ISO (YYYY-MM-DD). Kosongkan untuk 30 hari terakhir."),
    end_date: z.string().trim().describe("Tanggal akhir ISO (YYYY-MM-DD). Kosongkan untuk hari ini."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ start_date, end_date }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const end = end_date || new Date().toISOString().slice(0, 10);
    const start =
      start_date || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("transactions")
      .select("id, date, total, payment_method, kasir")
      .gte("date", start)
      .lte("date", `${end}T23:59:59`)
      .order("date", { ascending: false })
      .limit(2000);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const rows = data ?? [];
    const total = rows.reduce((s, r) => s + Number(r.total || 0), 0);
    const byMethod: Record<string, { count: number; total: number }> = {};
    for (const r of rows) {
      const key = r.payment_method || "lainnya";
      byMethod[key] = byMethod[key] || { count: 0, total: 0 };
      byMethod[key].count += 1;
      byMethod[key].total += Number(r.total || 0);
    }
    const summary = {
      start_date: start,
      end_date: end,
      transaction_count: rows.length,
      total_revenue: total,
      average_transaction: rows.length ? Math.round(total / rows.length) : 0,
      by_payment_method: byMethod,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary) }],
      structuredContent: summary,
    };
  },
});
