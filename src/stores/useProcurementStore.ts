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

const defaultSuppliers: Supplier[] = [
  { id: '1', name: 'PT Kimia Farma Tbk', address: 'Jl. Veteran No. 9, Jakarta', phone: '021-3847171', email: 'order@kimiafarma.co.id', topDays: 30, sipa: 'SI-001/BPOM/2024' },
  { id: '2', name: 'PT Enseval Putera Megatrading', address: 'Jl. Pulo Lentut No. 10, Jakarta', phone: '021-4682042', email: 'order@enseval.com', topDays: 21, sipa: 'SI-002/BPOM/2024' },
  { id: '3', name: 'PT Anugrah Argon Medica', address: 'Jl. Senen Raya No. 135, Jakarta', phone: '021-3858811', email: 'order@aam.co.id', topDays: 14, sipa: 'SI-003/BPOM/2024' },
  { id: '4', name: 'PT Tempo Scan Pacific', address: 'Jl. HR Rasuna Said, Jakarta', phone: '021-5200533', email: 'order@tempo.co.id', topDays: 30, sipa: 'SI-004/BPOM/2024' },
];

export const useProcurementStore = create<ProcurementState>()(
  persist(
    (set) => ({
      suppliers: defaultSuppliers,
      invoiceTrackers: [
        { id: '1', grnId: '', invoiceNo: 'F-2026-001', supplierName: 'PT Kimia Farma Tbk', totalAmount: 12500000, receiveDate: '2026-02-10', dueDate: '2026-03-12', topDays: 30, status: 'Belum Bayar' },
        { id: '2', grnId: '', invoiceNo: 'F-2026-002', supplierName: 'PT Enseval Putera Megatrading', totalAmount: 8200000, receiveDate: '2026-02-15', dueDate: '2026-03-08', topDays: 21, status: 'Belum Bayar' },
        { id: '3', grnId: '', invoiceNo: 'F-2026-003', supplierName: 'PT Anugrah Argon Medica', totalAmount: 5800000, receiveDate: '2026-02-18', dueDate: '2026-03-04', topDays: 14, status: 'Belum Bayar' },
      ],
      addSupplier: (s) => set((st) => ({ suppliers: [...st.suppliers, { ...s, id: crypto.randomUUID() }] })),
      updateSupplier: (id, data) => set((st) => ({ suppliers: st.suppliers.map((s) => s.id === id ? { ...s, ...data } : s) })),
      removeSupplier: (id) => set((st) => ({ suppliers: st.suppliers.filter((s) => s.id !== id) })),
      addInvoiceTracker: (t) => set((st) => ({ invoiceTrackers: [...st.invoiceTrackers, { ...t, id: crypto.randomUUID() }] })),
      markPaid: (id) => set((st) => ({ invoiceTrackers: st.invoiceTrackers.map((t) => t.id === id ? { ...t, status: 'Lunas' } : t) })),
    }),
    { name: 'apotek-procurement' }
  )
);
