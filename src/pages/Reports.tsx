import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3, TrendingUp, TrendingDown, FileText, Users, Printer, Download,
  ArrowUpRight, ArrowDownRight, Search, Calendar, AlertTriangle, Package
} from "lucide-react";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// ========== MOCK DATA ==========
const labaRugiData = {
  periode: "Januari 2026",
  pendapatan: [
    { item: "Penjualan Obat Resep", jumlah: 45_800_000 },
    { item: "Penjualan Obat Bebas (OTC)", jumlah: 32_500_000 },
    { item: "Penjualan Alkes & Suplemen", jumlah: 8_200_000 },
    { item: "Jasa Racikan", jumlah: 3_600_000 },
    { item: "Pendapatan Lain-lain", jumlah: 1_200_000 },
  ],
  hpp: [
    { item: "Pembelian Obat", jumlah: 52_300_000 },
    { item: "Perubahan Persediaan", jumlah: -2_100_000 },
  ],
  biayaOperasional: [
    { item: "Gaji & Tunjangan Karyawan", jumlah: 12_000_000 },
    { item: "Sewa Tempat", jumlah: 5_000_000 },
    { item: "Listrik, Air & Internet", jumlah: 1_800_000 },
    { item: "Perlengkapan Apotek", jumlah: 800_000 },
    { item: "Biaya Lain-lain", jumlah: 500_000 },
  ],
};

const fastMovingItems = [
  { rank: 1, nama: "Paracetamol 500mg", kategori: "Analgesik", terjual: 342, satuan: "Strip", revenue: 1_710_000, trend: 12 },
  { rank: 2, nama: "Amoxicillin 500mg", kategori: "Antibiotik", terjual: 285, satuan: "Strip", revenue: 4_275_000, trend: 8 },
  { rank: 3, nama: "Omeprazole 20mg", kategori: "Gastrointestinal", terjual: 256, satuan: "Strip", revenue: 3_840_000, trend: 15 },
  { rank: 4, nama: "Cetirizine 10mg", kategori: "Antihistamin", terjual: 198, satuan: "Strip", revenue: 990_000, trend: -3 },
  { rank: 5, nama: "Metformin 500mg", kategori: "Antidiabetes", terjual: 187, satuan: "Strip", revenue: 1_870_000, trend: 5 },
  { rank: 6, nama: "Amlodipine 5mg", kategori: "Antihipertensi", terjual: 175, satuan: "Strip", revenue: 1_750_000, trend: 10 },
  { rank: 7, nama: "Vitamin C 500mg", kategori: "Suplemen", terjual: 165, satuan: "Botol", revenue: 4_950_000, trend: 20 },
  { rank: 8, nama: "Ibuprofen 400mg", kategori: "Analgesik", terjual: 152, satuan: "Strip", revenue: 1_064_000, trend: -1 },
  { rank: 9, nama: "Antacida DOEN", kategori: "Gastrointestinal", terjual: 140, satuan: "Botol", revenue: 980_000, trend: 2 },
  { rank: 10, nama: "Dexamethasone 0.5mg", kategori: "Kortikosteroid", terjual: 128, satuan: "Strip", revenue: 640_000, trend: 7 },
];

const slowMovingItems = [
  { rank: 1, nama: "Chlorpromazine 100mg", kategori: "Psikotropika", terjual: 2, satuan: "Strip", stok: 45, hari_terjual: 90 },
  { rank: 2, nama: "Diazepam 5mg", kategori: "Psikotropika", terjual: 3, satuan: "Strip", stok: 38, hari_terjual: 75 },
  { rank: 3, nama: "Phenobarbital 30mg", kategori: "Psikotropika", terjual: 4, satuan: "Strip", stok: 50, hari_terjual: 60 },
  { rank: 4, nama: "Ergotamine 1mg", kategori: "Obat Keras", terjual: 5, satuan: "Strip", stok: 30, hari_terjual: 55 },
  { rank: 5, nama: "Nystatin Drop", kategori: "Antijamur", terjual: 3, satuan: "Botol", stok: 22, hari_terjual: 50 },
  { rank: 6, nama: "Piracetam 800mg", kategori: "Nootropik", terjual: 6, satuan: "Strip", stok: 40, hari_terjual: 48 },
  { rank: 7, nama: "Betahistine 6mg", kategori: "Antivertigo", terjual: 5, satuan: "Strip", stok: 35, hari_terjual: 45 },
  { rank: 8, nama: "Haloperidol 1.5mg", kategori: "Psikotropika", terjual: 2, satuan: "Strip", stok: 25, hari_terjual: 42 },
];

