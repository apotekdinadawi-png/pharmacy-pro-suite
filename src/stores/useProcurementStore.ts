import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Supplier {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  topDays: number;
  noIzinPBF: string;
  noCDOB: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
}

export interface SPRecord {
  id: string;
  spNo: string;
  spType: 'REG' | 'OOT' | 'PRE' | 'PSI' | 'NAR';
  supplierId: string;
  supplierName: string;
  apotekerPemesan: string;
  items: SPItem[];
  date: string;
  printed: boolean;
}

export interface SPItem {
  itemName: string;
  qty: string;
  unit: string;
  keterangan: string;
  hargaSatuan: string;
  diskon: string;
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
  spRecords: SPRecord[];
  invoiceTrackers: InvoiceTracker[];
  addSupplier: (s: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  removeSupplier: (id: string) => void;
  addSPRecord: (sp: Omit<SPRecord, 'id'>) => void;
  updateSPRecord: (id: string, data: Partial<SPRecord>) => void;
  removeSPRecord: (id: string) => void;
  getNextSPNo: (type: SPRecord['spType']) => string;
  addInvoiceTracker: (t: Omit<InvoiceTracker, 'id'>) => void;
  markPaid: (id: string) => void;
}

const SP_PREFIX: Record<SPRecord['spType'], string> = {
  REG: 'SP-REG',
  OOT: 'SP-OOT',
  PRE: 'SP-PRE',
  PSI: 'SP-PSI',
  NAR: 'SP-NAR',
};

export const useProcurementStore = create<ProcurementState>()(
  persist(
    (set, get) => ({
      suppliers: [],
      spRecords: [],
      invoiceTrackers: [],
      addSupplier: (s) => set((st) => ({ suppliers: [...st.suppliers, { ...s, id: crypto.randomUUID() }] })),
      updateSupplier: (id, data) => set((st) => ({ suppliers: st.suppliers.map((s) => s.id === id ? { ...s, ...data } : s) })),
      removeSupplier: (id) => set((st) => ({ suppliers: st.suppliers.filter((s) => s.id !== id) })),
      addSPRecord: (sp) => set((st) => ({ spRecords: [...st.spRecords, { ...sp, id: crypto.randomUUID() }] })),
      updateSPRecord: (id, data) => set((st) => ({ spRecords: st.spRecords.map((sp) => sp.id === id ? { ...sp, ...data } : sp) })),
      removeSPRecord: (id) => set((st) => ({ spRecords: st.spRecords.filter((sp) => sp.id !== id) })),
      getNextSPNo: (type) => {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const existing = get().spRecords.filter(
          (sp) => sp.spType === type && sp.spNo.includes(`/${month}/${year}`)
        );
        const nextNum = String(existing.length + 1).padStart(3, '0');
        return `${SP_PREFIX[type]}/${nextNum}/${month}/${year}`;
      },
      addInvoiceTracker: (t) => set((st) => ({ invoiceTrackers: [...st.invoiceTrackers, { ...t, id: crypto.randomUUID() }] })),
      markPaid: (id) => set((st) => ({ invoiceTrackers: st.invoiceTrackers.map((t) => t.id === id ? { ...t, status: 'Lunas' } : t) })),
    }),
    {
      name: 'apotek-procurement',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Migrate old supplier format
          const suppliers = (persistedState?.suppliers || []).map((s: any) => ({
            ...s,
            noIzinPBF: s.sipa || s.noIzinPBF || '',
            noCDOB: s.noCDOB || '',
            bankName: s.bankName || '',
            bankAccount: s.bankAccount || '',
            bankAccountName: s.bankAccountName || '',
          }));
          return { ...persistedState, suppliers, spRecords: persistedState?.spRecords || [] };
        }
        return persistedState;
      },
    }
  )
);
