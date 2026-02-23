import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, ArrowRightLeft, ClipboardList, PackagePlus, ClipboardCheck, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

// === DATA ===
const inventoryData = [
  { id: 1, name: "Paracetamol 500mg", category: "Bebas", baseUnit: "Tablet", stock: 120, minStock: 20, rack: "A-01", price: 2500, conversions: [{ from: "Box", to: "Strip", factor: 10 }, { from: "Strip", to: "Tablet", factor: 10 }] },
  { id: 2, name: "Amoxicillin 500mg", category: "Keras", baseUnit: "Kapsul", stock: 5, minStock: 10, rack: "B-03", price: 8500, conversions: [{ from: "Box", to: "Strip", factor: 10 }, { from: "Strip", to: "Kapsul", factor: 10 }] },
  { id: 3, name: "Omeprazole 20mg", category: "Keras", baseUnit: "Kapsul", stock: 3, minStock: 10, rack: "B-05", price: 12000, conversions: [{ from: "Box", to: "Strip", factor: 5 }, { from: "Strip", to: "Kapsul", factor: 10 }] },
  { id: 4, name: "Vitamin C 500mg", category: "Bebas", baseUnit: "Tablet", stock: 200, minStock: 30, rack: "A-02", price: 3000, conversions: [{ from: "Botol", to: "Tablet", factor: 30 }] },
  { id: 5, name: "Cetirizine 10mg", category: "Bebas Terbatas", baseUnit: "Tablet", stock: 7, minStock: 15, rack: "C-01", price: 5000, conversions: [{ from: "Box", to: "Strip", factor: 10 }, { from: "Strip", to: "Tablet", factor: 10 }] },
  { id: 6, name: "Diazepam 5mg", category: "Psikotropika", baseUnit: "Tablet", stock: 25, minStock: 5, rack: "D-01", price: 15000, conversions: [{ from: "Box", to: "Strip", factor: 5 }, { from: "Strip", to: "Tablet", factor: 10 }] },
  { id: 7, name: "Codein 10mg", category: "Narkotika", baseUnit: "Tablet", stock: 10, minStock: 5, rack: "D-02", price: 20000, conversions: [{ from: "Box", to: "Strip", factor: 5 }, { from: "Strip", to: "Tablet", factor: 10 }] },
];

const stockCardData = [
  { id: 1, date: "2026-02-23 08:30", item: "Paracetamol 500mg", type: "Masuk", qty: 100, unit: "Tablet", batch: "B-2026-001", ed: "2028-01", source: "GRN #F-001", user: "Admin", stockAfter: 220 },
  { id: 2, date: "2026-02-23 09:15", item: "Paracetamol 500mg", type: "Keluar", qty: 10, unit: "Tablet", batch: "B-2025-005", ed: "2027-06", source: "TRX-0042", user: "Kasir1", stockAfter: 210 },
  { id: 3, date: "2026-02-22 14:00", item: "Amoxicillin 500mg", type: "Masuk", qty: 50, unit: "Kapsul", batch: "B-2026-010", ed: "2028-03", source: "GRN #F-003", user: "Admin", stockAfter: 55 },
  { id: 4, date: "2026-02-22 16:30", item: "Amoxicillin 500mg", type: "Keluar", qty: 20, unit: "Kapsul", batch: "B-2025-008", ed: "2027-01", source: "TRX-0039", user: "Kasir2", stockAfter: 35 },
  { id: 5, date: "2026-02-21 10:00", item: "Vitamin C 500mg", type: "Masuk", qty: 60, unit: "Tablet", batch: "B-2026-015", ed: "2028-06", source: "GRN #F-005", user: "Admin", stockAfter: 260 },
  { id: 6, date: "2026-02-21 11:45", item: "Omeprazole 20mg", type: "Keluar", qty: 5, unit: "Kapsul", batch: "B-2025-012", ed: "2027-04", source: "TRX-0035", user: "Kasir1", stockAfter: 8 },
  { id: 7, date: "2026-02-20 09:00", item: "Cetirizine 10mg", type: "Masuk", qty: 30, unit: "Tablet", batch: "B-2026-020", ed: "2028-09", source: "GRN #F-007", user: "Admin", stockAfter: 37 },
];

