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
  Truck, FileText, ShieldAlert, Building2, Calendar, Plus, Printer, Search, X, Save, Check, Pencil, Trash2, History
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useProcurementStore, type Supplier, type SPItem, type SPRecord } from "@/stores/useProcurementStore";
import { useInventoryStore } from "@/stores/useInventoryStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { formatRupiah } from "@/lib/currency";
import { useCanEdit } from "@/hooks/useCanEdit";

// ========== UNIFIED SP PRINT FUNCTION ==========
const printSPUnified = (
  spNo: string,
  spType: string,
  supplier: Supplier,
  items: SPItem[],
  business: ReturnType<typeof useSettingsStore.getState>['business'],
  apotekerPemesan?: string
) => {
  const now = new Date();
  const isSpecial = ['Narkotika', 'Psikotropika', 'Prekursor', 'Obat-Obat Tertentu'].includes(spType);
  const w = window.open("", "_blank", "width=800,height=1100");
  if (!w) return;

  const itemRows = items.filter(i => i.itemName && i.qty).map((it, i) => {
    const harga = parseFloat(it.hargaSatuan) || 0;
    const diskon = parseFloat(it.diskon) || 0;
    const total = harga * (parseFloat(it.qty) || 0) * (1 - diskon / 100);
    return `<tr>
      <td style="border:1px solid #000;padding:6px;text-align:center">${i + 1}</td>
      <td style="border:1px solid #000;padding:6px">${it.itemName}</td>
      <td style="border:1px solid #000;padding:6px">${it.keterangan || '-'}</td>
      <td style="border:1px solid #000;padding:6px;text-align:center">${it.qty}</td>
      <td style="border:1px solid #000;padding:6px;text-align:center">${it.unit}</td>
      <td style="border:1px solid #000;padding:6px;text-align:right">${new Intl.NumberFormat('id-ID').format(harga)}</td>
      <td style="border:1px solid #000;padding:6px;text-align:center">${diskon}%</td>
      <td style="border:1px solid #000;padding:6px;text-align:right">${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(total)}</td>
    </tr>`;
  }).join('');

  w.document.write(`<html><head><title>Surat Pesanan ${spType}</title>
    <style>
      body{font-family:'Times New Roman',serif;font-size:13px;padding:40px;max-width:750px;margin:auto;line-height:1.5}
      .header-left{float:left;width:55%} .header-right{float:right;width:40%;text-align:right}
      .clear{clear:both} table.items{width:100%;border-collapse:collapse;margin:16px 0}
      .bold{font-weight:bold} .center{text-align:center} .right{text-align:right}
      .title{font-size:28px;font-weight:bold;text-align:right;margin-bottom:0}
      ${isSpecial ? '.special-badge{border:2px solid red;padding:4px 12px;display:inline-block;color:red;font-weight:bold;margin-top:4px}' : ''}
    </style></head><body>
    <div>
      <div class="header-left">
        ${business.logoUrl ? `<img src="${business.logoUrl}" style="height:50px;margin-bottom:4px" />` : ''}
        <div class="bold" style="font-size:16px">${business.namaApotek}</div>
        <div>No. Surat Izin Apotek : ${business.noSIA}</div>
        <div>${business.alamat}</div>
        <div>Telp. ${business.telepon}${business.email ? ', Email : ' + business.email : ''}</div>
      </div>
      <div class="header-right">
        <div class="title">SURAT</div>
        <div class="title">PESANAN</div>
        ${spType === 'Obat-Obat Tertentu' ? '<div class="title" style="font-size:20px">OBAT-OBAT TERTENTU</div>' : ''}
        ${isSpecial ? `<div class="special-badge">⚠ ${spType.toUpperCase()}</div>` : ''}
      </div>
      <div class="clear"></div>
    </div>
    <hr style="border:1px solid #000;margin:12px 0"/>
    <table style="width:100%;margin:8px 0">
      <tr>
        <td width="50%">
          <table>
            <tr><td width="120">Nama Supplier</td><td>: ${supplier.name}</td></tr>
            <tr><td>No. Telp</td><td>: ${supplier.phone}</td></tr>
            <tr><td>Alamat</td><td>: ${supplier.address}</td></tr>
          </table>
        </td>
        <td width="50%">
          <table>
            <tr><td width="120">APJ</td><td>: ${business.namaAPJ}</td></tr>
            <tr><td>Tanggal</td><td>: ${now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td></tr>
            <tr><td>No. PO</td><td>: ${spNo}</td></tr>
            <tr><td>Jenis SP</td><td>: ${spType}</td></tr>
            ${apotekerPemesan ? `<tr><td>Pemesan</td><td>: ${apotekerPemesan}</td></tr>` : ''}
          </table>
        </td>
      </tr>
    </table>
    <table class="items">
      <tr style="background:#f0f0f0">
        <th style="border:1px solid #000;padding:6px">No</th>
        <th style="border:1px solid #000;padding:6px">Nama Obat</th>
        <th style="border:1px solid #000;padding:6px">Keterangan</th>
        <th style="border:1px solid #000;padding:6px">Qty</th>
        <th style="border:1px solid #000;padding:6px">Satuan</th>
        <th style="border:1px solid #000;padding:6px">Harga Satuan</th>
        <th style="border:1px solid #000;padding:6px">Diskon</th>
        <th style="border:1px solid #000;padding:6px">Total</th>
      </tr>
      ${itemRows}
    </table>
    <div style="margin-top:8px">Catatan : </div>
    <div style="margin-top:40px;display:flex;justify-content:space-between">
      <div style="width:45%;text-align:center">
        <div>Supplier</div>
        <div style="height:70px"></div>
        <div>_______________________</div>
      </div>
      <div style="width:45%;text-align:center">
        <div>${business.namaApotek}</div>
        <div>Apoteker Pengelola Apotek (APA)</div>
        <div style="height:50px"></div>
        <div class="bold">${business.namaAPJ}</div>
        <div>SIPA: ${business.noSIPA}</div>
      </div>
    </div>
    </body></html>`);
  w.document.close();
  w.print();
};

