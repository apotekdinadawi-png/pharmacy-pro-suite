import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Truck, FileText, ShieldAlert, Building2, History, Plus, Printer, Search, X, Eye, Phone, MapPin, Calendar
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

// === DATA ===
const suppliers = [
  { id: 1, name: "PT Kimia Farma Tbk", address: "Jl. Veteran No. 9, Jakarta", phone: "021-3847171", email: "order@kimiafarma.co.id", tempo: 30, sipa: "SI-001/BPOM/2024" },
  { id: 2, name: "PT Enseval Putera Megatrading", address: "Jl. Pulo Lentut No. 10, Jakarta", phone: "021-4682042", email: "order@enseval.com", tempo: 21, sipa: "SI-002/BPOM/2024" },
  { id: 3, name: "PT Anugrah Argon Medica", address: "Jl. Senen Raya No. 135, Jakarta", phone: "021-3858811", email: "order@aam.co.id", tempo: 14, sipa: "SI-003/BPOM/2024" },
  { id: 4, name: "PT Tempo Scan Pacific", address: "Jl. HR Rasuna Said, Jakarta", phone: "021-5200533", email: "order@tempo.co.id", tempo: 30, sipa: "SI-004/BPOM/2024" },
  { id: 5, name: "PT Merapi Utama Pharma", address: "Jl. Palmerah Barat No. 59, Jakarta", phone: "021-5482618", email: "order@merapi.co.id", tempo: 21, sipa: "SI-005/BPOM/2024" },
];

const lowStockItems = [
  { id: 1, name: "Amoxicillin 500mg", stock: 5, minStock: 10, category: "Keras", lastPrice: 8500, lastSupplier: "PT Kimia Farma Tbk" },
  { id: 2, name: "Omeprazole 20mg", stock: 3, minStock: 10, category: "Keras", lastPrice: 12000, lastSupplier: "PT Enseval Putera Megatrading" },
  { id: 3, name: "Cetirizine 10mg", stock: 7, minStock: 15, category: "Bebas Terbatas", lastPrice: 5000, lastSupplier: "PT Anugrah Argon Medica" },
  { id: 4, name: "Diazepam 5mg", stock: 25, minStock: 5, category: "Psikotropika", lastPrice: 15000, lastSupplier: "PT Kimia Farma Tbk" },
  { id: 5, name: "Codein 10mg", stock: 10, minStock: 5, category: "Narkotika", lastPrice: 20000, lastSupplier: "PT Kimia Farma Tbk" },
];

const purchaseHistory = [
  { id: "SP-2026-001", date: "2026-02-20", supplier: "PT Kimia Farma Tbk", items: 5, total: 2500000, status: "Diterima", type: "Reguler" },
  { id: "SP-2026-002", date: "2026-02-18", supplier: "PT Enseval Putera Megatrading", items: 3, total: 1800000, status: "Dikirim", type: "Reguler" },
  { id: "SP-2026-003", date: "2026-02-15", supplier: "PT Kimia Farma Tbk", items: 2, total: 950000, status: "Diterima", type: "Narkotika" },
  { id: "SP-2026-004", date: "2026-02-12", supplier: "PT Anugrah Argon Medica", items: 8, total: 4200000, status: "Diterima", type: "Reguler" },
  { id: "SP-2026-005", date: "2026-02-10", supplier: "PT Tempo Scan Pacific", items: 4, total: 3100000, status: "Pending", type: "Psikotropika" },
  { id: "SP-2026-006", date: "2026-02-05", supplier: "PT Kimia Farma Tbk", items: 6, total: 5600000, status: "Diterima", type: "Reguler" },
];

const categoryColor: Record<string, string> = {
  Bebas: "bg-success text-success-foreground",
  "Bebas Terbatas": "bg-info text-info-foreground",
  Keras: "bg-warning text-warning-foreground",
  Psikotropika: "bg-secondary text-secondary-foreground",
  Narkotika: "bg-destructive text-destructive-foreground",
};

