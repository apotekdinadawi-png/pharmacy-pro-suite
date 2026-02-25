import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DrugMaster {
  id: string;
  name: string;
  barcode: string;
  category: string;
  activeIngredient: string;
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

interface InventoryState {
  drugs: DrugMaster[];
  grnEntries: GRNEntry[];
  stockCards: StockCardEntry[];
  priceAlerts: { drugName: string; oldPrice: number; newPrice: number; date: string }[];
  addDrug: (drug: Omit<DrugMaster, 'id'>) => void;
  updateDrug: (id: string, data: Partial<DrugMaster>) => void;
  removeDrug: (id: string) => void;
  addGRN: (grn: Omit<GRNEntry, 'id'>) => void;
  addStockCard: (entry: Omit<StockCardEntry, 'id'>) => void;
  clearPriceAlerts: () => void;
}

const defaultDrugs: DrugMaster[] = [
  { id: '1', name: 'Paracetamol 500mg', barcode: '8991234001', category: 'Obat Bebas', activeIngredient: 'Paracetamol', baseUnit: 'Tablet', sellPrice: 2500, rack: 'A-01', stock: 120, minStock: 20, conversions: [{ from: 'Box', to: 'Strip', factor: 10 }, { from: 'Strip', to: 'Tablet', factor: 10 }] },
  { id: '2', name: 'Amoxicillin 500mg', barcode: '8991234002', category: 'Obat Keras', activeIngredient: 'Amoxicillin', baseUnit: 'Kapsul', sellPrice: 8500, rack: 'B-03', stock: 5, minStock: 10, conversions: [{ from: 'Box', to: 'Strip', factor: 10 }, { from: 'Strip', to: 'Kapsul', factor: 10 }] },
  { id: '3', name: 'Omeprazole 20mg', barcode: '8991234003', category: 'Obat Keras', activeIngredient: 'Omeprazole', baseUnit: 'Kapsul', sellPrice: 12000, rack: 'B-05', stock: 3, minStock: 10, conversions: [{ from: 'Box', to: 'Strip', factor: 5 }, { from: 'Strip', to: 'Kapsul', factor: 10 }] },
  { id: '4', name: 'Vitamin C 500mg', barcode: '8991234004', category: 'Obat Bebas', activeIngredient: 'Ascorbic Acid', baseUnit: 'Tablet', sellPrice: 3000, rack: 'A-02', stock: 200, minStock: 30, conversions: [{ from: 'Botol', to: 'Tablet', factor: 30 }] },
  { id: '5', name: 'Cetirizine 10mg', barcode: '8991234005', category: 'Obat Bebas Terbatas', activeIngredient: 'Cetirizine', baseUnit: 'Tablet', sellPrice: 5000, rack: 'C-01', stock: 7, minStock: 15, conversions: [{ from: 'Box', to: 'Strip', factor: 10 }, { from: 'Strip', to: 'Tablet', factor: 10 }] },
  { id: '6', name: 'Diazepam 5mg', barcode: '8991234006', category: 'Obat Psikotropika', activeIngredient: 'Diazepam', baseUnit: 'Tablet', sellPrice: 15000, rack: 'D-01', stock: 25, minStock: 5, conversions: [{ from: 'Box', to: 'Strip', factor: 5 }, { from: 'Strip', to: 'Tablet', factor: 10 }] },
  { id: '7', name: 'Codein 10mg', barcode: '8991234007', category: 'Obat Narkotika', activeIngredient: 'Codein', baseUnit: 'Tablet', sellPrice: 20000, rack: 'D-02', stock: 10, minStock: 5, conversions: [{ from: 'Box', to: 'Strip', factor: 5 }, { from: 'Strip', to: 'Tablet', factor: 10 }] },
];

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      drugs: defaultDrugs,
      grnEntries: [],
      stockCards: [],
      priceAlerts: [],
      addDrug: (drug) => set((s) => ({ drugs: [...s.drugs, { ...drug, id: crypto.randomUUID() }] })),
      updateDrug: (id, data) => set((s) => ({ drugs: s.drugs.map((d) => d.id === id ? { ...d, ...data } : d) })),
      removeDrug: (id) => set((s) => ({ drugs: s.drugs.filter((d) => d.id !== id) })),
      addGRN: (grn) => set((s) => {
        const id = crypto.randomUUID();
        const newAlerts = grn.items
          .filter((i) => i.priceIncreased)
          .map((i) => ({ drugName: i.drugName, oldPrice: i.previousBuyPrice, newPrice: i.buyPrice, date: grn.date }));
        // Update stock for each item
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
      clearPriceAlerts: () => set({ priceAlerts: [] }),
    }),
    { name: 'apotek-inventory' }
  )
);