// ========== SP TAB (Reguler) ==========
const SPOtomatisTab = () => {
  const { suppliers, addSPRecord, getNextSPNo } = useProcurementStore();
  const { drugs } = useInventoryStore();
  const { business } = useSettingsStore();
  const lowStock = drugs.filter((d) => d.stock <= d.minStock);

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [apotekerPemesan, setApotekerPemesan] = useState("");
  const [spItems, setSpItems] = useState<SPItem[]>(
    lowStock.length > 0
      ? lowStock.map((i) => ({ itemName: i.name, qty: String(i.minStock * 2), unit: "Box", keterangan: "", hargaSatuan: "", diskon: "0" }))
      : [{ itemName: "", qty: "", unit: "Box", keterangan: "", hargaSatuan: "", diskon: "0" }]
  );

  const addRow = () => setSpItems([...spItems, { itemName: "", qty: "", unit: "Box", keterangan: "", hargaSatuan: "", diskon: "0" }]);
  const updateRow = (idx: number, field: string, value: string) => { const u = [...spItems]; u[idx] = { ...u[idx], [field]: value }; setSpItems(u); };
  const removeRow = (idx: number) => { if (spItems.length > 1) setSpItems(spItems.filter((_, i) => i !== idx)); };

  const handlePrint = () => {
    const supplier = suppliers.find((s) => s.id === selectedSupplier);
    if (!supplier) { toast({ title: "Error", description: "Pilih supplier.", variant: "destructive" }); return; }
    if (spItems.some((i) => !i.itemName || !i.qty)) { toast({ title: "Error", description: "Lengkapi semua item.", variant: "destructive" }); return; }

    const spNo = getNextSPNo('REG');
    addSPRecord({
      spNo, spType: 'REG', supplierId: supplier.id, supplierName: supplier.name,
      apotekerPemesan, items: spItems, date: new Date().toISOString(), printed: true,
    });
    printSPUnified(spNo, 'Reguler', supplier, spItems, business, apotekerPemesan);
    toast({ title: "SP Dicetak", description: `No. PO: ${spNo}` });
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Surat Pesanan Reguler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suppliers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Tambahkan supplier terlebih dahulu di tab Supplier.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Supplier *</Label>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger><SelectValue placeholder="Pilih PBF" /></SelectTrigger>
                  <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Apoteker Pemesan</Label>
                <Input value={apotekerPemesan} onChange={(e) => setApotekerPemesan(e.target.value)} placeholder="Nama apoteker yang memesan" />
              </div>
            </div>
            <div className="rounded-lg border overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Nama Obat</TableHead><TableHead>Keterangan</TableHead><TableHead className="w-20">Qty</TableHead><TableHead className="w-24">Satuan</TableHead><TableHead className="w-28">Harga</TableHead><TableHead className="w-20">Diskon</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
                <TableBody>
                  {spItems.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell><Input className="h-9" value={item.itemName} onChange={(e) => updateRow(idx, "itemName", e.target.value)} /></TableCell>
                      <TableCell><Input className="h-9" value={item.keterangan} onChange={(e) => updateRow(idx, "keterangan", e.target.value)} /></TableCell>
                      <TableCell><Input className="h-9" type="number" value={item.qty} onChange={(e) => updateRow(idx, "qty", e.target.value)} /></TableCell>
                      <TableCell>
                        <Select value={item.unit} onValueChange={(v) => updateRow(idx, "unit", v)}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>{useSettingsStore.getState().masterData.units.map((u) => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell><Input className="h-9" type="number" value={item.hargaSatuan} onChange={(e) => updateRow(idx, "hargaSatuan", e.target.value)} /></TableCell>
                      <TableCell><Input className="h-9" value={item.diskon} onChange={(e) => updateRow(idx, "diskon", e.target.value)} placeholder="0%" /></TableCell>
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ========== SP KHUSUS TAB ==========
const SPKhususTab = () => {
  const { suppliers, addSPRecord, getNextSPNo } = useProcurementStore();
  const { business } = useSettingsStore();
  const [spType, setSpType] = useState<"Narkotika" | "Psikotropika" | "Prekursor" | "Obat-Obat Tertentu">("Narkotika");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [apotekerPemesan, setApotekerPemesan] = useState("");
  const [items, setItems] = useState<SPItem[]>([{ itemName: "", qty: "", unit: "Box", keterangan: "", hargaSatuan: "", diskon: "0" }]);

  const spTypeMap: Record<string, SPRecord['spType']> = {
    "Narkotika": "NAR", "Psikotropika": "PSI", "Prekursor": "PRE", "Obat-Obat Tertentu": "OOT",
  };

  const addRow = () => setItems([...items, { itemName: "", qty: "", unit: "Box", keterangan: "", hargaSatuan: "", diskon: "0" }]);
  const updateRow = (idx: number, field: string, value: string) => { const u = [...items]; u[idx] = { ...u[idx], [field]: value }; setItems(u); };
  const removeRow = (idx: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); };

  const handlePrint = () => {
    const supplier = suppliers.find((s) => s.id === selectedSupplier);
    if (!supplier) { toast({ title: "Error", description: "Pilih supplier.", variant: "destructive" }); return; }

    const code = spTypeMap[spType];
    const spNo = getNextSPNo(code);
    addSPRecord({
      spNo, spType: code, supplierId: supplier.id, supplierName: supplier.name,
      apotekerPemesan, items, date: new Date().toISOString(), printed: true,
    });
    printSPUnified(spNo, spType, supplier, items, business, apotekerPemesan);
    toast({ title: `SP ${spType} Dicetak`, description: `No. PO: ${spNo}` });
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-destructive" /> SP Khusus</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {(["Narkotika", "Psikotropika", "Prekursor", "Obat-Obat Tertentu"] as const).map((t) => (
            <Button key={t} variant={spType === t ? "default" : "outline"} size="sm"
              className={spType === t && (t === "Narkotika" || t === "Psikotropika") ? "bg-destructive hover:bg-destructive/90" : ""}
              onClick={() => { setSpType(t); setItems([{ itemName: "", qty: "", unit: "Box", keterangan: "", hargaSatuan: "", diskon: "0" }]); }}>{t}</Button>
          ))}
        </div>
        {suppliers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Tambahkan supplier terlebih dahulu.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Supplier *</Label>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger><SelectValue placeholder="Pilih PBF" /></SelectTrigger>
                  <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Apoteker Pemesan</Label>
                <Input value={apotekerPemesan} onChange={(e) => setApotekerPemesan(e.target.value)} placeholder="Nama apoteker" />
              </div>
            </div>
            <div className="rounded-lg border overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Nama Obat</TableHead><TableHead>Keterangan</TableHead><TableHead className="w-20">Qty</TableHead><TableHead className="w-24">Satuan</TableHead><TableHead className="w-28">Harga</TableHead><TableHead className="w-20">Diskon</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell><Input className="h-9" value={item.itemName} onChange={(e) => updateRow(idx, "itemName", e.target.value)} placeholder={`Nama obat ${spType}`} /></TableCell>
                      <TableCell><Input className="h-9" value={item.keterangan} onChange={(e) => updateRow(idx, "keterangan", e.target.value)} /></TableCell>
                      <TableCell><Input className="h-9" type="number" value={item.qty} onChange={(e) => updateRow(idx, "qty", e.target.value)} /></TableCell>
                      <TableCell>
                        <Select value={item.unit} onValueChange={(v) => updateRow(idx, "unit", v)}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Box">Box</SelectItem><SelectItem value="Ampul">Ampul</SelectItem><SelectItem value="Vial">Vial</SelectItem><SelectItem value="Strip">Strip</SelectItem><SelectItem value="Tablet">Tablet</SelectItem></SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell><Input className="h-9" type="number" value={item.hargaSatuan} onChange={(e) => updateRow(idx, "hargaSatuan", e.target.value)} /></TableCell>
                      <TableCell><Input className="h-9" value={item.diskon} onChange={(e) => updateRow(idx, "diskon", e.target.value)} placeholder="0%" /></TableCell>
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ========== RIWAYAT SP TAB (with Edit) ==========
const RiwayatSPTab = () => {
  const { spRecords, updateSPRecord, removeSPRecord, suppliers } = useProcurementStore();
  const { business } = useSettingsStore();
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<SPRecord>>({});

  const spTypeLabel: Record<string, string> = { REG: 'Reguler', OOT: 'Obat-Obat Tertentu', PRE: 'Prekursor', PSI: 'Psikotropika', NAR: 'Narkotika' };

  const startEdit = (sp: SPRecord) => {
    setEditId(sp.id);
    setEditData({ apotekerPemesan: sp.apotekerPemesan, items: [...sp.items] });
  };

  const saveEdit = () => {
    if (editId && editData) {
      updateSPRecord(editId, editData);
      toast({ title: "SP Diperbarui" });
      setEditId(null);
    }
  };

  const handleReprint = (sp: SPRecord) => {
    const supplier = suppliers.find(s => s.id === sp.supplierId);
    if (!supplier) return;
    printSPUnified(sp.spNo, spTypeLabel[sp.spType], supplier, sp.items, business, sp.apotekerPemesan);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><History className="w-4 h-4 text-primary" /> Riwayat Surat Pesanan</CardTitle>
      </CardHeader>
      <CardContent>
        {spRecords.length === 0 ? (
          <p className="text-center py-8 text-sm text-muted-foreground">Belum ada riwayat SP. Buat SP baru di tab Surat Pesanan.</p>
        ) : (
          <div className="rounded-lg border overflow-auto">
            <Table>
              <TableHeader><TableRow><TableHead>No. PO</TableHead><TableHead>Jenis</TableHead><TableHead>Supplier</TableHead><TableHead>Pemesan</TableHead><TableHead>Tanggal</TableHead><TableHead>Items</TableHead><TableHead className="w-32"></TableHead></TableRow></TableHeader>
              <TableBody>
                {spRecords.slice().reverse().map((sp) => (
                  <TableRow key={sp.id}>
                    <TableCell className="font-mono text-xs">{sp.spNo}</TableCell>
                    <TableCell><Badge variant={sp.spType === 'NAR' || sp.spType === 'PSI' ? 'destructive' : 'secondary'} className="text-xs">{spTypeLabel[sp.spType]}</Badge></TableCell>
                    <TableCell className="text-sm">{sp.supplierName}</TableCell>
                    <TableCell className="text-xs">
                      {editId === sp.id ? (
                        <Input className="h-8 text-xs" value={editData.apotekerPemesan || ''} onChange={(e) => setEditData({ ...editData, apotekerPemesan: e.target.value })} />
                      ) : (sp.apotekerPemesan || '—')}
                    </TableCell>
                    <TableCell className="text-xs">{new Date(sp.date).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell className="text-xs">{sp.items.length} item</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {editId === sp.id ? (
                          <>
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={saveEdit}><Check className="w-3 h-3 mr-1" /> Simpan</Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditId(null)}>Batal</Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(sp)}><Pencil className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleReprint(sp)}><Printer className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { removeSPRecord(sp.id); toast({ title: "Dihapus" }); }}><Trash2 className="w-3 h-3" /></Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ========== SUPPLIER TAB ==========
const SupplierTab = () => {
  const { suppliers, addSupplier, updateSupplier, removeSupplier } = useProcurementStore();
  const canEdit = useCanEdit();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const emptyForm: Omit<Supplier, 'id'> = { name: '', address: '', phone: '', email: '', topDays: 30, noIzinPBF: '', noCDOB: '', bankName: '', bankAccount: '', bankAccountName: '' };
  const [form, setForm] = useState<Omit<Supplier, 'id'>>(emptyForm);

  const filtered = suppliers.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
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
            {canEdit && <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Tambah PBF</Button>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {suppliers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Belum ada supplier. Klik "Tambah PBF" untuk menambahkan.</p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Nama PBF</TableHead><TableHead>Alamat</TableHead><TableHead>Telepon</TableHead><TableHead className="text-right">TOP</TableHead><TableHead>No. Izin PBF</TableHead><TableHead>No. CDOB</TableHead><TableHead className="w-24"></TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-xs">{s.address}</TableCell>
                    <TableCell className="text-xs">{s.phone}</TableCell>
                    <TableCell className="text-right font-semibold">{s.topDays} hr</TableCell>
                    <TableCell className="text-xs">{s.noIzinPBF}</TableCell>
                    <TableCell className="text-xs">{s.noCDOB || '—'}</TableCell>
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
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? "Edit Supplier" : "Tambah PBF Baru"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2"><Label>Nama PBF *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5 col-span-2"><Label>Alamat</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Telepon</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>TOP (Hari)</Label><Input type="number" value={form.topDays} onChange={(e) => setForm({ ...form, topDays: Number(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label>No. Izin PBF</Label><Input value={form.noIzinPBF} onChange={(e) => setForm({ ...form, noIzinPBF: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>No. Sertifikat CDOB</Label><Input value={form.noCDOB} onChange={(e) => setForm({ ...form, noCDOB: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Nama Bank</Label><Input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} placeholder="BCA, Mandiri, dll" /></div>
            <div className="space-y-1.5"><Label>No. Rekening</Label><Input value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Atas Nama</Label><Input value={form.bankAccountName} onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })} /></div>
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

// ========== INVOICE TAB ==========
const InvoiceTab = () => {
  const { invoiceTrackers, markPaid } = useProcurementStore();
  const today = new Date();

  const getDaysLeft = (dueDate: string) => {
    const due = new Date(dueDate);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Status Faktur & Hitung Mundur</CardTitle>
      </CardHeader>
      <CardContent>
        {invoiceTrackers.length === 0 ? (
          <p className="text-center py-8 text-sm text-muted-foreground">Belum ada faktur. Data muncul setelah input Barang Masuk.</p>
        ) : (
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
                      <TableCell className="text-right font-medium">{formatRupiah(t.totalAmount)}</TableCell>
                      <TableCell className="text-xs">{t.receiveDate}</TableCell>
                      <TableCell className="text-xs">{t.dueDate}</TableCell>
                      <TableCell className="text-center">
                        {t.status === 'Lunas' ? <Badge className="bg-success text-success-foreground">Lunas</Badge> : (
                          <Badge className={daysLeft <= 3 ? "bg-destructive text-destructive-foreground" : daysLeft <= 7 ? "bg-warning text-warning-foreground" : "bg-info text-info-foreground"}>
                            {daysLeft > 0 ? `${daysLeft} hari` : daysLeft === 0 ? "Hari ini" : `Terlambat ${Math.abs(daysLeft)} hari`}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell><Badge variant={t.status === 'Lunas' ? "secondary" : "destructive"} className="text-xs">{t.status}</Badge></TableCell>
                      <TableCell>
                        {t.status === 'Belum Bayar' && (
                          <Button variant="outline" size="sm" className="h-7 gap-1" onClick={() => { markPaid(t.id); toast({ title: "Lunas" }); }}>
                            <Check className="w-3 h-3" /> Bayar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ========== MAIN ==========
const Procurement = () => (
  <div className="p-6 animate-fade-in">
    <h1 className="text-2xl font-bold text-foreground mb-1">Pengadaan</h1>
    <p className="text-sm text-muted-foreground mb-6">Surat pesanan, database supplier, dan tracking faktur.</p>

    <Tabs defaultValue="sp-auto" className="w-full">
      <TabsList className="mb-4 flex-wrap h-auto gap-1">
        <TabsTrigger value="sp-auto" className="gap-1.5"><FileText className="w-3.5 h-3.5" /> SP Reguler</TabsTrigger>
        <TabsTrigger value="sp-khusus" className="gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> SP Khusus</TabsTrigger>
        <TabsTrigger value="riwayat" className="gap-1.5"><History className="w-3.5 h-3.5" /> Riwayat SP</TabsTrigger>
        <TabsTrigger value="supplier" className="gap-1.5"><Building2 className="w-3.5 h-3.5" /> Supplier</TabsTrigger>
        <TabsTrigger value="faktur" className="gap-1.5"><Calendar className="w-3.5 h-3.5" /> Status Faktur</TabsTrigger>
      </TabsList>

      <TabsContent value="sp-auto"><SPOtomatisTab /></TabsContent>
      <TabsContent value="sp-khusus"><SPKhususTab /></TabsContent>
      <TabsContent value="riwayat"><RiwayatSPTab /></TabsContent>
      <TabsContent value="supplier"><SupplierTab /></TabsContent>
      <TabsContent value="faktur"><InvoiceTab /></TabsContent>
    </Tabs>
  </div>
);

export default Procurement;
