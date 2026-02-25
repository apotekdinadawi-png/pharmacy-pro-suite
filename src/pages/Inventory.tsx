import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, ArrowRightLeft, ClipboardList, PackagePlus, ClipboardCheck, Plus, ChevronDown, ChevronUp, Save, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useInventoryStore, type DrugMaster } from "@/stores/useInventoryStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useProcurementStore } from "@/stores/useProcurementStore";

const categoryColor: Record<string, string> = {
  "Obat Bebas": "bg-success text-success-foreground",
  "Obat Bebas Terbatas": "bg-info text-info-foreground",
  "Obat Keras": "bg-warning text-warning-foreground",
  "Obat Psikotropika": "bg-secondary text-secondary-foreground",
  "Obat Narkotika": "bg-destructive text-destructive-foreground",
};

const MasterObatTab = () => {
  const { drugs, addDrug, updateDrug, removeDrug } = useInventoryStore();
  const { masterData } = useSettingsStore();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<DrugMaster, 'id'>>({
    name: '', barcode: '', category: '', activeIngredient: '', baseUnit: '', sellPrice: 0, rack: '', stock: 0, minStock: 10, conversions: []
  });

  const filtered = drugs.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.barcode.includes(search));

  const openAdd = () => {
    setEditId(null);
    setForm({ name: '', barcode: '', category: '', activeIngredient: '', baseUnit: '', sellPrice: 0, rack: '', stock: 0, minStock: 10, conversions: [] });
    setDialogOpen(true);
  };

  const openEdit = (drug: DrugMaster) => {
    setEditId(drug.id);
    const { id, ...rest } = drug;
    setForm(rest);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.category || !form.baseUnit) {
      toast({ title: "Error", description: "Nama, Kategori, dan Satuan wajib diisi.", variant: "destructive" });
      return;
    }
    if (editId) {
      updateDrug(editId, form);
      toast({ title: "Berhasil", description: `${form.name} berhasil diperbarui.` });
    } else {
      addDrug(form);
      toast({ title: "Berhasil", description: `${form.name} berhasil ditambahkan ke master obat.` });
    }
    setDialogOpen(false);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" /> Data Master Obat
          </CardTitle>
          <div className="flex gap-2">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari nama / barcode..." className="pl-10 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Tambah Obat</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Nama Obat</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Zat Aktif</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead className="text-right">Harga Jual</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <>
                  <TableRow key={item.id} className="cursor-pointer" onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                    <TableCell className="px-2">
                      {expanded === item.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-xs font-mono">{item.barcode}</TableCell>
                    <TableCell><Badge className={`text-xs ${categoryColor[item.category] || "bg-muted text-muted-foreground"}`}>{item.category}</Badge></TableCell>
                    <TableCell className="text-xs">{item.activeIngredient}</TableCell>
                    <TableCell className="text-right">
                      <span className={item.stock <= item.minStock ? "text-destructive font-bold" : ""}>{item.stock}</span>
                    </TableCell>
                    <TableCell className="text-right">Rp {item.sellPrice.toLocaleString("id-ID")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { removeDrug(item.id); toast({ title: "Dihapus", description: `${item.name} dihapus dari master.` }); }}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expanded === item.id && (
                    <TableRow key={`conv-${item.id}`}>
                      <TableCell colSpan={8} className="bg-muted/30 py-3 px-6">
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowRightLeft className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">Konversi Satuan</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {item.conversions.map((c, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs py-1 px-3">1 {c.from} = {c.factor} {c.to}</Badge>
                          ))}
                          {item.conversions.length === 0 && <span className="text-xs text-muted-foreground">Belum ada konversi.</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Rak: {item.rack} | Min. Stok: {item.minStock}</p>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Tidak ada data obat.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? "Edit Obat" : "Tambah Obat Baru"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label>Nama Obat *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Barcode</Label>
              <Input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Kategori *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                <SelectContent>
                  {masterData.categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Zat Aktif</Label>
              <Input value={form.activeIngredient} onChange={(e) => setForm({ ...form, activeIngredient: e.target.value })} placeholder="Untuk alert alergi" />
            </div>
            <div className="space-y-1.5">
              <Label>Satuan Dasar *</Label>
              <Select value={form.baseUnit} onValueChange={(v) => setForm({ ...form, baseUnit: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                <SelectContent>
                  {masterData.units.map((u) => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Harga Jual (Rp)</Label>
              <Input type="number" value={form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Rak</Label>
              <Input value={form.rack} onChange={(e) => setForm({ ...form, rack: e.target.value })} placeholder="A-01" />
            </div>
            <div className="space-y-1.5">
              <Label>Stok Awal</Label>
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Min. Stok</Label>
              <Input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} />
            </div>
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

const KartuStokTab = () => {
  const { stockCards, drugs } = useInventoryStore();
  const [search, setSearch] = useState("");
  const [filterItem, setFilterItem] = useState("all");

  const filtered = stockCards.filter((s) => {
    const matchSearch = s.drugName.toLowerCase().includes(search.toLowerCase()) || s.batch.toLowerCase().includes(search.toLowerCase());
    const matchItem = filterItem === "all" || s.drugName === filterItem;
    return matchSearch && matchItem;
  });

  const uniqueItems = [...new Set(stockCards.map((s) => s.drugName))];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" /> Kartu Stok Digital
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Select value={filterItem} onValueChange={setFilterItem}>
              <SelectTrigger className="w-48 h-9"><SelectValue placeholder="Filter obat" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Obat</SelectItem>
                {uniqueItems.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari batch..." className="pl-10 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama Obat</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead>No. Batch</TableHead>
                <TableHead>Sumber</TableHead>
                <TableHead className="text-right">Stok Setelah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Belum ada data kartu stok. Data akan muncul setelah input Barang Masuk.</TableCell></TableRow>
              ) : filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-xs whitespace-nowrap">{row.date}</TableCell>
                  <TableCell className="font-medium">{row.drugName}</TableCell>
                  <TableCell>
                    <Badge className={row.type === "Masuk" ? "bg-success text-success-foreground" : "bg-accent text-accent-foreground"}>{row.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{row.type === "Masuk" ? `+${row.qty}` : `-${row.qty}`}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell className="text-xs">{row.batch}</TableCell>
                  <TableCell className="text-xs">{row.source}</TableCell>
                  <TableCell className="text-right font-semibold">{row.stockAfter}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const GRNTab = () => {
  const { drugs, addGRN } = useInventoryStore();
  const { business } = useSettingsStore();
  const { suppliers } = useProcurementStore();
  const { addInvoiceTracker } = useProcurementStore();

  const [invoiceNo, setInvoiceNo] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([{ drugId: "", qty: "", unit: "", batch: "", ed: "", buyPrice: "" }]);

  const addRow = () => setItems([...items, { drugId: "", qty: "", unit: "", batch: "", ed: "", buyPrice: "" }]);
  const updateRow = (idx: number, field: string, value: string) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };
  const removeRow = (idx: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); };

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  const handleSubmit = () => {
    if (!invoiceNo || !supplierId) {
      toast({ title: "Error", description: "No. Faktur dan Supplier wajib diisi.", variant: "destructive" });
      return;
    }
    const validItems = items.filter((i) => i.drugId && i.qty && i.buyPrice);
    if (validItems.length === 0) {
      toast({ title: "Error", description: "Minimal satu item harus diisi lengkap.", variant: "destructive" });
      return;
    }

    const supplier = suppliers.find((s) => s.id === supplierId)!;
    const ppnMultiplier = 1 + business.ppnPercent / 100;

    const grnItems = validItems.map((i) => {
      const drug = drugs.find((d) => d.id === i.drugId);
      const rawPrice = Number(i.buyPrice);
      const priceWithPPN = Math.round(rawPrice * ppnMultiplier);
      // Find last buy price from existing GRN entries (simplified: use 0 as previous)
      return {
        drugId: i.drugId,
        drugName: drug?.name || '',
        qty: Number(i.qty),
        unit: i.unit || drug?.baseUnit || '',
        batch: i.batch,
        expDate: i.ed,
        buyPrice: rawPrice,
        buyPriceWithPPN: priceWithPPN,
        previousBuyPrice: 0,
        priceIncreased: false,
      };
    });

    const totalAmount = grnItems.reduce((sum, i) => sum + i.buyPriceWithPPN * i.qty, 0);

    addGRN({
      invoiceNo,
      supplierId,
      supplierName: supplier.name,
      date: receiveDate,
      topDays: supplier.topDays,
      items: grnItems,
    });

    // Create invoice tracker with countdown
    const dueDate = new Date(receiveDate);
    dueDate.setDate(dueDate.getDate() + supplier.topDays);
    addInvoiceTracker({
      grnId: '',
      invoiceNo,
      supplierName: supplier.name,
      totalAmount,
      receiveDate,
      dueDate: dueDate.toISOString().split('T')[0],
      topDays: supplier.topDays,
      status: 'Belum Bayar',
    });

    toast({ title: "GRN Disimpan", description: `${invoiceNo} — ${grnItems.length} item masuk stok. PPN ${business.ppnPercent}% diterapkan.` });
    setInvoiceNo(""); setSupplierId(""); setItems([{ drugId: "", qty: "", unit: "", batch: "", ed: "", buyPrice: "" }]);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <PackagePlus className="w-4 h-4 text-primary" /> Input Barang Masuk (GRN)
        </CardTitle>
        <p className="text-xs text-muted-foreground">Harga beli otomatis ditambah PPN {business.ppnPercent}% dari Pengaturan.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>No. Faktur *</Label>
            <Input placeholder="F-2026-001" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Supplier / PBF *</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger><SelectValue placeholder="Pilih supplier" /></SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} (TOP {s.topDays}hr)</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tanggal Terima</Label>
            <Input type="date" value={receiveDate} onChange={(e) => setReceiveDate(e.target.value)} />
          </div>
        </div>

        {selectedSupplier && (
          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            TOP: <span className="font-semibold text-foreground">{selectedSupplier.topDays} hari</span> — Faktur ini akan jatuh tempo otomatis dan muncul di Dashboard.
          </div>
        )}

        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Obat</TableHead>
                <TableHead className="w-20">Qty</TableHead>
                <TableHead className="w-28">Satuan</TableHead>
                <TableHead>No. Batch</TableHead>
                <TableHead className="w-32">Exp. Date</TableHead>
                <TableHead className="w-32">Harga Beli</TableHead>
                <TableHead className="w-32">+ PPN ({business.ppnPercent}%)</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row, idx) => {
                const ppnPrice = row.buyPrice ? Math.round(Number(row.buyPrice) * (1 + business.ppnPercent / 100)) : 0;
                return (
                  <TableRow key={idx}>
                    <TableCell>
                      <Select value={row.drugId} onValueChange={(v) => updateRow(idx, "drugId", v)}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Pilih obat" /></SelectTrigger>
                        <SelectContent>
                          {drugs.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Input className="h-9" type="number" placeholder="0" value={row.qty} onChange={(e) => updateRow(idx, "qty", e.target.value)} /></TableCell>
                    <TableCell>
                      <Select value={row.unit} onValueChange={(v) => updateRow(idx, "unit", v)}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Satuan" /></SelectTrigger>
                        <SelectContent>
                          {useSettingsStore.getState().masterData.units.map((u) => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Input className="h-9" placeholder="B-2026-XXX" value={row.batch} onChange={(e) => updateRow(idx, "batch", e.target.value)} /></TableCell>
                    <TableCell><Input className="h-9" type="month" value={row.ed} onChange={(e) => updateRow(idx, "ed", e.target.value)} /></TableCell>
                    <TableCell><Input className="h-9" type="number" placeholder="0" value={row.buyPrice} onChange={(e) => updateRow(idx, "buyPrice", e.target.value)} /></TableCell>
                    <TableCell className="text-right text-xs font-semibold text-primary">{ppnPrice > 0 ? `Rp ${ppnPrice.toLocaleString("id-ID")}` : "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeRow(idx)} disabled={items.length === 1}>✕</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={addRow}><Plus className="w-4 h-4 mr-1" /> Tambah Baris</Button>
          <Button onClick={handleSubmit} className="gap-2"><Save className="w-4 h-4" /> Simpan GRN</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const StokOpnameTab = () => {
  const { drugs, updateDrug } = useInventoryStore();
  const [opnameData, setOpnameData] = useState(
    drugs.map((item) => ({ ...item, physicalStock: "", difference: 0, note: "" }))
  );

  const updateOpname = (idx: number, field: string, value: string) => {
    const updated = [...opnameData];
    if (field === "physicalStock") {
      const physical = parseInt(value) || 0;
      updated[idx] = { ...updated[idx], physicalStock: value, difference: physical - updated[idx].stock };
    } else {
      updated[idx] = { ...updated[idx], [field]: value };
    }
    setOpnameData(updated);
  };

  const handleSubmit = () => {
    const filled = opnameData.filter((d) => d.physicalStock !== "");
    if (filled.length === 0) {
      toast({ title: "Error", description: "Isi minimal satu stok fisik.", variant: "destructive" });
      return;
    }
    filled.forEach((d) => {
      updateDrug(d.id, { stock: parseInt(d.physicalStock) || d.stock });
    });
    const diff = filled.filter((d) => d.difference !== 0);
    toast({ title: "Stok Opname Disimpan", description: `${filled.length} item diperiksa. ${diff.length} item memiliki selisih dan stok diperbarui.` });
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-primary" /> Stok Opname
          </CardTitle>
          <Badge variant="outline" className="text-xs">Tanggal: {new Date().toLocaleDateString("id-ID")}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Obat</TableHead>
                <TableHead>Rak</TableHead>
                <TableHead className="text-right">Stok Sistem</TableHead>
                <TableHead className="w-28 text-right">Stok Fisik</TableHead>
                <TableHead className="text-right">Selisih</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opnameData.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.rack}</TableCell>
                  <TableCell className="text-right">{item.stock}</TableCell>
                  <TableCell>
                    <Input className="h-9 text-right" type="number" placeholder="—" value={item.physicalStock} onChange={(e) => updateOpname(idx, "physicalStock", e.target.value)} />
                  </TableCell>
                  <TableCell className="text-right">
                    {item.physicalStock !== "" && (
                      <span className={item.difference === 0 ? "text-primary font-semibold" : "text-destructive font-bold"}>
                        {item.difference > 0 ? `+${item.difference}` : item.difference}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input className="h-9" placeholder="Catatan..." value={item.note} onChange={(e) => updateOpname(idx, "note", e.target.value)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleSubmit} className="gap-2"><Save className="w-4 h-4" /> Simpan Hasil Opname</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Inventory = () => (
  <div className="p-6 animate-fade-in">
    <h1 className="text-2xl font-bold text-foreground mb-1">Inventaris & Gudang</h1>
    <p className="text-sm text-muted-foreground mb-6">Kelola master obat, kartu stok, barang masuk dengan PPN otomatis, dan stok opname.</p>

    <Tabs defaultValue="master" className="w-full">
      <TabsList className="mb-4 flex-wrap h-auto gap-1">
        <TabsTrigger value="master" className="gap-1.5"><Package className="w-3.5 h-3.5" /> Master Obat</TabsTrigger>
        <TabsTrigger value="kartu-stok" className="gap-1.5"><ClipboardList className="w-3.5 h-3.5" /> Kartu Stok</TabsTrigger>
        <TabsTrigger value="grn" className="gap-1.5"><PackagePlus className="w-3.5 h-3.5" /> Barang Masuk</TabsTrigger>
        <TabsTrigger value="opname" className="gap-1.5"><ClipboardCheck className="w-3.5 h-3.5" /> Stok Opname</TabsTrigger>
      </TabsList>

      <TabsContent value="master"><MasterObatTab /></TabsContent>
      <TabsContent value="kartu-stok"><KartuStokTab /></TabsContent>
      <TabsContent value="grn"><GRNTab /></TabsContent>
      <TabsContent value="opname"><StokOpnameTab /></TabsContent>
    </Tabs>
  </div>
);

export default Inventory;