const sipnapData = [
  { bulan: "Jul", narkotika_masuk: 15, narkotika_keluar: 12, psikotropika_masuk: 45, psikotropika_keluar: 38 },
  { bulan: "Agu", narkotika_masuk: 10, narkotika_keluar: 14, psikotropika_masuk: 50, psikotropika_keluar: 42 },
  { bulan: "Sep", narkotika_masuk: 20, narkotika_keluar: 11, psikotropika_masuk: 35, psikotropika_keluar: 40 },
  { bulan: "Okt", narkotika_masuk: 12, narkotika_keluar: 15, psikotropika_masuk: 48, psikotropika_keluar: 44 },
  { bulan: "Nov", narkotika_masuk: 18, narkotika_keluar: 13, psikotropika_masuk: 40, psikotropika_keluar: 36 },
  { bulan: "Des", narkotika_masuk: 14, narkotika_keluar: 16, psikotropika_masuk: 55, psikotropika_keluar: 50 },
];

const sipnapDetailNarkotika = [
  { nama: "Codeine 10mg", saldo_awal: 20, masuk: 15, keluar: 12, saldo_akhir: 23, satuan: "Tablet" },
  { nama: "Morphine Sulfate 10mg", saldo_awal: 10, masuk: 5, keluar: 3, saldo_akhir: 12, satuan: "Ampul" },
  { nama: "Pethidine 50mg", saldo_awal: 8, masuk: 0, keluar: 2, saldo_akhir: 6, satuan: "Ampul" },
  { nama: "Fentanyl Patch 25mcg", saldo_awal: 5, masuk: 10, keluar: 4, saldo_akhir: 11, satuan: "Patch" },
];

const sipnapDetailPsikotropika = [
  { nama: "Diazepam 5mg", saldo_awal: 50, masuk: 30, keluar: 25, saldo_akhir: 55, satuan: "Tablet" },
  { nama: "Alprazolam 0.5mg", saldo_awal: 40, masuk: 20, keluar: 22, saldo_akhir: 38, satuan: "Tablet" },
  { nama: "Chlordiazepoxide 5mg", saldo_awal: 30, masuk: 15, keluar: 10, saldo_akhir: 35, satuan: "Tablet" },
  { nama: "Phenobarbital 30mg", saldo_awal: 60, masuk: 25, keluar: 18, saldo_akhir: 67, satuan: "Tablet" },
  { nama: "Tramadol 50mg", saldo_awal: 45, masuk: 35, keluar: 30, saldo_akhir: 50, satuan: "Kapsul" },
];

const kasirData = [
  { nama: "Apt. Siti Nurhaliza", role: "Apoteker", transaksi: 145, total: 32_500_000, rata2: 224_138, resep: 89, racikan: 23 },
  { nama: "Dewi Kartika", role: "Asisten Apoteker", transaksi: 132, total: 28_200_000, rata2: 213_636, resep: 72, racikan: 15 },
  { nama: "Budi Santoso", role: "Asisten Apoteker", transaksi: 118, total: 22_800_000, rata2: 193_220, resep: 58, racikan: 12 },
  { nama: "Rina Maharani", role: "Kasir", transaksi: 98, total: 15_600_000, rata2: 159_184, resep: 0, racikan: 0 },
];

const kasirChartData = [
  { nama: "Apt. Siti", transaksi: 145, revenue: 32.5 },
  { nama: "Dewi K.", transaksi: 132, revenue: 28.2 },
  { nama: "Budi S.", transaksi: 118, revenue: 22.8 },
  { nama: "Rina M.", transaksi: 98, revenue: 15.6 },
];