const statusColor: Record<string, string> = {
  Pending: "bg-warning text-warning-foreground",
  Dikirim: "bg-info text-info-foreground",
  Diterima: "bg-success text-success-foreground",
};

type SPItem = { itemName: string; qty: string; unit: string; note: string };

// === PRINT SP ===
const printSP = (spType: string, supplierId: string, items: SPItem[], apotekerName: string, sipaNo: string) => {
  const supplier = suppliers.find((s) => String(s.id) === supplierId);
  if (!supplier) return;
  const now = new Date();
  const spNo = `SP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`;
  const isSpecial = spType === "Narkotika" || spType === "Psikotropika";

  const w = window.open("", "_blank", "width=700,height=900");
  if (!w) return;
  w.document.write(`
    <html><head><title>Surat Pesanan ${spType}</title><style>
      body{font-family:'Times New Roman',serif;font-size:14px;padding:40px;max-width:650px;margin:auto;line-height:1.6}
      .center{text-align:center} .bold{font-weight:bold} .underline{text-decoration:underline}
      table.items{width:100%;border-collapse:collapse;margin:16px 0}
      table.items th,table.items td{border:1px solid #000;padding:6px 10px;text-align:left}
      table.items th{background:#f0f0f0}
      .header{border:${isSpecial ? "3px solid red" : "2px solid #000"};padding:16px;margin-bottom:20px}
      .signature{display:flex;justify-content:space-between;margin-top:40px}
      .sig-box{text-align:center;width:200px}
      .red{color:red;font-weight:bold}
      .stamp{border:2px solid red;padding:4px 12px;display:inline-block;margin-top:4px;color:red;font-weight:bold}
    </style></head><body>
    <div class="header">
      <div class="center">
        <div class="bold" style="font-size:18px">SURAT PESANAN ${spType.toUpperCase()}</div>
        ${isSpecial ? `<div class="stamp">⚠ ${spType.toUpperCase()} — DOKUMEN RESMI</div>` : ""}
        <div>No: ${spNo}</div>
        <div>Tanggal: ${now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
      </div>
    </div>
    <div>
      <p>Yang bertanda tangan di bawah ini:</p>
      <table style="margin:8px 0">
        <tr><td width="140">Nama Apoteker</td><td>: ${apotekerName}</td></tr>
        <tr><td>No. SIPA</td><td>: ${sipaNo}</td></tr>
        <tr><td>Nama Apotek</td><td>: Apotek Pro</td></tr>
        <tr><td>Alamat</td><td>: Jl. Sehat No. 1, Jakarta</td></tr>
      </table>
      <p>Dengan ini memesan kepada:</p>
      <table style="margin:8px 0">
        <tr><td width="140">Nama PBF</td><td>: ${supplier.name}</td></tr>
        <tr><td>Alamat</td><td>: ${supplier.address}</td></tr>
        <tr><td>No. Izin</td><td>: ${supplier.sipa}</td></tr>
      </table>
      <p>Obat-obatan ${isSpecial ? `golongan <span class="red">${spType}</span>` : ""} sebagai berikut:</p>
    </div>
    <table class="items">
      <tr><th>No</th><th>Nama Obat</th><th>Jumlah</th><th>Satuan</th><th>Keterangan</th></tr>
      ${items.map((it, i) => `<tr><td>${i + 1}</td><td>${it.itemName}</td><td>${it.qty}</td><td>${it.unit}</td><td>${it.note || "-"}</td></tr>`).join("")}
    </table>
    ${isSpecial ? `<p class="red">Obat-obatan tersebut akan digunakan untuk keperluan Apotek Pro dan tidak akan disalahgunakan.</p>` : ""}
    <div class="signature">
      <div class="sig-box">
        <p>Hormat kami,<br/>Apoteker Penanggung Jawab</p>
        <div style="height:60px"></div>
        <p class="bold underline">${apotekerName}</p>
        <p>SIPA: ${sipaNo}</p>
      </div>
    </div>
    </body></html>
  `);
  w.document.close();
  w.print();
};

