import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Truck, FileText, ShieldAlert, Building2, History, Plus, Printer, Search, X, Eye, Phone, MapPin, Calendar, Save, Check, Pencil, Trash2
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useProcurementStore, type Supplier } from "@/stores/useProcurementStore";
import { useInventoryStore } from "@/stores/useInventoryStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

type SPItem = { itemName: string; qty: string; unit: string; note: string };

const printSP = (spType: string, supplier: Supplier, items: SPItem[], apotekerName: string, sipaNo: string, apotek: { name: string; alamat: string; noSIA: string }) => {
  const now = new Date();
  const spNo = `SP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`;
  const isSpecial = spType === "Narkotika" || spType === "Psikotropika";
  const w = window.open("", "_blank", "width=700,height=900");
  if (!w) return;
  w.document.write(`<html><head><title>SP ${spType}</title><style>body{font-family:'Times New Roman',serif;font-size:14px;padding:40px;max-width:650px;margin:auto;line-height:1.6}.center{text-align:center}.bold{font-weight:bold}table.items{width:100%;border-collapse:collapse;margin:16px 0}table.items th,table.items td{border:1px solid #000;padding:6px 10px}table.items th{background:#f0f0f0}.header{border:${isSpecial?"3px solid red":"2px solid #000"};padding:16px;margin-bottom:20px}.stamp{border:2px solid red;padding:4px 12px;display:inline-block;color:red;font-weight:bold}</style></head><body>
  <div class="header"><div class="center"><div class="bold" style="font-size:18px">SURAT PESANAN ${spType.toUpperCase()}</div>${isSpecial?`<div class="stamp">⚠ ${spType.toUpperCase()}</div>`:""}<div>No: ${spNo}</div><div>Tanggal: ${now.toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</div></div></div>
  <table style="margin:8px 0"><tr><td width="140">Nama Apoteker</td><td>: ${apotekerName}</td></tr><tr><td>No. SIPA</td><td>: ${sipaNo}</td></tr><tr><td>Nama Apotek</td><td>: ${apotek.name}</td></tr><tr><td>No. SIA</td><td>: ${apotek.noSIA}</td></tr><tr><td>Alamat</td><td>: ${apotek.alamat}</td></tr></table>
  <p>Kepada: <b>${supplier.name}</b> — ${supplier.address} (${supplier.sipa})</p>
  <table class="items"><tr><th>No</th><th>Nama Obat</th><th>Jumlah</th><th>Satuan</th><th>Ket</th></tr>${items.map((it,i)=>`<tr><td>${i+1}</td><td>${it.itemName}</td><td>${it.qty}</td><td>${it.unit}</td><td>${it.note||"-"}</td></tr>`).join("")}</table>
  <div style="margin-top:40px;text-align:center;width:200px"><p>Apoteker PJ</p><div style="height:60px"></div><p class="bold">${apotekerName}</p><p>SIPA: ${sipaNo}</p></div></body></html>`);
  w.document.close(); w.print();
};