const categoryColor: Record<string, string> = {
  Bebas: "bg-success text-success-foreground",
  "Bebas Terbatas": "bg-info text-info-foreground",
  Keras: "bg-warning text-warning-foreground",
  Psikotropika: "bg-secondary text-secondary-foreground",
  Narkotika: "bg-destructive text-destructive-foreground",
};

// === SUB-COMPONENTS ===

const MasterObatTab = () => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const filtered = inventoryData.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" /> Data Master Obat
          </CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari obat..." className="pl-10 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                <TableHead>Kategori</TableHead>
                <TableHead>Satuan Dasar</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead>Rak</TableHead>
                <TableHead className="text-right">Harga</TableHead>
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
                    <TableCell>
                      <Badge className={`text-xs ${categoryColor[item.category] || ""}`}>{item.category}</Badge>
                    </TableCell>
                    <TableCell>{item.baseUnit}</TableCell>
                    <TableCell className="text-right">
                      <span className={item.stock <= item.minStock ? "text-destructive font-bold" : ""}>{item.stock}</span>
                    </TableCell>
                    <TableCell>{item.rack}</TableCell>
                    <TableCell className="text-right">Rp {item.price.toLocaleString("id-ID")}</TableCell>
                  </TableRow>
                  {expanded === item.id && (
                    <TableRow key={`conv-${item.id}`}>
                      <TableCell colSpan={7} className="bg-muted/30 py-3 px-6">
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowRightLeft className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">Konversi Satuan</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {item.conversions.map((c, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs py-1 px-3">
                              1 {c.from} = {c.factor} {c.to}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Stok setara: {item.conversions.length > 0 && (() => {
                            let totalBase = item.stock;
                            const chain = [...item.conversions].reverse();
                            const parts: string[] = [];
                            for (const c of chain) {
                              const bigUnit = Math.floor(totalBase / c.factor);
                              const remainder = totalBase % c.factor;
                              if (bigUnit > 0) parts.push(`${bigUnit} ${c.from}`);
                              totalBase = remainder;
                            }
                            if (totalBase > 0) parts.push(`${totalBase} ${item.baseUnit}`);
                            return parts.join(" + ") || `0 ${item.baseUnit}`;
                          })()}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const KartuStokTab = () => {
  const [search, setSearch] = useState("");
  const [filterItem, setFilterItem] = useState("all");

  const filtered = stockCardData.filter((s) => {
    const matchSearch = s.item.toLowerCase().includes(search.toLowerCase()) || s.batch.toLowerCase().includes(search.toLowerCase());
    const matchItem = filterItem === "all" || s.item === filterItem;
    return matchSearch && matchItem;
  });

  const uniqueItems = [...new Set(stockCardData.map((s) => s.item))];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" /> Kartu Stok Digital (FEFO)
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Select value={filterItem} onValueChange={setFilterItem}>
              <SelectTrigger className="w-48 h-9"><SelectValue placeholder="Filter obat" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Obat</SelectItem>
                {uniqueItems.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
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
                <TableHead>Tanggal & Jam</TableHead>
                <TableHead>Nama Obat</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead>No. Batch</TableHead>
                <TableHead>ED</TableHead>
                <TableHead>Sumber</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Stok Setelah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-xs whitespace-nowrap">{row.date}</TableCell>
                  <TableCell className="font-medium">{row.item}</TableCell>
                  <TableCell>
                    <Badge className={row.type === "Masuk" ? "bg-success text-success-foreground" : "bg-accent text-accent-foreground"} >
                      {row.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{row.type === "Masuk" ? `+${row.qty}` : `-${row.qty}`}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell className="text-xs">{row.batch}</TableCell>
                  <TableCell className="text-xs">{row.ed}</TableCell>
                  <TableCell className="text-xs">{row.source}</TableCell>
                  <TableCell className="text-xs">{row.user}</TableCell>
                  <TableCell className="text-right font-semibold">{row.stockAfter}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Tidak ada data kartu stok.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const GRNTab = () => {
  const [invoiceNo, setInvoiceNo] = useState("");
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState([{ itemId: "", qty: "", unit: "", batch: "", ed: "", price: "" }]);

  const addRow = () => setItems([...items, { itemId: "", qty: "", unit: "", batch: "", ed: "", price: "" }]);
  const updateRow = (idx: number, field: string, value: string) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };
  const removeRow = (idx: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); };

  const handleSubmit = () => {
    if (!invoiceNo || !supplier) {
      toast({ title: "Error", description: "No. Faktur dan Supplier wajib diisi.", variant: "destructive" });
      return;
    }
    toast({ title: "Berhasil", description: `GRN ${invoiceNo} berhasil disimpan. ${items.length} item ditambahkan ke stok.` });
    setInvoiceNo(""); setSupplier(""); setItems([{ itemId: "", qty: "", unit: "", batch: "", ed: "", price: "" }]);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <PackagePlus className="w-4 h-4 text-primary" /> Input Barang Masuk (Goods Receipt Note)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>No. Faktur *</Label>
            <Input placeholder="F-2026-001" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Supplier / PBF *</Label>
            <Select value={supplier} onValueChange={setSupplier}>
              <SelectTrigger><SelectValue placeholder="Pilih supplier" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PT Kimia Farma">PT Kimia Farma</SelectItem>
                <SelectItem value="PT Enseval">PT Enseval</SelectItem>
                <SelectItem value="PT Anugrah Argon">PT Anugrah Argon</SelectItem>
                <SelectItem value="PT Tempo">PT Tempo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tanggal Terima</Label>
            <Input type="date" defaultValue="2026-02-23" />
          </div>
        </div>

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
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Select value={row.itemId} onValueChange={(v) => updateRow(idx, "itemId", v)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Pilih obat" /></SelectTrigger>
                      <SelectContent>
                        {inventoryData.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Input className="h-9" type="number" placeholder="0" value={row.qty} onChange={(e) => updateRow(idx, "qty", e.target.value)} /></TableCell>
                  <TableCell>
                    <Select value={row.unit} onValueChange={(v) => updateRow(idx, "unit", v)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Satuan" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Box">Box</SelectItem>
                        <SelectItem value="Strip">Strip</SelectItem>
                        <SelectItem value="Tablet">Tablet</SelectItem>
                        <SelectItem value="Kapsul">Kapsul</SelectItem>
                        <SelectItem value="Botol">Botol</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Input className="h-9" placeholder="B-2026-XXX" value={row.batch} onChange={(e) => updateRow(idx, "batch", e.target.value)} /></TableCell>
                  <TableCell><Input className="h-9" type="month" value={row.ed} onChange={(e) => updateRow(idx, "ed", e.target.value)} /></TableCell>
                  <TableCell><Input className="h-9" type="number" placeholder="0" value={row.price} onChange={(e) => updateRow(idx, "price", e.target.value)} /></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeRow(idx)} disabled={items.length === 1}>✕</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={addRow}><Plus className="w-4 h-4 mr-1" /> Tambah Baris</Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">Simpan GRN</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const StokOpnameTab = () => {
  const [opnameData, setOpnameData] = useState(
    inventoryData.map((item) => ({ ...item, physicalStock: "", difference: 0, note: "" }))
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
    const diff = filled.filter((d) => d.difference !== 0);
    toast({
      title: "Stok Opname Disimpan",
      description: `${filled.length} item diperiksa. ${diff.length} item memiliki selisih.`,
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-primary" /> Stok Opname
          </CardTitle>
          <Badge variant="outline" className="text-xs">Tanggal: 23 Feb 2026</Badge>
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
                      <span className={item.difference === 0 ? "text-success font-semibold" : "text-destructive font-bold"}>
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
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">Simpan Hasil Opname</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// === MAIN ===
const Inventory = () => {
  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-1">Inventaris & Gudang</h1>
      <p className="text-sm text-muted-foreground mb-6">Kelola data master obat, stok, konversi satuan, dan stok opname.</p>

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
};

export default Inventory;