// === SUB-COMPONENTS ===

const SPOtomatisTab = () => {
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [spItems, setSpItems] = useState<SPItem[]>(
    lowStockItems.filter((i) => i.stock < i.minStock).map((i) => ({
      itemName: i.name, qty: String(i.minStock * 2), unit: "Box", note: ""
    }))
  );
  const [apotekerName, setApotekerName] = useState("Apt. Sarah Wijaya, S.Farm");
  const [sipaNo, setSipaNo] = useState("SIPA-1234/DINAS/2024");

  const addRow = () => setSpItems([...spItems, { itemName: "", qty: "", unit: "Box", note: "" }]);
  const updateRow = (idx: number, field: string, value: string) => {
    const u = [...spItems]; u[idx] = { ...u[idx], [field]: value }; setSpItems(u);
  };
  const removeRow = (idx: number) => { if (spItems.length > 1) setSpItems(spItems.filter((_, i) => i !== idx)); };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> Surat Pesanan Otomatis
        </CardTitle>
        <p className="text-xs text-muted-foreground">Draft SP dibuat otomatis dari obat yang stoknya di bawah minimum.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Supplier / PBF *</Label>
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger><SelectValue placeholder="Pilih PBF" /></SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Nama Apoteker</Label>
            <Input value={apotekerName} onChange={(e) => setApotekerName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>No. SIPA</Label>
            <Input value={sipaNo} onChange={(e) => setSipaNo(e.target.value)} />
          </div>
        </div>

        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Obat</TableHead>
                <TableHead className="w-20">Qty</TableHead>
                <TableHead className="w-24">Satuan</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spItems.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell><Input className="h-9" value={item.itemName} onChange={(e) => updateRow(idx, "itemName", e.target.value)} /></TableCell>
                  <TableCell><Input className="h-9" type="number" value={item.qty} onChange={(e) => updateRow(idx, "qty", e.target.value)} /></TableCell>
                  <TableCell>
                    <Select value={item.unit} onValueChange={(v) => updateRow(idx, "unit", v)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Box">Box</SelectItem>
                        <SelectItem value="Strip">Strip</SelectItem>
                        <SelectItem value="Botol">Botol</SelectItem>
                        <SelectItem value="Tube">Tube</SelectItem>
                        <SelectItem value="Ampul">Ampul</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Input className="h-9" placeholder="—" value={item.note} onChange={(e) => updateRow(idx, "note", e.target.value)} /></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeRow(idx)} disabled={spItems.length === 1}><X className="w-3 h-3" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={addRow}><Plus className="w-4 h-4 mr-1" /> Tambah Item</Button>
          <Button className="gap-2" onClick={() => {
            if (!selectedSupplier) { toast({ title: "Error", description: "Pilih supplier terlebih dahulu.", variant: "destructive" }); return; }
            if (spItems.some((i) => !i.itemName || !i.qty)) { toast({ title: "Error", description: "Lengkapi semua item.", variant: "destructive" }); return; }
            printSP("Reguler", selectedSupplier, spItems, apotekerName, sipaNo);
            toast({ title: "SP Dicetak", description: "Surat Pesanan berhasil dicetak." });
          }}>
            <Printer className="w-4 h-4" /> Cetak Surat Pesanan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SPKhususTab = () => {
  const [spType, setSpType] = useState<"Narkotika" | "Psikotropika" | "Prekursor">("Narkotika");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [items, setItems] = useState<SPItem[]>([{ itemName: "", qty: "", unit: "Box", note: "" }]);
  const [apotekerName, setApotekerName] = useState("Apt. Sarah Wijaya, S.Farm");
  const [sipaNo, setSipaNo] = useState("SIPA-1234/DINAS/2024");

  const addRow = () => setItems([...items, { itemName: "", qty: "", unit: "Box", note: "" }]);
  const updateRow = (idx: number, field: string, value: string) => {
    const u = [...items]; u[idx] = { ...u[idx], [field]: value }; setItems(u);
  };
  const removeRow = (idx: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); };

  const specialItems: Record<string, string[]> = {
    Narkotika: ["Codein 10mg", "Codein 15mg", "Morphin 10mg", "Pethidine 50mg"],
    Psikotropika: ["Diazepam 2mg", "Diazepam 5mg", "Alprazolam 0.5mg", "Phenobarbital 30mg", "Chlordiazepoxide 5mg"],
    Prekursor: ["Pseudoephedrine 60mg", "Ephedrine HCl", "Ergotamine"],
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-destructive" /> SP Khusus (Narkotika / Psikotropika / Prekursor)
        </CardTitle>
        <p className="text-xs text-muted-foreground">Template resmi sesuai ketentuan hukum. SP terpisah wajib per golongan.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {(["Narkotika", "Psikotropika", "Prekursor"] as const).map((t) => (
            <Button key={t} variant={spType === t ? "default" : "outline"} size="sm"
              className={spType === t && t === "Narkotika" ? "bg-destructive hover:bg-destructive/90" : spType === t && t === "Psikotropika" ? "bg-secondary hover:bg-secondary/90" : ""}
              onClick={() => { setSpType(t); setItems([{ itemName: "", qty: "", unit: "Box", note: "" }]); }}>
              {t}
            </Button>
          ))}
        </div>

        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-foreground">
          <ShieldAlert className="w-4 h-4 text-destructive inline mr-1" />
          <b>Perhatian:</b> SP {spType} wajib ditandatangani Apoteker Penanggung Jawab dan memiliki format resmi sesuai Permenkes.
          Satu SP hanya untuk satu golongan obat.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Supplier / PBF *</Label>
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger><SelectValue placeholder="Pilih PBF" /></SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Nama Apoteker PJ</Label>
            <Input value={apotekerName} onChange={(e) => setApotekerName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>No. SIPA</Label>
            <Input value={sipaNo} onChange={(e) => setSipaNo(e.target.value)} />
          </div>
        </div>

        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Obat {spType}</TableHead>
                <TableHead className="w-20">Qty</TableHead>
                <TableHead className="w-24">Satuan</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Select value={item.itemName} onValueChange={(v) => updateRow(idx, "itemName", v)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder={`Pilih ${spType}`} /></SelectTrigger>
                      <SelectContent>
                        {specialItems[spType].map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Input className="h-9" type="number" value={item.qty} onChange={(e) => updateRow(idx, "qty", e.target.value)} /></TableCell>
                  <TableCell>
                    <Select value={item.unit} onValueChange={(v) => updateRow(idx, "unit", v)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Box">Box</SelectItem>
                        <SelectItem value="Ampul">Ampul</SelectItem>
                        <SelectItem value="Vial">Vial</SelectItem>
                        <SelectItem value="Strip">Strip</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Input className="h-9" value={item.note} onChange={(e) => updateRow(idx, "note", e.target.value)} /></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeRow(idx)} disabled={items.length === 1}><X className="w-3 h-3" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={addRow}><Plus className="w-4 h-4 mr-1" /> Tambah Item</Button>
          <Button className="gap-2 bg-destructive hover:bg-destructive/90" onClick={() => {
            if (!selectedSupplier) { toast({ title: "Error", description: "Pilih supplier.", variant: "destructive" }); return; }
            if (items.some((i) => !i.itemName || !i.qty)) { toast({ title: "Error", description: "Lengkapi semua item.", variant: "destructive" }); return; }
            printSP(spType, selectedSupplier, items, apotekerName, sipaNo);
            toast({ title: `SP ${spType} Dicetak`, description: `Surat Pesanan ${spType} berhasil dicetak.` });
          }}>
            <Printer className="w-4 h-4" /> Cetak SP {spType}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SupplierTab = () => {
  const [search, setSearch] = useState("");
  const [viewId, setViewId] = useState<number | null>(null);

  const filtered = suppliers.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  const viewing = suppliers.find((s) => s.id === viewId);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" /> Database Supplier (PBF)
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari supplier..." className="pl-10 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama PBF</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead className="text-right">Tempo (Hari)</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-xs">{s.address}</TableCell>
                  <TableCell className="text-xs">{s.phone}</TableCell>
                  <TableCell className="text-right">{s.tempo}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewId(s.id)}><Eye className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Detail Dialog */}
        <Dialog open={viewId !== null} onOpenChange={() => setViewId(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> Detail Supplier</DialogTitle></DialogHeader>
            {viewing && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Nama PBF</span><p className="font-semibold">{viewing.name}</p></div>
                  <div><span className="text-muted-foreground">No. Izin</span><p className="font-semibold">{viewing.sipa}</p></div>
                  <div className="col-span-2"><span className="text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Alamat</span><p>{viewing.address}</p></div>
                  <div><span className="text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Telepon</span><p>{viewing.phone}</p></div>
                  <div><span className="text-muted-foreground">Email</span><p>{viewing.email}</p></div>
                  <div><span className="text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Tempo Pembayaran</span><p className="font-semibold">{viewing.tempo} hari</p></div>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-2">Riwayat pembelian terakhir:</p>
                  <div className="space-y-1">
                    {purchaseHistory.filter((h) => h.supplier === viewing.name).slice(0, 3).map((h) => (
                      <div key={h.id} className="flex justify-between text-sm bg-muted/50 rounded-md px-3 py-1.5">
                        <span>{h.id} — {h.date}</span>
                        <span className="font-medium">Rp {h.total.toLocaleString("id-ID")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

const HistoryTab = () => {
  const [search, setSearch] = useState("");
  const filtered = purchaseHistory.filter((h) =>
    h.id.toLowerCase().includes(search.toLowerCase()) ||
    h.supplier.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4 text-primary" /> History Pembelian
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari SP atau supplier..." className="pl-10 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. SP</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">{h.id}</TableCell>
                  <TableCell className="text-xs">{h.date}</TableCell>
                  <TableCell className="text-xs">{h.supplier}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${h.type === "Narkotika" ? "bg-destructive text-destructive-foreground" : h.type === "Psikotropika" ? "bg-secondary text-secondary-foreground" : "bg-primary/20 text-primary"}`}>
                      {h.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{h.items}</TableCell>
                  <TableCell className="text-right font-medium">Rp {h.total.toLocaleString("id-ID")}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${statusColor[h.status] || ""}`}>{h.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// === MAIN ===
const Procurement = () => {
  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-1">Pengadaan</h1>
      <p className="text-sm text-muted-foreground mb-6">Kelola surat pesanan, SP khusus Narkotika/Psikotropika, database supplier, dan history pembelian.</p>

      <Tabs defaultValue="sp-auto" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="sp-auto" className="gap-1.5"><FileText className="w-3.5 h-3.5" /> SP Otomatis</TabsTrigger>
          <TabsTrigger value="sp-khusus" className="gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> SP Khusus</TabsTrigger>
          <TabsTrigger value="supplier" className="gap-1.5"><Building2 className="w-3.5 h-3.5" /> Supplier</TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5"><History className="w-3.5 h-3.5" /> History</TabsTrigger>
        </TabsList>

        <TabsContent value="sp-auto"><SPOtomatisTab /></TabsContent>
        <TabsContent value="sp-khusus"><SPKhususTab /></TabsContent>
        <TabsContent value="supplier"><SupplierTab /></TabsContent>
        <TabsContent value="history"><HistoryTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default Procurement;
