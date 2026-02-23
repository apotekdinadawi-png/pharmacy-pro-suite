import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus, CreditCard, Banknote, QrCode, Pause, Printer, ShoppingCart } from "lucide-react";
import { useState } from "react";

const sampleProducts = [
  { id: 1, name: "Paracetamol 500mg", price: 2500, stock: 120, unit: "Tablet" },
  { id: 2, name: "Amoxicillin 500mg", price: 8500, stock: 45, unit: "Kapsul" },
  { id: 3, name: "Vitamin C 500mg", price: 3000, stock: 200, unit: "Tablet" },
  { id: 4, name: "Omeprazole 20mg", price: 12000, stock: 30, unit: "Kapsul" },
  { id: 5, name: "Cetirizine 10mg", price: 5000, stock: 80, unit: "Tablet" },
];

type CartItem = { id: number; name: string; price: number; qty: number; unit: string };

const Transactions = () => {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const filtered = sampleProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-1">Transaksi / Kasir</h1>
      <p className="text-sm text-muted-foreground mb-6">Point of Sale — Cari obat, tambah ke keranjang, selesaikan transaksi.</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Product List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama obat, barcode, atau kegunaan..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            {filtered.map((p) => (
              <Card key={p.id} className="glass-card cursor-pointer hover:shadow-md transition-shadow" onClick={() => addToCart(p)}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Stok: {p.stock} {p.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">Rp {p.price.toLocaleString("id-ID")}</p>
                    <p className="text-xs text-muted-foreground">/{p.unit}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-2">
          <Card className="glass-card sticky top-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" />
                Keranjang
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cart.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Keranjang kosong. Klik obat untuk menambahkan.</p>
              )}
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Rp {item.price.toLocaleString("id-ID")} x {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
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

              {cart.length > 0 && (
                <>
                  <div className="border-t border-border pt-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-foreground">Total</span>
                    <span className="text-lg font-bold text-primary">Rp {total.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="text-xs gap-1"><Banknote className="w-3 h-3" /> Tunai</Button>
                    <Button variant="outline" size="sm" className="text-xs gap-1"><CreditCard className="w-3 h-3" /> Debit</Button>
                    <Button variant="outline" size="sm" className="text-xs gap-1"><QrCode className="w-3 h-3" /> QRIS</Button>
                    <Button variant="outline" size="sm" className="text-xs gap-1"><Pause className="w-3 h-3" /> Pending</Button>
                  </div>
                  <Button className="w-full gradient-primary text-primary-foreground gap-2">
                    <Printer className="w-4 h-4" /> Bayar & Cetak Struk
                  </Button>
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