const SPOtomatisTab = () => {
  const { suppliers } = useProcurementStore();
  const { drugs } = useInventoryStore();
  const { business } = useSettingsStore();
  const lowStock = drugs.filter((d) => d.stock <= d.minStock);

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [spItems, setSpItems] = useState<SPItem[]>(
    lowStock.map((i) => ({ itemName: i.name, qty: String(i.minStock * 2), unit: "Box", note: "" }))
  );
  const [apotekerName, setApotekerName] = useState("Apt. Sarah Wijaya, S.Farm");
  const [sipaNo, setSipaNo] = useState("SIPA-1234/DINAS/2024");

  const addRow = () => setSpItems([...spItems, { itemName: "", qty: "", unit: "Box", note: "" }]);
  const updateRow = (idx: number, field: string, value: string) => { const u = [...spItems]; u[idx] = { ...u[idx], [field]: value }; setSpItems(u); };
  const removeRow = (idx: number) => { if (spItems.length > 1) setSpItems(spItems.filter((_, i) => i !== idx)); };

  const handlePrint = () => {
    const supplier = suppliers.find((s) => s.id === selectedSupplier);
    if (!supplier) { toast({ title: "Error", description: "Pilih supplier.", variant: "destructive" }); return; }
    if (spItems.some((i) => !i.itemName || !i.qty)) { toast({ title: "Error", description: "Lengkapi semua item.", variant: "destructive" }); return; }
    printSP("Reguler", supplier, spItems, apotekerName, sipaNo, { name: business.namaApotek, alamat: business.alamat, noSIA: business.noSIA });
    toast({ title: "SP Dicetak" });
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Surat Pesanan Otomatis</CardTitle>
        <p className="text-xs text-muted-foreground">Draft dari obat stok di bawah minimum ({lowStock.length} item).</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Supplier *</Label>
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger><SelectValue placeholder="Pilih PBF" /></SelectTrigger>
              <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Nama Apoteker</Label><Input value={apotekerName} onChange={(e) => setApotekerName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>No. SIPA</Label><Input value={sipaNo} onChange={(e) => setSipaNo(e.target.value)} /></div>
        </div>
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Nama Obat</TableHead><TableHead className="w-20">Qty</TableHead><TableHead className="w-24">Satuan</TableHead><TableHead>Keterangan</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
            <TableBody>
              {spItems.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell><Input className="h-9" value={item.itemName} onChange={(e) => updateRow(idx, "itemName", e.target.value)} /></TableCell>
                  <TableCell><Input className="h-9" type="number" value={item.qty} onChange={(e) => updateRow(idx, "qty", e.target.value)} /></TableCell>
                  <TableCell>
                    <Select value={item.unit} onValueChange={(v) => updateRow(idx, "unit", v)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{useSettingsStore.getState().masterData.units.map((u) => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Input className="h-9" placeholder="—" value={item.note} onChange={(e) => updateRow(idx, "note", e.target.value)} /></TableCell>
                  <TableCell><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeRow(idx)} disabled={spItems.length === 1}><X className="w-3 h-3" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={addRow}><Plus className="w-4 h-4 mr-1" /> Tambah Item</Button>
          <Button onClick={handlePrint} className="gap-2"><Printer className="w-4 h-4" /> Cetak Surat Pesanan</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SPKhususTab = () => {
  const { suppliers } = useProcurementStore();
  const { business } = useSettingsStore();
  const [spType, setSpType] = useState<"Narkotika" | "Psikotropika" | "Prekursor">("Narkotika");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [items, setItems] = useState<SPItem[]>([{ itemName: "", qty: "", unit: "Box", note: "" }]);
  const [apotekerName, setApotekerName] = useState("Apt. Sarah Wijaya, S.Farm");
  const [sipaNo, setSipaNo] = useState("SIPA-1234/DINAS/2024");

  const addRow = () => setItems([...items, { itemName: "", qty: "", unit: "Box", note: "" }]);
  const updateRow = (idx: number, field: string, value: string) => { const u = [...items]; u[idx] = { ...u[idx], [field]: value }; setItems(u); };
  const removeRow = (idx: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); };

  const specialItems: Record<string, string[]> = {
    Narkotika: ["Codein 10mg", "Codein 15mg", "Morphin 10mg", "Pethidine 50mg"],
    Psikotropika: ["Diazepam 2mg", "Diazepam 5mg", "Alprazolam 0.5mg", "Phenobarbital 30mg"],
    Prekursor: ["Pseudoephedrine 60mg", "Ephedrine HCl", "Ergotamine"],
  };

  const handlePrint = () => {
    const supplier = suppliers.find((s) => s.id === selectedSupplier);
    if (!supplier) { toast({ title: "Error", description: "Pilih supplier.", variant: "destructive" }); return; }
    printSP(spType, supplier, items, apotekerName, sipaNo, { name: business.namaApotek, alamat: business.alamat, noSIA: business.noSIA });
    toast({ title: `SP ${spType} Dicetak` });
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-destructive" /> SP Khusus (Narkotika / Psikotropika / Prekursor)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {(["Narkotika", "Psikotropika", "Prekursor"] as const).map((t) => (
            <Button key={t} variant={spType === t ? "default" : "outline"} size="sm"
              className={spType === t && t === "Narkotika" ? "bg-destructive hover:bg-destructive/90" : spType === t && t === "Psikotropika" ? "bg-secondary hover:bg-secondary/90" : ""}
              onClick={() => { setSpType(t); setItems([{ itemName: "", qty: "", unit: "Box", note: "" }]); }}>{t}</Button>
          ))}
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-foreground">
          <ShieldAlert className="w-4 h-4 text-destructive inline mr-1" /><b>Perhatian:</b> SP {spType} wajib ditandatangani Apoteker PJ. Satu SP hanya untuk satu golongan.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Supplier *</Label>
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger><SelectValue placeholder="Pilih PBF" /></SelectTrigger>
              <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Nama Apoteker PJ</Label><Input value={apotekerName} onChange={(e) => setApotekerName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>No. SIPA</Label><Input value={sipaNo} onChange={(e) => setSipaNo(e.target.value)} /></div>
        </div>
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Nama Obat {spType}</TableHead><TableHead className="w-20">Qty</TableHead><TableHead className="w-24">Satuan</TableHead><TableHead>Keterangan</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Select value={item.itemName} onValueChange={(v) => updateRow(idx, "itemName", v)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder={`Pilih ${spType}`} /></SelectTrigger>
                      <SelectContent>{specialItems[spType].map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Input className="h-9" type="number" value={item.qty} onChange={(e) => updateRow(idx, "qty", e.target.value)} /></TableCell>
                  <TableCell>
                    <Select value={item.unit} onValueChange={(v) => updateRow(idx, "unit", v)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Box">Box</SelectItem><SelectItem value="Ampul">Ampul</SelectItem><SelectItem value="Vial">Vial</SelectItem><SelectItem value="Strip">Strip</SelectItem></SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Input className="h-9" value={item.note} onChange={(e) => updateRow(idx, "note", e.target.value)} /></TableCell>
                  <TableCell><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeRow(idx)} disabled={items.length === 1}><X className="w-3 h-3" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={addRow}><Plus className="w-4 h-4 mr-1" /> Tambah Item</Button>
          <Button className="gap-2 bg-destructive hover:bg-destructive/90" onClick={handlePrint}><Printer className="w-4 h-4" /> Cetak SP {spType}</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SupplierTab = () => {
  const { suppliers, addSupplier, updateSupplier, removeSupplier } = useProcurementStore();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Supplier, 'id'>>({ name: '', address: '', phone: '', email: '', topDays: 30, sipa: '' });

  const filtered = suppliers.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditId(null); setForm({ name: '', address: '', phone: '', email: '', topDays: 30, sipa: '' }); setDialogOpen(true); };
  const openEdit = (s: Supplier) => { setEditId(s.id); const { id, ...rest } = s; setForm(rest); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name) { toast({ title: "Error", description: "Nama PBF wajib diisi.", variant: "destructive" }); return; }
    if (editId) { updateSupplier(editId, form); toast({ title: "Diperbarui" }); }
    else { addSupplier(form); toast({ title: "Berhasil", description: `${form.name} ditambahkan.` }); }
    setDialogOpen(false);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Database Supplier (PBF)</CardTitle>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari supplier..." className="pl-10 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Tambah PBF</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Nama PBF</TableHead><TableHead>Alamat</TableHead><TableHead>Telepon</TableHead><TableHead className="text-right">TOP (Hari)</TableHead><TableHead>No. Izin</TableHead><TableHead className="w-24"></TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-xs">{s.address}</TableCell>
                  <TableCell className="text-xs">{s.phone}</TableCell>
                  <TableCell className="text-right font-semibold">{s.topDays}</TableCell>
                  <TableCell className="text-xs">{s.sipa}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Pencil className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { removeSupplier(s.id); toast({ title: "Dihapus" }); }}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Edit Supplier" : "Tambah PBF Baru"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2"><Label>Nama PBF *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5 col-span-2"><Label>Alamat</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Telepon</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>TOP (Hari)</Label><Input type="number" value={form.topDays} onChange={(e) => setForm({ ...form, topDays: Number(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label>No. Izin (SIPA)</Label><Input value={form.sipa} onChange={(e) => setForm({ ...form, sipa: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const InvoiceTab = () => {
  const { invoiceTrackers, markPaid } = useProcurementStore();
  const today = new Date();

  const unpaid = invoiceTrackers.filter((t) => t.status === 'Belum Bayar');

  const getDaysLeft = (dueDate: string) => {
    const due = new Date(dueDate);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Status Faktur & Hitung Mundur</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader><TableRow><TableHead>No. Faktur</TableHead><TableHead>Supplier</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Tgl Terima</TableHead><TableHead>Jatuh Tempo</TableHead><TableHead className="text-center">Sisa Hari</TableHead><TableHead>Status</TableHead><TableHead className="w-20"></TableHead></TableRow></TableHeader>
            <TableBody>
              {invoiceTrackers.map((t) => {
                const daysLeft = getDaysLeft(t.dueDate);
                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.invoiceNo}</TableCell>
                    <TableCell className="text-xs">{t.supplierName}</TableCell>
                    <TableCell className="text-right font-medium">Rp {t.totalAmount.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-xs">{t.receiveDate}</TableCell>
                    <TableCell className="text-xs">{t.dueDate}</TableCell>
                    <TableCell className="text-center">
                      {t.status === 'Lunas' ? <Badge className="bg-success text-success-foreground">Lunas</Badge> : (
                        <Badge className={daysLeft <= 3 ? "bg-destructive text-destructive-foreground" : daysLeft <= 7 ? "bg-warning text-warning-foreground" : "bg-info text-info-foreground"}>
                          {daysLeft > 0 ? `${daysLeft} hari` : daysLeft === 0 ? "Hari ini" : `Terlambat ${Math.abs(daysLeft)} hari`}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'Lunas' ? "secondary" : "destructive"} className="text-xs">{t.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {t.status === 'Belum Bayar' && (
                        <Button variant="outline" size="sm" className="h-7 gap-1" onClick={() => { markPaid(t.id); toast({ title: "Lunas", description: `Faktur ${t.invoiceNo} ditandai lunas.` }); }}>
                          <Check className="w-3 h-3" /> Bayar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {invoiceTrackers.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Belum ada faktur. Data muncul setelah input Barang Masuk.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const Procurement = () => (
  <div className="p-6 animate-fade-in">
    <h1 className="text-2xl font-bold text-foreground mb-1">Pengadaan</h1>
    <p className="text-sm text-muted-foreground mb-6">Surat pesanan, database supplier, dan tracking faktur dengan hitung mundur TOP.</p>

    <Tabs defaultValue="sp-auto" className="w-full">
      <TabsList className="mb-4 flex-wrap h-auto gap-1">
        <TabsTrigger value="sp-auto" className="gap-1.5"><FileText className="w-3.5 h-3.5" /> SP Otomatis</TabsTrigger>
        <TabsTrigger value="sp-khusus" className="gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> SP Khusus</TabsTrigger>
        <TabsTrigger value="supplier" className="gap-1.5"><Building2 className="w-3.5 h-3.5" /> Supplier</TabsTrigger>
        <TabsTrigger value="faktur" className="gap-1.5"><Calendar className="w-3.5 h-3.5" /> Status Faktur</TabsTrigger>
      </TabsList>

      <TabsContent value="sp-auto"><SPOtomatisTab /></TabsContent>
      <TabsContent value="sp-khusus"><SPKhususTab /></TabsContent>
      <TabsContent value="supplier"><SupplierTab /></TabsContent>
      <TabsContent value="faktur"><InvoiceTab /></TabsContent>
    </Tabs>
  </div>
);

export default Procurement;
