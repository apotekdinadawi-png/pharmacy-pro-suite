import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search, Plus, Minus, CreditCard, Banknote, QrCode, Pause, Printer,
  ShoppingCart, FileText, FlaskConical, Sticker, X, Camera, UserRound
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { formatRupiah, formatNumber } from "@/lib/currency";

// === DATA ===
const sampleProducts = [
  { id: 1, name: "Paracetamol 500mg", price: 2500, stock: 120, unit: "Tablet", kegunaan: ["demam", "sakit kepala", "pusing", "nyeri", "flu"] },
  { id: 2, name: "Amoxicillin 500mg", price: 8500, stock: 45, unit: "Kapsul", kegunaan: ["infeksi", "radang", "batuk", "amandel", "gigi"] },
  { id: 3, name: "Vitamin C 500mg", price: 3000, stock: 200, unit: "Tablet", kegunaan: ["daya tahan tubuh", "imun", "antioksidan", "sariawan"] },
  { id: 4, name: "Omeprazole 20mg", price: 12000, stock: 30, unit: "Kapsul", kegunaan: ["maag", "asam lambung", "gerd", "nyeri ulu hati"] },
  { id: 5, name: "Cetirizine 10mg", price: 5000, stock: 80, unit: "Tablet", kegunaan: ["alergi", "gatal", "bersin", "biduran", "rhinitis"] },
  { id: 6, name: "Ibuprofen 400mg", price: 3500, stock: 90, unit: "Tablet", kegunaan: ["nyeri", "demam", "sakit gigi", "radang", "pegal"] },
  { id: 7, name: "Loperamide 2mg", price: 4000, stock: 60, unit: "Tablet", kegunaan: ["diare", "mencret", "sakit perut"] },
  { id: 8, name: "Antasida DOEN", price: 2000, stock: 150, unit: "Tablet", kegunaan: ["maag", "kembung", "asam lambung", "mual"] },
  { id: 9, name: "CTM 4mg", price: 1500, stock: 200, unit: "Tablet", kegunaan: ["alergi", "gatal", "bersin", "pilek"] },
  { id: 10, name: "Metformin 500mg", price: 6000, stock: 100, unit: "Tablet", kegunaan: ["diabetes", "gula darah"] },
];

type CartItem = { id: number; name: string; price: number; qty: number; unit: string; aturanPakai?: string };

// === RECEIPT PRINT ===
const printReceipt = (cart: CartItem[], total: number, payment: string, nominalBayar: number, prescription?: PrescriptionData) => {
  const now = new Date();
  const trxId = `TRX-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;

  // Pull from settings store
  const { business, receipt } = useSettingsStore.getState();
  const headerName = receipt.headerLine1 || business.namaApotek;
  const headerAddr = receipt.headerLine2 || business.alamat;
  const headerTelp = receipt.headerLine3 || `Telp: ${business.telepon}`;
  const footer1 = receipt.footerLine1;
  const footer2 = receipt.footerLine2;
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
    <div class="center"><b>${headerName}</b><br/>${headerAddr}<br/>${headerTelp}</div>
    ${business.namaAPJ ? `<div class="center" style="font-size:10px">APJ: ${business.namaAPJ} — SIPA: ${business.noSIPA}</div>` : ''}
    <div class="line"></div>
    <div>No: ${trxId}<br/>Tgl: ${now.toLocaleString("id-ID")}<br/>Kasir: Admin</div>
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
    <div class="center">${footer1}<br/>${footer2}</div>
    </body></html>
  `);
  w.document.close();
  w.print();
};

