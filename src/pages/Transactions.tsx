import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search, Plus, Minus, CreditCard, Banknote, QrCode, Pause, Printer,
  ShoppingCart, FileText, FlaskConical, Sticker, X, UserRound
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useInventoryStore } from "@/stores/useInventoryStore";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatRupiah } from "@/lib/currency";

type CartItem = { drugId: string; name: string; price: number; qty: number; unit: string; aturanPakai?: string };
type PrescriptionData = { doctorName: string; patientName: string; note: string };
type RacikanItem = { drugId: string; qty: string; unit: string };

const printReceipt = (cart: CartItem[], total: number, payment: string, nominalBayar: number, kasirName: string, prescription?: PrescriptionData) => {
  const now = new Date();
  const trxId = `TRX-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
  const { business, receipt } = useSettingsStore.getState();
  const headerName = receipt.headerLine1 || business.namaApotek;
  const headerAddr = receipt.headerLine2 || business.alamat;
  const headerTelp = receipt.headerLine3 || `Telp: ${business.telepon}`;
  const kembalian = nominalBayar - total;

  const w = window.open("", "_blank", "width=400,height=600");
  if (!w) return;
  w.document.write(`
    <html><head><title>Struk</title><style>
      body{font-family:monospace;font-size:12px;padding:20px;max-width:300px;margin:auto}
      .center{text-align:center} .line{border-top:1px dashed #000;margin:8px 0}
      table{width:100%;border-collapse:collapse} td{padding:2px 0}
      .right{text-align:right} .bold{font-weight:bold}
    </style></head><body>
    ${business.logoUrl ? `<div class="center"><img src="${business.logoUrl}" style="height:40px;margin-bottom:4px" /></div>` : ''}
    <div class="center"><b>${headerName}</b><br/>${headerAddr}<br/>${headerTelp}</div>
    ${business.namaAPJ ? `<div class="center" style="font-size:10px">APJ: ${business.namaAPJ} — SIPA: ${business.noSIPA}</div>` : ''}
    <div class="line"></div>
    <div>No: ${trxId}<br/>Tgl: ${now.toLocaleString("id-ID")}<br/>Kasir: ${kasirName}</div>
    ${prescription ? `<div>Dokter: ${prescription.doctorName}<br/>Pasien: ${prescription.patientName}</div>` : ""}
    <div class="line"></div>
    <table>${cart.map((c) => `
      <tr><td colspan="2">${c.name}</td></tr>
      <tr><td>${c.qty} x ${formatRupiah(c.price)}</td><td class="right">${formatRupiah(c.price * c.qty)}</td></tr>
    `).join("")}</table>
    <div class="line"></div>
    <table>
      <tr class="bold"><td>TOTAL</td><td class="right">${formatRupiah(total)}</td></tr>
      <tr><td>Bayar (${payment})</td><td class="right">${formatRupiah(nominalBayar)}</td></tr>
      <tr><td>Kembalian</td><td class="right">${formatRupiah(kembalian)}</td></tr>
    </table>
    <div class="line"></div>
    <div class="center">${receipt.footerLine1}<br/>${receipt.footerLine2}</div>
    </body></html>
  `);
  w.document.close();
  w.print();
};

const printLabel = (cart: CartItem[], apotek: string, patientName?: string) => {
  const items = cart.filter((c) => c.aturanPakai);
  if (items.length === 0) { toast({ title: "Info", description: "Belum ada aturan pakai yang diisi." }); return; }
  const w = window.open("", "_blank", "width=400,height=600");
  if (!w) return;
  w.document.write(`
    <html><head><title>Etiket</title><style>
      body{font-family:sans-serif;font-size:13px;padding:20px}
      .label{border:2px solid #000;padding:12px;margin-bottom:12px;border-radius:6px;max-width:280px}
      .name{font-weight:bold;font-size:14px;margin-bottom:4px}
      .rule{font-size:16px;font-weight:bold;margin:6px 0;color:#222}
    </style></head><body>
    ${items.map((c) => `
      <div class="label">
        <div class="name">${apotek}</div>
        ${patientName ? `<div>Pasien: ${patientName}</div>` : ""}
        <div>${c.name}</div>
        <div class="rule">Aturan Pakai: ${c.aturanPakai}</div>
      </div>
    `).join("")}
    </body></html>
  `);
  w.document.close();
  w.print();
};

const Transactions = () => {
  const { drugs, deductStock, addStockCard, addTransaction } = useInventoryStore();
  const { business, masterData } = useSettingsStore();
  const { profile } = useAuthContext();
  const kasirName = profile?.full_name || profile?.username || 'Kasir';

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [nominalBayar, setNominalBayar] = useState<number>(0);

  const [prescription, setPrescription] = useState<PrescriptionData>({ doctorName: "", patientName: "", note: "" });
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [prescriptionSaved, setPrescriptionSaved] = useState(false);

  const [racikanOpen, setRacikanOpen] = useState(false);
  const [racikanItems, setRacikanItems] = useState<RacikanItem[]>([{ drugId: "", qty: "", unit: "" }]);
  const [jasaRacik, setJasaRacik] = useState("");
  const [racikanName, setRacikanName] = useState("Racikan");

  const [etiketItemId, setEtiketItemId] = useState<string | null>(null);
  const [etiketValue, setEtiketValue] = useState("");

  const filtered = drugs.filter((p) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q) || p.kegunaan.toLowerCase().includes(q);
  });

  const addToCart = (drug: typeof drugs[0]) => {
    if (drug.stock <= 0) { toast({ title: "Stok Habis", description: `${drug.name} stok 0.`, variant: "destructive" }); return; }
    setCart((prev) => {
      const existing = prev.find((c) => c.drugId === drug.id);
      if (existing) {
        if (existing.qty + 1 > drug.stock) { toast({ title: "Stok tidak cukup", variant: "destructive" }); return prev; }
        return prev.map((c) => c.drugId === drug.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { drugId: drug.id, name: drug.name, price: drug.sellPrice, qty: 1, unit: drug.baseUnit }];
    });
  };

  const updateQty = (drugId: string, delta: number) => {
    setCart((prev) => prev.map((c) => c.drugId === drugId ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter((c) => c.qty > 0));
  };

  const setQty = (drugId: string, value: string) => {
    const n = parseFloat(value);
    if (isNaN(n) || n < 0) return;
    const drug = drugs.find((d) => d.id === drugId);
    if (drug && !drugId.startsWith('racikan-') && n > drug.stock) {
      toast({ title: "Stok tidak cukup", description: `Sisa stok ${drug.stock} ${drug.baseUnit}.`, variant: "destructive" });
      return;
    }
    setCart((prev) => prev.map((c) => c.drugId === drugId ? { ...c, qty: n } : c));
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  const addRacikanRow = () => setRacikanItems([...racikanItems, { drugId: "", qty: "", unit: "" }]);
  const updateRacikanRow = (idx: number, field: string, value: string) => { const u = [...racikanItems]; u[idx] = { ...u[idx], [field]: value }; setRacikanItems(u); };
  const removeRacikanRow = (idx: number) => { if (racikanItems.length > 1) setRacikanItems(racikanItems.filter((_, i) => i !== idx)); };

  const racikanTotal = racikanItems.reduce((sum, ri) => {
    const prod = drugs.find((p) => p.id === ri.drugId);
    return sum + (prod ? prod.sellPrice * (parseFloat(ri.qty) || 0) : 0);
  }, 0) + (parseFloat(jasaRacik) || 0);

  const addRacikanToCart = () => {
    const validItems = racikanItems.filter((ri) => ri.drugId && ri.qty);
    if (validItems.length === 0) { toast({ title: "Error", description: "Tambahkan minimal satu obat.", variant: "destructive" }); return; }
    setCart((prev) => [...prev, { drugId: `racikan-${Date.now()}`, name: `🧪 ${racikanName}`, price: racikanTotal, qty: 1, unit: "Racikan" }]);
    setRacikanOpen(false);
    setRacikanItems([{ drugId: "", qty: "", unit: "" }]);
    setJasaRacik("");
    setRacikanName("Racikan");
    toast({ title: "Racikan ditambahkan" });
  };

  const handlePay = (method: string) => {
    if (cart.length === 0) return;
    const bayar = nominalBayar || total;
    if (method === "Tunai" && bayar < total) { toast({ title: "Error", description: "Nominal bayar kurang.", variant: "destructive" }); return; }

    const now = new Date().toISOString().split('T')[0];
    cart.forEach((item) => {
      if (!item.drugId.startsWith('racikan-')) {
        deductStock(item.drugId, item.qty);
        const drug = drugs.find((d) => d.id === item.drugId);
        addStockCard({
          date: now, drugName: item.name, type: 'Keluar', qty: item.qty, unit: item.unit,
          batch: '', expDate: '', source: `Penjualan Kasir`, user: kasirName,
          stockAfter: Math.max(0, (drug?.stock || 0) - item.qty),
        });
      }
    });

    addTransaction({
      date: now,
      items: cart.map((c) => ({ drugId: c.drugId, drugName: c.name, qty: c.qty, unit: c.unit, price: c.price, subtotal: c.price * c.qty })),
      total, paymentMethod: method, kasir: kasirName,
      doctorName: prescriptionSaved ? prescription.doctorName : undefined,
      patientName: prescriptionSaved ? prescription.patientName : undefined,
    });

    printReceipt(cart, total, method, bayar, kasirName, prescriptionSaved ? prescription : undefined);
    toast({ title: "Transaksi Berhasil", description: `${method} — ${formatRupiah(total)}` });
    setCart([]); setNominalBayar(0);
    setPrescription({ doctorName: "", patientName: "", note: "" }); setPrescriptionSaved(false);
  };

  const saveEtiket = (id: string) => {
    setCart((prev) => prev.map((c) => c.drugId === id ? { ...c, aturanPakai: etiketValue } : c));
    setEtiketItemId(null); setEtiketValue("");
    toast({ title: "Etiket Disimpan" });
  };

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-1">Transaksi / Kasir</h1>
      <p className="text-sm text-muted-foreground mb-6">Kasir: <b>{kasirName}</b> — Cari obat berdasarkan nama, barcode, atau kegunaan.</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder='Cari nama, barcode, atau kegunaan...' className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Dialog open={prescriptionOpen} onOpenChange={setPrescriptionOpen}>
              <DialogTrigger asChild>
                <Button variant={prescriptionSaved ? "default" : "outline"} size="sm" className="gap-1.5"><FileText className="w-4 h-4" /> Resep {prescriptionSaved && "✓"}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Input Resep Dokter</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5"><Label>Nama Dokter *</Label><Input value={prescription.doctorName} onChange={(e) => setPrescription({ ...prescription, doctorName: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Nama Pasien *</Label><Input value={prescription.patientName} onChange={(e) => setPrescription({ ...prescription, patientName: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Catatan</Label><Textarea value={prescription.note} onChange={(e) => setPrescription({ ...prescription, note: e.target.value })} /></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setPrescription({ doctorName: "", patientName: "", note: "" }); setPrescriptionSaved(false); setPrescriptionOpen(false); }}>Reset</Button>
                  <Button onClick={() => {
                    if (!prescription.doctorName || !prescription.patientName) { toast({ title: "Error", description: "Nama dokter dan pasien wajib.", variant: "destructive" }); return; }
                    setPrescriptionSaved(true); setPrescriptionOpen(false);
                  }}>Simpan Resep</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={racikanOpen} onOpenChange={setRacikanOpen}>
              <DialogTrigger asChild><Button variant="outline" size="sm" className="gap-1.5"><FlaskConical className="w-4 h-4" /> Racikan</Button></DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Kalkulator Racikan</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5"><Label>Nama Racikan</Label><Input value={racikanName} onChange={(e) => setRacikanName(e.target.value)} /></div>
                  <div className="rounded-lg border overflow-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Obat</TableHead><TableHead className="w-20">Qty</TableHead><TableHead className="w-24">Satuan</TableHead><TableHead className="text-right w-28">Subtotal</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
                      <TableBody>
                        {racikanItems.map((ri, idx) => {
                          const prod = drugs.find((p) => p.id === ri.drugId);
                          const sub = prod ? prod.sellPrice * (parseInt(ri.qty) || 0) : 0;
                          return (
                            <TableRow key={idx}>
                              <TableCell>
                                <Select value={ri.drugId} onValueChange={(v) => updateRacikanRow(idx, "drugId", v)}>
                                  <SelectTrigger className="h-9"><SelectValue placeholder="Pilih obat" /></SelectTrigger>
                                  <SelectContent>{drugs.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell><Input className="h-9" type="number" value={ri.qty} onChange={(e) => updateRacikanRow(idx, "qty", e.target.value)} /></TableCell>
                              <TableCell>
                                <Select value={ri.unit} onValueChange={(v) => updateRacikanRow(idx, "unit", v)}>
                                  <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                                  <SelectContent>{masterData.units.map((u) => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}</SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right text-sm font-medium">{formatRupiah(sub)}</TableCell>
                              <TableCell><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeRacikanRow(idx)} disabled={racikanItems.length === 1}><X className="w-3 h-3" /></Button></TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={addRacikanRow}><Plus className="w-4 h-4 mr-1" /> Tambah Obat</Button>
                    <div className="flex items-center gap-2"><Label className="text-sm whitespace-nowrap">Jasa Racik:</Label><Input className="h-9 w-28" type="number" value={jasaRacik} onChange={(e) => setJasaRacik(e.target.value)} /></div>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-semibold text-foreground">Total Racikan</span>
                    <span className="text-lg font-bold text-primary">{formatRupiah(racikanTotal)}</span>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRacikanOpen(false)}>Batal</Button>
                  <Button onClick={addRacikanToCart}>Tambah ke Keranjang</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {prescriptionSaved && (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 text-sm">
              <UserRound className="w-4 h-4 text-primary" />
              <span className="text-foreground">Resep: <b>dr. {prescription.doctorName}</b> — Pasien: <b>{prescription.patientName}</b></span>
            </div>
          )}

          {search && (
            <p className="text-xs text-muted-foreground">
              Menampilkan {filtered.length} obat untuk "{search}"
              {filtered.length > 0 && filtered.some((p) => p.kegunaan.toLowerCase().includes(search.toLowerCase())) && (
                <span> — <Badge variant="outline" className="text-xs ml-1">kegunaan cocok</Badge></span>
              )}
            </p>
          )}

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {drugs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Belum ada produk. Tambahkan obat di menu Inventaris.</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">Tidak ditemukan obat dengan kata kunci "{search}"</p>
            ) : (
              filtered.map((p) => (
                <Card key={p.id} className={`glass-card cursor-pointer hover:shadow-md transition-shadow ${p.stock <= 0 ? 'opacity-60' : ''}`} onClick={() => addToCart(p)}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{p.name}</p>
                        {p.stock <= 0 && <Badge variant="destructive" className="text-[10px]">Stok Habis</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">Stok: {p.stock.toLocaleString('id-ID')} {p.baseUnit}</p>
                      {p.kegunaan && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.kegunaan.split(',').slice(0, 3).map((k) => (
                            <Badge key={k.trim()} variant="outline" className={`text-[10px] py-0 ${search && k.trim().toLowerCase().includes(search.toLowerCase()) ? "border-primary text-primary" : ""}`}>{k.trim()}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{formatRupiah(p.sellPrice)}</p>
                      <p className="text-xs text-muted-foreground">/{p.baseUnit}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-2">
          <Card className="glass-card sticky top-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" /> Keranjang
                {cart.length > 0 && <Badge className="bg-primary text-primary-foreground text-xs ml-auto">{cart.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cart.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Keranjang kosong.</p>}
              <div className="max-h-[40vh] overflow-y-auto space-y-2 pr-1">
                {cart.map((item) => (
                  <div key={item.drugId} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatRupiah(item.price)} x {item.qty}</p>
                      {item.aturanPakai && <p className="text-xs text-primary mt-0.5">📋 {item.aturanPakai}</p>}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEtiketItemId(item.drugId); setEtiketValue(item.aturanPakai || ""); }}><Sticker className="w-3 h-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQty(item.drugId, -1)}><Minus className="w-3 h-3" /></Button>
                      <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQty(item.drugId, 1)}><Plus className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>

              {etiketItemId !== null && (
                <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1"><Sticker className="w-3 h-3" /> Aturan Pakai</Label>
                  <Select value={etiketValue} onValueChange={setEtiketValue}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Pilih aturan pakai" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3x1 Sesudah Makan">3x1 Sesudah Makan</SelectItem>
                      <SelectItem value="3x1 Sebelum Makan">3x1 Sebelum Makan</SelectItem>
                      <SelectItem value="2x1 Sesudah Makan">2x1 Sesudah Makan</SelectItem>
                      <SelectItem value="2x1 Sebelum Makan">2x1 Sebelum Makan</SelectItem>
                      <SelectItem value="1x1 Sebelum Tidur">1x1 Sebelum Tidur</SelectItem>
                      <SelectItem value="1x1 Pagi Hari">1x1 Pagi Hari</SelectItem>
                      <SelectItem value="Bila Perlu">Bila Perlu</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input className="h-9" placeholder="Atau ketik manual..." value={etiketValue} onChange={(e) => setEtiketValue(e.target.value)} />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setEtiketItemId(null)}>Batal</Button>
                    <Button size="sm" className="flex-1" onClick={() => saveEtiket(etiketItemId)}>Simpan</Button>
                  </div>
                </div>
              )}

              {cart.length > 0 && (
                <>
                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-foreground">Total</span>
                      <span className="text-lg font-bold text-primary">{formatRupiah(total)}</span>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nominal Bayar</Label>
                      <Input type="number" placeholder="Masukkan nominal..." value={nominalBayar || ''} onChange={(e) => setNominalBayar(Number(e.target.value))} className="h-9" />
                    </div>
                    {nominalBayar > 0 && nominalBayar >= total && (
                      <div className="flex justify-between items-center bg-primary/10 rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-foreground">Kembalian</span>
                        <span className="text-lg font-bold text-primary">{formatRupiah(nominalBayar - total)}</span>
                      </div>
                    )}
                    {nominalBayar > 0 && nominalBayar < total && (
                      <p className="text-xs text-destructive">Nominal bayar kurang {formatRupiah(total - nominalBayar)}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handlePay("Tunai")}><Banknote className="w-3 h-3" /> Tunai</Button>
                    <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handlePay("Debit")}><CreditCard className="w-3 h-3" /> Debit</Button>
                    <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handlePay("QRIS")}><QrCode className="w-3 h-3" /> QRIS</Button>
                    <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => toast({ title: "Pending", description: "Transaksi disimpan sementara." })}><Pause className="w-3 h-3" /> Pending</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="w-full gap-2" onClick={() => handlePay("Tunai")}><Printer className="w-4 h-4" /> Bayar & Struk</Button>
                    <Button variant="outline" className="w-full gap-2" onClick={() => printLabel(cart, business.namaApotek, prescriptionSaved ? prescription.patientName : undefined)}>
                      <Sticker className="w-4 h-4" /> Cetak Etiket
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
