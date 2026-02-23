import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Package } from "lucide-react";
import { useState } from "react";

const inventoryData = [
  { id: 1, name: "Paracetamol 500mg", category: "Bebas", unit: "Tablet", stock: 120, minStock: 20, rack: "A-01", price: 2500 },
  { id: 2, name: "Amoxicillin 500mg", category: "Keras", unit: "Kapsul", stock: 5, minStock: 10, rack: "B-03", price: 8500 },
  { id: 3, name: "Omeprazole 20mg", category: "Keras", unit: "Kapsul", stock: 3, minStock: 10, rack: "B-05", price: 12000 },
  { id: 4, name: "Vitamin C 500mg", category: "Bebas", unit: "Tablet", stock: 200, minStock: 30, rack: "A-02", price: 3000 },
  { id: 5, name: "Cetirizine 10mg", category: "Bebas Terbatas", unit: "Tablet", stock: 7, minStock: 15, rack: "C-01", price: 5000 },
  { id: 6, name: "Diazepam 5mg", category: "Psikotropika", unit: "Tablet", stock: 25, minStock: 5, rack: "D-01", price: 15000 },
  { id: 7, name: "Codein 10mg", category: "Narkotika", unit: "Tablet", stock: 10, minStock: 5, rack: "D-02", price: 20000 },
];

const categoryColor: Record<string, string> = {
  Bebas: "bg-success text-success-foreground",
  "Bebas Terbatas": "bg-info text-info-foreground",
  Keras: "bg-warning text-warning-foreground",
  Psikotropika: "bg-secondary text-secondary-foreground",
  Narkotika: "bg-destructive text-destructive-foreground",
};

const Inventory = () => {
  const [search, setSearch] = useState("");
  const filtered = inventoryData.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-1">Inventaris & Gudang</h1>
      <p className="text-sm text-muted-foreground mb-6">Kelola data master obat, stok, dan lokasi rak.</p>

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
                  <TableHead>Nama Obat</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead>Rak</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${categoryColor[item.category] || ""}`}>{item.category}</Badge>
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right">
                      <span className={item.stock <= item.minStock ? "text-destructive font-bold" : ""}>
                        {item.stock}
                      </span>
                    </TableCell>
                    <TableCell>{item.rack}</TableCell>
                    <TableCell className="text-right">Rp {item.price.toLocaleString("id-ID")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
