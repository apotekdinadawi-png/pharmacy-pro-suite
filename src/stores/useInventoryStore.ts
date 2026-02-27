import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DrugMaster {
  id: string;
  name: string;
  barcode: string;
  category: string;
  activeIngredient: string;
  kegunaan: string;
  imageUrl: string;
  baseUnit: string;
  sellPrice: number;
  rack: string;
  stock: number;
  minStock: number;
  conversions: { from: string; to: string; factor: number }[];
}

export interface GRNEntry {
  id: string;
  invoiceNo: string;
  supplierId: string;
  supplierName: string;
  date: string;
  topDays: number;
  items: GRNItem[];
}

export interface GRNItem {
  drugId: string;
  drugName: string;
  qty: number;
  unit: string;
  batch: string;
  expDate: string;
  buyPrice: number;
  buyPriceWithPPN: number;
  previousBuyPrice: number;
  priceIncreased: boolean;
}

export interface StockCardEntry {
  id: string;
  date: string;
  drugName: string;
  type: 'Masuk' | 'Keluar';
  qty: number;
  unit: string;
  batch: string;
  expDate: string;
  source: string;
  user: string;
  stockAfter: number;
}

export interface TransactionRecord {
  id: string;
  date: string;
  items: { drugId: string; drugName: string; qty: number; unit: string; price: number; subtotal: number }[];
  total: number;
  paymentMethod: string;
  kasir: string;
  doctorName?: string;
  patientName?: string;
}

interface InventoryState {
  drugs: DrugMaster[];
  grnEntries: GRNEntry[];
  stockCards: StockCardEntry[];
  transactions: TransactionRecord[];
  priceAlerts: { drugName: string; oldPrice: number; newPrice: number; date: string }[];
  addDrug: (drug: Omit<DrugMaster, 'id'>) => void;
  updateDrug: (id: string, data: Partial<DrugMaster>) => void;
  removeDrug: (id: string) => void;
  addGRN: (grn: Omit<GRNEntry, 'id'>) => void;
  addStockCard: (entry: Omit<StockCardEntry, 'id'>) => void;
  addTransaction: (tx: Omit<TransactionRecord, 'id'>) => void;
  deductStock: (drugId: string, qty: number) => void;
  clearPriceAlerts: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      drugs: [],
      grnEntries: [],
      stockCards: [],
      transactions: [],
      priceAlerts: [],
      addDrug: (drug) => set((s) => ({ drugs: [...s.drugs, { ...drug, id: crypto.randomUUID() }] })),
      updateDrug: (id, data) => set((s) => ({ drugs: s.drugs.map((d) => d.id === id ? { ...d, ...data } : d) })),
      removeDrug: (id) => set((s) => ({ drugs: s.drugs.filter((d) => d.id !== id) })),
      addGRN: (grn) => set((s) => {
        const id = crypto.randomUUID();
        const newAlerts = grn.items
          .filter((i) => i.priceIncreased)
          .map((i) => ({ drugName: i.drugName, oldPrice: i.previousBuyPrice, newPrice: i.buyPrice, date: grn.date }));
        const updatedDrugs = s.drugs.map((d) => {
          const grnItem = grn.items.find((i) => i.drugId === d.id);
          if (grnItem) return { ...d, stock: d.stock + grnItem.qty };
          return d;
        });
        const newCards: StockCardEntry[] = grn.items.map((i) => ({
          id: crypto.randomUUID(),
          date: grn.date,
          drugName: i.drugName,
          type: 'Masuk' as const,
          qty: i.qty,
          unit: i.unit,
          batch: i.batch,
          expDate: i.expDate,
          source: `GRN #${grn.invoiceNo}`,
          user: 'Admin',
          stockAfter: (s.drugs.find((d) => d.id === i.drugId)?.stock || 0) + i.qty,
        }));
        return {
          grnEntries: [...s.grnEntries, { ...grn, id }],
          drugs: updatedDrugs,
          stockCards: [...s.stockCards, ...newCards],
          priceAlerts: [...s.priceAlerts, ...newAlerts],
        };
      }),
      addStockCard: (entry) => set((s) => ({ stockCards: [...s.stockCards, { ...entry, id: crypto.randomUUID() }] })),
      addTransaction: (tx) => set((s) => ({ transactions: [...s.transactions, { ...tx, id: crypto.randomUUID() }] })),
      deductStock: (drugId, qty) => set((s) => ({
        drugs: s.drugs.map((d) => d.id === drugId ? { ...d, stock: Math.max(0, d.stock - qty) } : d),
      })),
      clearPriceAlerts: () => set({ priceAlerts: [] }),
    }),
    { name: 'apotek-inventory' }
  )
);