const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);
const fmtRp = (n: number) => `Rp ${fmt(n)}`;

// ========== SUB-COMPONENTS ==========

const LabaRugiTab = () => {
  const totalPendapatan = labaRugiData.pendapatan.reduce((s, i) => s + i.jumlah, 0);
  const totalHPP = labaRugiData.hpp.reduce((s, i) => s + i.jumlah, 0);
  const labaKotor = totalPendapatan - totalHPP;
  const totalBiaya = labaRugiData.biayaOperasional.reduce((s, i) => s + i.jumlah, 0);
  const labaBersih = labaKotor - totalBiaya;
  const margin = ((labaBersih / totalPendapatan) * 100).toFixed(1);

  const printLabaRugi = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Laporan Laba Rugi - ${labaRugiData.periode}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;max-width:700px;margin:auto}
      h1{text-align:center;font-size:18px}h2{font-size:14px;margin-top:24px;border-bottom:1px solid #333;padding-bottom:4px}
      table{width:100%;border-collapse:collapse;margin:8px 0}td{padding:4px 8px;font-size:13px}
      .right{text-align:right}.bold{font-weight:bold}.total{border-top:2px solid #333}
      .net{font-size:16px;background:#f0f7f0;padding:8px;margin-top:16px;text-align:center;border-radius:4px}
      .loss{background:#fef2f2}</style></head><body>
      <h1>LAPORAN LABA RUGI</h1><p style="text-align:center">Periode: ${labaRugiData.periode}</p>
      <h2>Pendapatan</h2><table>${labaRugiData.pendapatan.map(i => `<tr><td>${i.item}</td><td class="right">${fmtRp(i.jumlah)}</td></tr>`).join("")}
      <tr class="total bold"><td>Total Pendapatan</td><td class="right">${fmtRp(totalPendapatan)}</td></tr></table>
      <h2>Harga Pokok Penjualan</h2><table>${labaRugiData.hpp.map(i => `<tr><td>${i.item}</td><td class="right">${fmtRp(i.jumlah)}</td></tr>`).join("")}
      <tr class="total bold"><td>Total HPP</td><td class="right">${fmtRp(totalHPP)}</td></tr></table>
      <table><tr class="bold"><td>Laba Kotor</td><td class="right">${fmtRp(labaKotor)}</td></tr></table>
      <h2>Biaya Operasional</h2><table>${labaRugiData.biayaOperasional.map(i => `<tr><td>${i.item}</td><td class="right">${fmtRp(i.jumlah)}</td></tr>`).join("")}
      <tr class="total bold"><td>Total Biaya</td><td class="right">${fmtRp(totalBiaya)}</td></tr></table>
      <div class="net ${labaBersih < 0 ? 'loss' : ''}"><strong>LABA BERSIH: ${fmtRp(labaBersih)}</strong> (Margin: ${margin}%)</div>
      </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select defaultValue="jan-2026">
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="jan-2026">Januari 2026</SelectItem>
              <SelectItem value="des-2025">Desember 2025</SelectItem>
              <SelectItem value="nov-2025">November 2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={printLabaRugi}><Printer className="w-4 h-4 mr-1" />Cetak</Button>
      </div>

      {/* Summary Cards */}
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
          <p className={`text-lg font-bold ${labaBersih >= 0 ? "text-emerald-600" : "text-red-500"}`}>{fmtRp(labaBersih)}</p>
          <p className="text-xs text-muted-foreground">Margin {margin}%</p>
        </CardContent></Card>
      </div>

      {/* Detail Table */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Detail Laba Rugi</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Keterangan</TableHead><TableHead className="text-right">Jumlah</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-muted/30"><TableCell colSpan={2} className="font-semibold">Pendapatan</TableCell></TableRow>
              {labaRugiData.pendapatan.map(i => (
                <TableRow key={i.item}><TableCell className="pl-6">{i.item}</TableCell><TableCell className="text-right">{fmtRp(i.jumlah)}</TableCell></TableRow>
              ))}
              <TableRow className="font-semibold border-t-2"><TableCell className="pl-6">Total Pendapatan</TableCell><TableCell className="text-right">{fmtRp(totalPendapatan)}</TableCell></TableRow>
              <TableRow className="bg-muted/30"><TableCell colSpan={2} className="font-semibold">Harga Pokok Penjualan</TableCell></TableRow>
              {labaRugiData.hpp.map(i => (
                <TableRow key={i.item}><TableCell className="pl-6">{i.item}</TableCell><TableCell className="text-right">{fmtRp(i.jumlah)}</TableCell></TableRow>
              ))}
              <TableRow className="font-semibold border-t-2"><TableCell className="pl-6">Total HPP</TableCell><TableCell className="text-right">{fmtRp(totalHPP)}</TableCell></TableRow>
              <TableRow className="font-bold bg-accent/20"><TableCell>LABA KOTOR</TableCell><TableCell className="text-right">{fmtRp(labaKotor)}</TableCell></TableRow>
              <TableRow className="bg-muted/30"><TableCell colSpan={2} className="font-semibold">Biaya Operasional</TableCell></TableRow>
              {labaRugiData.biayaOperasional.map(i => (
                <TableRow key={i.item}><TableCell className="pl-6">{i.item}</TableCell><TableCell className="text-right">{fmtRp(i.jumlah)}</TableCell></TableRow>
              ))}
              <TableRow className="font-semibold border-t-2"><TableCell className="pl-6">Total Biaya Operasional</TableCell><TableCell className="text-right">{fmtRp(totalBiaya)}</TableCell></TableRow>
              <TableRow className={`font-bold text-lg ${labaBersih >= 0 ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-red-50 dark:bg-red-950/20"}`}>
                <TableCell>LABA BERSIH</TableCell><TableCell className="text-right">{fmtRp(labaBersih)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const FastSlowTab = () => {
  const [view, setView] = useState<"fast" | "slow">("fast");
  const [search, setSearch] = useState("");

  const items = view === "fast" ? fastMovingItems : slowMovingItems;
  const filtered = items.filter(i => i.nama.toLowerCase().includes(search.toLowerCase()) || i.kategori.toLowerCase().includes(search.toLowerCase()));

  const chartConfig = { terjual: { label: "Terjual", color: "hsl(var(--primary))" } };
  const chartData = (view === "fast" ? fastMovingItems.slice(0, 7) : slowMovingItems.slice(0, 7)).map(i => ({
    nama: i.nama.length > 15 ? i.nama.slice(0, 15) + "…" : i.nama,
    terjual: i.terjual,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <Button size="sm" variant={view === "fast" ? "default" : "ghost"} onClick={() => setView("fast")}>
            <TrendingUp className="w-4 h-4 mr-1" />Fast Moving
          </Button>
          <Button size="sm" variant={view === "slow" ? "default" : "ghost"} onClick={() => setView("slow")}>
            <TrendingDown className="w-4 h-4 mr-1" />Slow Moving
          </Button>
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari obat atau kategori..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select defaultValue="7">
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 Hari</SelectItem>
            <SelectItem value="30">30 Hari</SelectItem>
            <SelectItem value="90">90 Hari</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{view === "fast" ? "Top Fast Moving Items" : "Slow Moving Items (Perlu Perhatian)"}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart data={chartData} layout="vertical" margin={{ left: 100, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="nama" width={95} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="terjual" fill="var(--color-terjual)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Nama Obat</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Terjual</TableHead>
                {view === "fast" ? (
                  <>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="text-right">Sisa Stok</TableHead>
                    <TableHead className="text-right">Hari Terjual</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item: any) => (
                <TableRow key={item.rank}>
                  <TableCell className="font-medium">{item.rank}</TableCell>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell><Badge variant="outline">{item.kategori}</Badge></TableCell>
                  <TableCell className="text-right">{item.terjual} {item.satuan}</TableCell>
                  {view === "fast" ? (
                    <>
                      <TableCell className="text-right">{fmtRp(item.revenue)}</TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${item.trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {item.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {Math.abs(item.trend)}%
                        </span>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="text-right">{item.stok}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={item.hari_terjual > 60 ? "destructive" : "secondary"}>{item.hari_terjual} hari</Badge>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const SIPNAPTab = () => {
  const [kategori, setKategori] = useState<"narkotika" | "psikotropika">("narkotika");
  const detail = kategori === "narkotika" ? sipnapDetailNarkotika : sipnapDetailPsikotropika;

  const chartConfig = {
    masuk: { label: "Masuk", color: "hsl(var(--primary))" },
    keluar: { label: "Keluar", color: "hsl(var(--destructive))" },
  };
  const chartData = sipnapData.map(d => ({
    bulan: d.bulan,
    masuk: kategori === "narkotika" ? d.narkotika_masuk : d.psikotropika_masuk,
    keluar: kategori === "narkotika" ? d.narkotika_keluar : d.psikotropika_keluar,
  }));

  const printSIPNAP = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const title = kategori === "narkotika" ? "NARKOTIKA" : "PSIKOTROPIKA";
    w.document.write(`<html><head><title>Laporan SIPNAP ${title}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:auto}
      h1{text-align:center;font-size:16px}table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #333;padding:6px 8px;font-size:12px;text-align:center}
      th{background:#f5f5f5;font-weight:bold}.header{text-align:center;margin-bottom:20px}
      .footer{margin-top:40px;display:flex;justify-content:space-between;font-size:12px}</style></head><body>
      <div class="header"><h1>LAPORAN PEMAKAIAN ${title}</h1>
      <p style="font-size:12px">Periode: Juli - Desember 2025</p>
      <p style="font-size:12px">Apotek Sehat Farma | SIA: 12345/DINAS/2024</p></div>
      <table><thead><tr><th>No</th><th>Nama Obat</th><th>Satuan</th><th>Saldo Awal</th><th>Pemasukan</th><th>Pengeluaran</th><th>Saldo Akhir</th></tr></thead>
      <tbody>${detail.map((d, i) => `<tr><td>${i + 1}</td><td style="text-align:left">${d.nama}</td><td>${d.satuan}</td><td>${d.saldo_awal}</td><td>${d.masuk}</td><td>${d.keluar}</td><td>${d.saldo_akhir}</td></tr>`).join("")}</tbody></table>
      <div class="footer"><div>Mengetahui,<br><br><br><br>Kepala Dinas Kesehatan</div><div style="text-align:center">........, ../../....<br><br><br><br>Apoteker Penanggung Jawab<br>SIPA: ............</div></div>
      </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <Button size="sm" variant={kategori === "narkotika" ? "default" : "ghost"} onClick={() => setKategori("narkotika")}>
            <AlertTriangle className="w-4 h-4 mr-1" />Narkotika
          </Button>
          <Button size="sm" variant={kategori === "psikotropika" ? "default" : "ghost"} onClick={() => setKategori("psikotropika")}>
            <Package className="w-4 h-4 mr-1" />Psikotropika
          </Button>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="semester-2-2025">
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="semester-2-2025">Semester 2 - 2025</SelectItem>
              <SelectItem value="semester-1-2025">Semester 1 - 2025</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={printSIPNAP}><Printer className="w-4 h-4 mr-1" />Cetak SIPNAP</Button>
        </div>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Tren Pemasukan & Pengeluaran {kategori === "narkotika" ? "Narkotika" : "Psikotropika"}</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="masuk" stroke="var(--color-masuk)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="keluar" stroke="var(--color-keluar)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Detail Table */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Detail {kategori === "narkotika" ? "Narkotika" : "Psikotropika"}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama Obat</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead className="text-right">Saldo Awal</TableHead>
                <TableHead className="text-right">Masuk</TableHead>
                <TableHead className="text-right">Keluar</TableHead>
                <TableHead className="text-right">Saldo Akhir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.map((d, i) => (
                <TableRow key={d.nama}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium">{d.nama}</TableCell>
                  <TableCell>{d.satuan}</TableCell>
                  <TableCell className="text-right">{d.saldo_awal}</TableCell>
                  <TableCell className="text-right text-emerald-600 font-medium">+{d.masuk}</TableCell>
                  <TableCell className="text-right text-red-500 font-medium">-{d.keluar}</TableCell>
                  <TableCell className="text-right font-bold">{d.saldo_akhir}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/50">
                <TableCell colSpan={3}>TOTAL</TableCell>
                <TableCell className="text-right">{detail.reduce((s, d) => s + d.saldo_awal, 0)}</TableCell>
                <TableCell className="text-right text-emerald-600">+{detail.reduce((s, d) => s + d.masuk, 0)}</TableCell>
                <TableCell className="text-right text-red-500">-{detail.reduce((s, d) => s + d.keluar, 0)}</TableCell>
                <TableCell className="text-right">{detail.reduce((s, d) => s + d.saldo_akhir, 0)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const KasirTab = () => {
  const totalTransaksi = kasirData.reduce((s, k) => s + k.transaksi, 0);
  const totalRevenue = kasirData.reduce((s, k) => s + k.total, 0);

  const chartConfig = {
    transaksi: { label: "Transaksi", color: "hsl(var(--primary))" },
    revenue: { label: "Revenue (Juta)", color: "hsl(var(--accent))" },
  };

  const pieData = kasirData.map((k, i) => ({
    name: k.nama.split(" ").slice(-1)[0],
    value: k.transaksi,
    fill: ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted))"][i],
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select defaultValue="jan-2026">
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="jan-2026">Januari 2026</SelectItem>
            <SelectItem value="des-2025">Desember 2025</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-3 text-sm text-muted-foreground">
          <span>Total: <strong className="text-foreground">{totalTransaksi} transaksi</strong></span>
          <span>Revenue: <strong className="text-foreground">{fmtRp(totalRevenue)}</strong></span>
        </div>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Performa Kasir</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart data={kasirChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nama" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar yAxisId="left" dataKey="transaksi" fill="var(--color-transaksi)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kasir</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Transaksi</TableHead>
                <TableHead className="text-right">Total Penjualan</TableHead>
                <TableHead className="text-right">Rata-rata</TableHead>
                <TableHead className="text-right">Resep</TableHead>
                <TableHead className="text-right">Racikan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kasirData.map(k => (
                <TableRow key={k.nama}>
                  <TableCell className="font-medium">{k.nama}</TableCell>
                  <TableCell><Badge variant="outline">{k.role}</Badge></TableCell>
                  <TableCell className="text-right">{k.transaksi}</TableCell>
                  <TableCell className="text-right">{fmtRp(k.total)}</TableCell>
                  <TableCell className="text-right">{fmtRp(k.rata2)}</TableCell>
                  <TableCell className="text-right">{k.resep}</TableCell>
                  <TableCell className="text-right">{k.racikan}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// ========== MAIN ==========
const Reports = () => (
  <div className="p-6 animate-fade-in">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Laporan</h1>
        <p className="text-sm text-muted-foreground">Laporan laba rugi, fast/slow moving, SIPNAP, dan penjualan per kasir.</p>
      </div>
    </div>

    <Tabs defaultValue="laba-rugi" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="laba-rugi" className="text-xs sm:text-sm"><BarChart3 className="w-4 h-4 mr-1 hidden sm:inline" />Laba Rugi</TabsTrigger>
        <TabsTrigger value="fast-slow" className="text-xs sm:text-sm"><TrendingUp className="w-4 h-4 mr-1 hidden sm:inline" />Fast/Slow Moving</TabsTrigger>
        <TabsTrigger value="sipnap" className="text-xs sm:text-sm"><FileText className="w-4 h-4 mr-1 hidden sm:inline" />SIPNAP</TabsTrigger>
        <TabsTrigger value="kasir" className="text-xs sm:text-sm"><Users className="w-4 h-4 mr-1 hidden sm:inline" />Per Kasir</TabsTrigger>
      </TabsList>
      <TabsContent value="laba-rugi"><LabaRugiTab /></TabsContent>
      <TabsContent value="fast-slow"><FastSlowTab /></TabsContent>
      <TabsContent value="sipnap"><SIPNAPTab /></TabsContent>
      <TabsContent value="kasir"><KasirTab /></TabsContent>
    </Tabs>
  </div>
);

export default Reports;