// === LABEL PRINT ===
const printLabel = (cart: CartItem[], patientName?: string) => {
  const items = cart.filter((c) => c.aturanPakai);
  if (items.length === 0) {
    toast({ title: "Info", description: "Belum ada aturan pakai yang diisi. Klik ikon etiket pada item keranjang." });
    return;
  }
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
        <div class="name">APOTEK PRO</div>
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

type PrescriptionData = { doctorName: string; patientName: string; note: string };

type RacikanItem = { itemId: string; qty: string; unit: string };

// === MAIN ===
const Transactions = () => {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [nominalBayar, setNominalBayar] = useState<number>(0);

  // Prescription
  const [prescription, setPrescription] = useState<PrescriptionData>({ doctorName: "", patientName: "", note: "" });
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [prescriptionSaved, setPrescriptionSaved] = useState(false);

  // Racikan
  const [racikanOpen, setRacikanOpen] = useState(false);
  const [racikanItems, setRacikanItems] = useState<RacikanItem[]>([{ itemId: "", qty: "", unit: "" }]);
  const [jasaRacik, setJasaRacik] = useState("");
  const [racikanName, setRacikanName] = useState("Racikan");

  // Etiket edit
  const [etiketItemId, setEtiketItemId] = useState<number | null>(null);
  const [etiketValue, setEtiketValue] = useState("");

  // Search by name OR kegunaan
  const filtered = sampleProducts.filter((p) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.kegunaan.some((k) => k.includes(q))
    );
  });

  const addToCart = (product: typeof sampleProducts[0]) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing) return prev.map((c) => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, unit: product.unit }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter((c) => c.qty > 0));
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  // Racikan helpers
  const addRacikanRow = () => setRacikanItems([...racikanItems, { itemId: "", qty: "", unit: "" }]);
  const updateRacikanRow = (idx: number, field: string, value: string) => {
    const updated = [...racikanItems];
    updated[idx] = { ...updated[idx], [field]: value };
    setRacikanItems(updated);
  };
  const removeRacikanRow = (idx: number) => { if (racikanItems.length > 1) setRacikanItems(racikanItems.filter((_, i) => i !== idx)); };

  const racikanTotal = racikanItems.reduce((sum, ri) => {
    const prod = sampleProducts.find((p) => String(p.id) === ri.itemId);
    return sum + (prod ? prod.price * (parseInt(ri.qty) || 0) : 0);
  }, 0) + (parseInt(jasaRacik) || 0);

  const addRacikanToCart = () => {
    const validItems = racikanItems.filter((ri) => ri.itemId && ri.qty);
    if (validItems.length === 0) {
      toast({ title: "Error", description: "Tambahkan minimal satu obat ke racikan.", variant: "destructive" });
      return;
    }
    const racikanId = Date.now();
    setCart((prev) => [...prev, { id: racikanId, name: `🧪 ${racikanName}`, price: racikanTotal, qty: 1, unit: "Racikan" }]);
    setRacikanOpen(false);
    setRacikanItems([{ itemId: "", qty: "", unit: "" }]);
    setJasaRacik("");
    setRacikanName("Racikan");
    toast({ title: "Berhasil", description: "Racikan ditambahkan ke keranjang." });
  };

  const handlePay = (method: string) => {
    if (cart.length === 0) return;
    const bayar = nominalBayar || total;
    if (method === "Tunai" && bayar < total) {
      toast({ title: "Error", description: "Nominal bayar kurang dari total.", variant: "destructive" });
      return;
    }
    setPaymentMethod(method);
    printReceipt(cart, total, method, bayar, prescriptionSaved ? prescription : undefined);
    toast({ title: "Transaksi Berhasil", description: `Pembayaran ${method} — ${formatRupiah(total)}` });
    setCart([]);
    setNominalBayar(0);
    setPrescription({ doctorName: "", patientName: "", note: "" });
    setPrescriptionSaved(false);
  };

  const saveEtiket = (id: number) => {
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, aturanPakai: etiketValue } : c));
    setEtiketItemId(null);
    setEtiketValue("");
    toast({ title: "Etiket Disimpan", description: "Aturan pakai berhasil disimpan." });
  };

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-1">Transaksi / Kasir</h1>
      <p className="text-sm text-muted-foreground mb-6">Point of Sale — Cari obat berdasarkan nama atau kegunaan, input resep, racik obat.</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Product List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Toolbar */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder='Cari nama obat atau kegunaan (misal: "pusing", "maag")...'
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Resep button */}
            <Dialog open={prescriptionOpen} onOpenChange={setPrescriptionOpen}>
              <DialogTrigger asChild>
                <Button variant={prescriptionSaved ? "default" : "outline"} size="sm" className="gap-1.5">
                  <FileText className="w-4 h-4" /> Resep {prescriptionSaved && "✓"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Input Resep Dokter</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Nama Dokter *</Label>
                    <Input placeholder="dr. Ahmad" value={prescription.doctorName} onChange={(e) => setPrescription({ ...prescription, doctorName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nama Pasien *</Label>
                    <Input placeholder="Budi Santoso" value={prescription.patientName} onChange={(e) => setPrescription({ ...prescription, patientName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Catatan / Foto Resep</Label>
                    <Textarea placeholder="Catatan resep dokter..." value={prescription.note} onChange={(e) => setPrescription({ ...prescription, note: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setPrescription({ doctorName: "", patientName: "", note: "" }); setPrescriptionSaved(false); setPrescriptionOpen(false); }}>Reset</Button>
                  <Button onClick={() => {
                    if (!prescription.doctorName || !prescription.patientName) {
                      toast({ title: "Error", description: "Nama dokter dan pasien wajib diisi.", variant: "destructive" });
                      return;
                    }
                    setPrescriptionSaved(true);
                    setPrescriptionOpen(false);
                    toast({ title: "Resep Disimpan", description: `Resep dr. ${prescription.doctorName} untuk ${prescription.patientName}` });
                  }}>Simpan Resep</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Racikan button */}
            <Dialog open={racikanOpen} onOpenChange={setRacikanOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5"><FlaskConical className="w-4 h-4" /> Racikan</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle className="flex items-center gap-2"><FlaskConical className="w-5 h-5 text-primary" /> Kalkulator Racikan</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Nama Racikan</Label>
                    <Input placeholder="Racikan Batuk Pilek" value={racikanName} onChange={(e) => setRacikanName(e.target.value)} />
                  </div>
                  <div className="rounded-lg border overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Obat</TableHead>
                          <TableHead className="w-20">Qty</TableHead>
                          <TableHead className="w-24">Satuan</TableHead>
                          <TableHead className="text-right w-28">Subtotal</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {racikanItems.map((ri, idx) => {
                          const prod = sampleProducts.find((p) => String(p.id) === ri.itemId);
                          const sub = prod ? prod.price * (parseInt(ri.qty) || 0) : 0;
                          return (
                            <TableRow key={idx}>
                              <TableCell>
                                <Select value={ri.itemId} onValueChange={(v) => updateRacikanRow(idx, "itemId", v)}>
                                  <SelectTrigger className="h-9"><SelectValue placeholder="Pilih obat" /></SelectTrigger>
                                  <SelectContent>
                                    {sampleProducts.map((p) => (
                                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell><Input className="h-9" type="number" placeholder="0" value={ri.qty} onChange={(e) => updateRacikanRow(idx, "qty", e.target.value)} /></TableCell>
                              <TableCell>
                                <Select value={ri.unit} onValueChange={(v) => updateRacikanRow(idx, "unit", v)}>
                                  <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Tablet">Tablet</SelectItem>
                                    <SelectItem value="Kapsul">Kapsul</SelectItem>
                                    <SelectItem value="ml">ml</SelectItem>
                                    <SelectItem value="gram">gram</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right text-sm font-medium">{formatRupiah(sub)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeRacikanRow(idx)} disabled={racikanItems.length === 1}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={addRacikanRow}><Plus className="w-4 h-4 mr-1" /> Tambah Obat</Button>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm whitespace-nowrap">Jasa Racik:</Label>
                      <Input className="h-9 w-28" type="number" placeholder="5000" value={jasaRacik} onChange={(e) => setJasaRacik(e.target.value)} />
                    </div>
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

          {/* Prescription info banner */}
          {prescriptionSaved && (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 text-sm">
              <UserRound className="w-4 h-4 text-primary" />
              <span className="text-foreground">Resep: <b>dr. {prescription.doctorName}</b> — Pasien: <b>{prescription.patientName}</b></span>
            </div>
          )}

          {/* Search hint */}
          {search && (
            <p className="text-xs text-muted-foreground">
              Menampilkan {filtered.length} obat untuk "{search}"
              {filtered.length > 0 && filtered.some((p) => p.kegunaan.some((k) => k.includes(search.toLowerCase()))) && (
                <span> — <Badge variant="outline" className="text-xs ml-1">kegunaan cocok</Badge></span>
              )}
            </p>
          )}

          {/* Product cards */}
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map((p) => (
              <Card key={p.id} className="glass-card cursor-pointer hover:shadow-md transition-shadow" onClick={() => addToCart(p)}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Stok: {p.stock} {p.unit}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.kegunaan.slice(0, 3).map((k) => (
                        <Badge key={k} variant="outline" className={`text-[10px] py-0 ${search && k.includes(search.toLowerCase()) ? "border-primary text-primary" : ""}`}>{k}</Badge>
                      ))}
                      {p.kegunaan.length > 3 && <Badge variant="outline" className="text-[10px] py-0">+{p.kegunaan.length - 3}</Badge>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{formatRupiah(p.price)}</p>
                    <p className="text-xs text-muted-foreground">/{p.unit}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <p className="text-center py-8 text-muted-foreground text-sm">Tidak ditemukan obat dengan kata kunci "{search}"</p>
            )}
          </div>
        </div>

        {/* RIGHT: Cart */}
        <div className="lg:col-span-2">
          <Card className="glass-card sticky top-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" />
                Keranjang
                {cart.length > 0 && <Badge className="bg-primary text-primary-foreground text-xs ml-auto">{cart.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cart.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Keranjang kosong. Klik obat untuk menambahkan.</p>
              )}
              <div className="max-h-[40vh] overflow-y-auto space-y-2 pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatRupiah(item.price)} x {item.qty}</p>
                      {item.aturanPakai && <p className="text-xs text-primary mt-0.5">📋 {item.aturanPakai}</p>}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {/* Etiket button */}
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Atur etiket"
                        onClick={() => { setEtiketItemId(item.id); setEtiketValue(item.aturanPakai || ""); }}>
                        <Sticker className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQty(item.id, -1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQty(item.id, 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Etiket mini-dialog */}
              {etiketItemId !== null && (
                <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1"><Sticker className="w-3 h-3" /> Aturan Pakai (Etiket)</Label>
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
                      <SelectItem value="3x1 Tablet">3x1 Tablet</SelectItem>
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
                      <Input
                        type="number"
                        placeholder="Masukkan nominal..."
                        value={nominalBayar || ''}
                        onChange={(e) => setNominalBayar(Number(e.target.value))}
                        className="h-9"
                      />
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
                    <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => {
                      toast({ title: "Pending", description: "Transaksi disimpan sementara." });
                    }}><Pause className="w-3 h-3" /> Pending</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="w-full gap-2" onClick={() => handlePay("Tunai")}>
                      <Printer className="w-4 h-4" /> Bayar & Struk
                    </Button>
                    <Button variant="outline" className="w-full gap-2" onClick={() => printLabel(cart, prescriptionSaved ? prescription.patientName : undefined)}>
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
