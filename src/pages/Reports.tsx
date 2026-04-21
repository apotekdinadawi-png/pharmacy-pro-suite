import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  BarChart3, TrendingUp, TrendingDown, FileText, Users, Printer,
  ArrowUpRight, ArrowDownRight, Search, Package, Pencil, Trash2, X, Save, Plus
} from "lucide-react";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useInventoryStore, type TransactionRecord } from "@/stores/useInventoryStore";
import { formatRupiah } from "@/lib/currency";
import { useCanEdit } from "@/hooks/useCanEdit";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const fmtRp = (n: number) => formatRupiah(n);

// ========== EDIT TRANSACTION MODAL ==========
type TxItem = TransactionRecord['items'][number];
const EditTransactionModal = ({ tx, onClose }: { tx: TransactionRecord; onClose: () => void }) => {
  const { drugs, updateTransaction } = useInventoryStore();
  const { profile } = useAuthContext();
  const userName = profile?.full_name || profile?.username || 'Admin';

  const [form, setForm] = useState<Omit<TransactionRecord, 'id'>>({
    date: tx.date,
    items: tx.items.map((i) => ({ ...i })),
    total: tx.total,
    paymentMethod: tx.paymentMethod,
    kasir: tx.kasir,
    doctorName: tx.doctorName,
    patientName: tx.patientName,
  });

  const recalcTotal = (items: TxItem[]) => items.reduce((s, i) => s + i.subtotal, 0);

  const updateItem = (idx: number, field: keyof TxItem, value: any) => {
    const items = [...form.items];
    const it: any = { ...items[idx], [field]: value };
    if (field === 'qty' || field === 'price') {
      it.subtotal = (Number(it.qty) || 0) * (Number(it.price) || 0);
    }
    items[idx] = it;
    setForm({ ...form, items, total: recalcTotal(items) });
  };

  const removeItem = (idx: number) => {
    const items = form.items.filter((_, i) => i !== idx);
    setForm({ ...form, items, total: recalcTotal(items) });
  };

  const addItem = (drugId: string) => {
    const d = drugs.find((x) => x.id === drugId);
    if (!d) return;
    const items = [...form.items, { drugId: d.id, drugName: d.name, qty: 1, unit: d.baseUnit, price: d.sellPrice, subtotal: d.sellPrice }];
    setForm({ ...form, items, total: recalcTotal(items) });
  };

  const handleSave = async () => {
    if (form.items.length === 0) { toast({ title: "Error", description: "Minimal harus ada 1 item.", variant: "destructive" }); return; }
    try {
      await updateTransaction(tx.id, form, userName);
      toast({ title: "Transaksi Diperbarui", description: "Stok telah di-rollback dan disesuaikan." });
      onClose();
    } catch (e: any) {
      toast({ title: "Gagal", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Transaksi — {tx.date} ({tx.kasir})</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Tanggal</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Metode Pembayaran</Label>
              <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tunai">Tunai</SelectItem>
                  <SelectItem value="Debit">Debit</SelectItem>
                  <SelectItem value="QRIS">QRIS</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Kasir</Label>
              <Input value={form.kasir} onChange={(e) => setForm({ ...form, kasir: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Nama Dokter (opsional)</Label>
              <Input value={form.doctorName || ''} onChange={(e) => setForm({ ...form, doctorName: e.target.value || undefined })} />
            </div>
            <div className="space-y-1.5">
              <Label>Nama Pasien (opsional)</Label>
              <Input value={form.patientName || ''} onChange={(e) => setForm({ ...form, patientName: e.target.value || undefined })} />
            </div>
          </div>

          <div className="rounded-lg border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Obat</TableHead>
                  <TableHead className="w-20">Qty</TableHead>
                  <TableHead className="w-24">Satuan</TableHead>
                  <TableHead className="w-28">Harga</TableHead>
                  <TableHead className="w-28 text-right">Subtotal</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.items.map((it, idx) => {
                  const drug = drugs.find((d) => d.id === it.drugId);
                  const oldQty = tx.items[idx]?.qty;
                  const isRacikan = it.drugId.startsWith('racikan-');
                  return (
                    <TableRow key={idx}>
                      <TableCell className="text-xs">
                        <div className="font-medium">{it.drugName}</div>
                        {drug && !isRacikan && <div className="text-muted-foreground">Stok: {drug.stock}</div>}
                        {isRacikan && <div className="text-muted-foreground italic">(racikan — stok tidak diubah)</div>}
                      </TableCell>
                      <TableCell>
                        <Input className="h-9" type="number" value={it.qty} onChange={(e) => updateItem(idx, 'qty', Number(e.target.value))} />
                        {oldQty !== undefined && oldQty !== it.qty && (
                          <div className="text-[10px] text-warning mt-1">Sebelumnya: {oldQty}</div>
                        )}
                      </TableCell>
                      <TableCell><Input className="h-9" value={it.unit} onChange={(e) => updateItem(idx, 'unit', e.target.value)} /></TableCell>
                      <TableCell><Input className="h-9" type="number" value={it.price} onChange={(e) => updateItem(idx, 'price', Number(e.target.value))} /></TableCell>
                      <TableCell className="text-right text-sm font-medium">{fmtRp(it.subtotal)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(idx)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">Tambah obat:</Label>
              <Select value="" onValueChange={addItem}>
                <SelectTrigger className="h-9 w-64"><SelectValue placeholder="Pilih obat..." /></SelectTrigger>
                <SelectContent>{drugs.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} (stok: {d.stock})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Baru</p>
              <p className="text-xl font-bold text-primary">{fmtRp(form.total)}</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
            ℹ️ Saat disimpan, sistem akan otomatis mengembalikan stok lama lalu mengurangi stok baru, dan mencatat perubahan di kartu stok sebagai <strong>Koreksi Penjualan</strong>.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> Simpan & Rollback Stok</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


// ========== LABA RUGI (from real transactions) ==========
const LabaRugiTab = () => {
  const { transactions, grnEntries, removeTransaction } = useInventoryStore();
  const canEdit = useCanEdit();
  const { profile } = useAuthContext();
  const userName = profile?.full_name || profile?.username || 'Admin';
  const [editTx, setEditTx] = useState<TransactionRecord | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus transaksi ini? Stok akan dikembalikan dan kartu stok 'Koreksi Penjualan' akan dibuat.")) return;
    try {
      await removeTransaction(id, userName);
      toast({ title: "Transaksi Dihapus", description: "Stok telah dikembalikan." });
    } catch (e: any) {
      toast({ title: "Gagal", description: e.message, variant: "destructive" });
    }
  };

  const totalPendapatan = transactions.reduce((s, t) => s + t.total, 0);
  const totalHPP = grnEntries.reduce((s, g) => s + g.items.reduce((si, i) => si + i.buyPriceWithPPN * i.qty, 0), 0);
  const labaKotor = totalPendapatan - totalHPP;
  const labaBersih = labaKotor; // No operational cost data yet
  const margin = totalPendapatan > 0 ? ((labaBersih / totalPendapatan) * 100).toFixed(1) : '0.0';

  const printLabaRugi = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Laporan Laba Rugi</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;max-width:700px;margin:auto}
      h1{text-align:center;font-size:18px}table{width:100%;border-collapse:collapse;margin:8px 0}td{padding:4px 8px;font-size:13px}
      .right{text-align:right}.bold{font-weight:bold}.total{border-top:2px solid #333}
      .net{font-size:16px;background:#f0f7f0;padding:8px;margin-top:16px;text-align:center;border-radius:4px}</style></head><body>
      <h1>LAPORAN LABA RUGI</h1>
      <table>
        <tr class="bold"><td>Total Pendapatan</td><td class="right">${fmtRp(totalPendapatan)}</td></tr>
        <tr><td>Total HPP (Pembelian)</td><td class="right">${fmtRp(totalHPP)}</td></tr>
        <tr class="bold total"><td>LABA KOTOR</td><td class="right">${fmtRp(labaKotor)}</td></tr>
      </table>
      <div class="net"><strong>LABA BERSIH: ${fmtRp(labaBersih)}</strong> (Margin: ${margin}%)</div>
      </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={printLabaRugi}><Printer className="w-4 h-4 mr-1" />Cetak</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Pendapatan</p>
          <p className="text-lg font-bold text-foreground">{fmtRp(totalPendapatan)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">HPP</p>
          <p className="text-lg font-bold text-foreground">{fmtRp(totalHPP)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Laba Kotor</p>
          <p className="text-lg font-bold text-foreground">{fmtRp(labaKotor)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Laba Bersih</p>
          <p className={`text-lg font-bold ${labaBersih >= 0 ? "text-primary" : "text-destructive"}`}>{fmtRp(labaBersih)}</p>
          <p className="text-xs text-muted-foreground">Margin {margin}%</p>
        </CardContent></Card>
      </div>

      {transactions.length === 0 && (
        <Card><CardContent className="text-center py-12 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Belum ada data transaksi. Laporan akan terisi otomatis setelah ada penjualan.</p>
        </CardContent></Card>
      )}

      {transactions.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Riwayat Transaksi Terbaru</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kasir</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(-20).reverse().map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="text-xs">{t.date}</TableCell>
                    <TableCell className="text-sm">{t.kasir}</TableCell>
                    <TableCell><Badge variant="outline">{t.paymentMethod}</Badge></TableCell>
                    <TableCell className="text-right font-medium">{fmtRp(t.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ========== FAST/SLOW MOVING (from real data) ==========
const FastSlowTab = () => {
  const { transactions, drugs } = useInventoryStore();
  const [view, setView] = useState<"fast" | "slow">("fast");

  // Calculate item sales from real transactions
  const itemSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  transactions.forEach(t => {
    t.items.forEach(item => {
      if (!itemSales[item.drugId]) {
        itemSales[item.drugId] = { name: item.drugName, qty: 0, revenue: 0 };
      }
      itemSales[item.drugId].qty += item.qty;
      itemSales[item.drugId].revenue += item.subtotal;
    });
  });

  const sorted = Object.entries(itemSales)
    .map(([id, data]) => ({ id, ...data, stock: drugs.find(d => d.id === id)?.stock || 0 }))
    .sort((a, b) => view === "fast" ? b.qty - a.qty : a.qty - b.qty)
    .slice(0, 20);

  const chartConfig = { qty: { label: "Terjual", color: "hsl(var(--primary))" } };
  const chartData = sorted.slice(0, 7).map(i => ({
    nama: i.name.length > 15 ? i.name.slice(0, 15) + "…" : i.name,
    qty: i.qty,
  }));

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        <Button size="sm" variant={view === "fast" ? "default" : "ghost"} onClick={() => setView("fast")}>
          <TrendingUp className="w-4 h-4 mr-1" />Fast Moving
        </Button>
        <Button size="sm" variant={view === "slow" ? "default" : "ghost"} onClick={() => setView("slow")}>
          <TrendingDown className="w-4 h-4 mr-1" />Slow Moving
        </Button>
      </div>

      {sorted.length === 0 ? (
        <Card><CardContent className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Belum ada data penjualan. Data akan muncul setelah ada transaksi.</p>
        </CardContent></Card>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">{view === "fast" ? "Top Fast Moving" : "Slow Moving Items"}</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <BarChart data={chartData} layout="vertical" margin={{ left: 100, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="nama" width={95} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="qty" fill="var(--color-qty)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Nama Obat</TableHead>
                    <TableHead className="text-right">Terjual</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Sisa Stok</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((item, i) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{i + 1}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.qty}</TableCell>
                      <TableCell className="text-right">{fmtRp(item.revenue)}</TableCell>
                      <TableCell className="text-right">{item.stock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

// ========== KASIR PERFORMANCE (from real data) ==========
const KasirTab = () => {
  const { transactions } = useInventoryStore();

  const kasirMap: Record<string, { transaksi: number; total: number }> = {};
  transactions.forEach(t => {
    if (!kasirMap[t.kasir]) kasirMap[t.kasir] = { transaksi: 0, total: 0 };
    kasirMap[t.kasir].transaksi += 1;
    kasirMap[t.kasir].total += t.total;
  });

  const kasirData = Object.entries(kasirMap)
    .map(([nama, data]) => ({ nama, ...data, rata2: data.transaksi > 0 ? Math.round(data.total / data.transaksi) : 0 }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-4">
      {kasirData.length === 0 ? (
        <Card><CardContent className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Belum ada data performa kasir. Data muncul setelah ada transaksi.</p>
        </CardContent></Card>
      ) : (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Performa Kasir</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kasir</TableHead>
                  <TableHead className="text-right">Transaksi</TableHead>
                  <TableHead className="text-right">Total Penjualan</TableHead>
                  <TableHead className="text-right">Rata-rata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kasirData.map(k => (
                  <TableRow key={k.nama}>
                    <TableCell className="font-medium">{k.nama}</TableCell>
                    <TableCell className="text-right">{k.transaksi}</TableCell>
                    <TableCell className="text-right">{fmtRp(k.total)}</TableCell>
                    <TableCell className="text-right">{fmtRp(k.rata2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ========== MAIN ==========
const Reports = () => (
  <div className="p-6 animate-fade-in">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Laporan</h1>
        <p className="text-sm text-muted-foreground">Laporan laba rugi, fast/slow moving, dan performa kasir — semua dari data real.</p>
      </div>
    </div>

    <Tabs defaultValue="laba-rugi" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="laba-rugi" className="text-xs sm:text-sm"><BarChart3 className="w-4 h-4 mr-1 hidden sm:inline" />Laba Rugi</TabsTrigger>
        <TabsTrigger value="fast-slow" className="text-xs sm:text-sm"><TrendingUp className="w-4 h-4 mr-1 hidden sm:inline" />Fast/Slow Moving</TabsTrigger>
        <TabsTrigger value="kasir" className="text-xs sm:text-sm"><Users className="w-4 h-4 mr-1 hidden sm:inline" />Per Kasir</TabsTrigger>
      </TabsList>
      <TabsContent value="laba-rugi"><LabaRugiTab /></TabsContent>
      <TabsContent value="fast-slow"><FastSlowTab /></TabsContent>
      <TabsContent value="kasir"><KasirTab /></TabsContent>
    </Tabs>
  </div>
);

export default Reports;
