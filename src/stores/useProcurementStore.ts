import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Supplier {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  topDays: number;
  sipa: string;
}

export interface InvoiceTracker {
  id: string;
  grnId: string;
  invoiceNo: string;
  supplierName: string;
  totalAmount: number;
  receiveDate: string;
  dueDate: string;
  topDays: number;
  status: 'Belum Bayar' | 'Lunas';
}

interface ProcurementState {
  suppliers: Supplier[];
  invoiceTrackers: InvoiceTracker[];
  addSupplier: (s: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  removeSupplier: (id: string) => void;
  addInvoiceTracker: (t: Omit<InvoiceTracker, 'id'>) => void;
  markPaid: (id: string) => void;
}

export const useProcurementStore = create<ProcurementState>()(
  persist(
    (set) => ({
      suppliers: [],
      invoiceTrackers: [],
      addSupplier: (s) => set((st) => ({ suppliers: [...st.suppliers, { ...s, id: crypto.randomUUID() }] })),
      updateSupplier: (id, data) => set((st) => ({ suppliers: st.suppliers.map((s) => s.id === id ? { ...s, ...data } : s) })),
      removeSupplier: (id) => set((st) => ({ suppliers: st.suppliers.filter((s) => s.id !== id) })),
      addInvoiceTracker: (t) => set((st) => ({ invoiceTrackers: [...st.invoiceTrackers, { ...t, id: crypto.randomUUID() }] })),
      markPaid: (id) => set((st) => ({ invoiceTrackers: st.invoiceTrackers.map((t) => t.id === id ? { ...t, status: 'Lunas' } : t) })),
    }),
    { name: 'apotek-procurement' }
  )
);
