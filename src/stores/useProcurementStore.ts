import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

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
  _loaded: boolean;
  fetchAll: () => Promise<void>;
  addSupplier: (s: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>;
  removeSupplier: (id: string) => Promise<void>;
  addSPRecord: (sp: Omit<SPRecord, 'id'>) => Promise<void>;
  updateSPRecord: (id: string, data: Partial<SPRecord>) => Promise<void>;
  removeSPRecord: (id: string) => Promise<void>;
  getNextSPNo: (type: SPRecord['spType']) => string;
  addInvoiceTracker: (t: Omit<InvoiceTracker, 'id'>) => Promise<void>;
  markPaid: (id: string) => Promise<void>;
}

const SP_PREFIX: Record<SPRecord['spType'], string> = {
  REG: 'SP-REG',
  OOT: 'SP-OOT',
  PRE: 'SP-PRE',
  PSI: 'SP-PSI',
  NAR: 'SP-NAR',
};

const mapSupplier = (r: any): Supplier => ({
  id: r.id,
  name: r.name || '',
  address: r.address || '',
  phone: r.phone || '',
  email: r.email || '',
  topDays: r.top_days || 0,
  noIzinPBF: r.no_izin_pbf || '',
  noCDOB: r.no_cdob || '',
  bankName: r.bank_name || '',
  bankAccount: r.bank_account || '',
  bankAccountName: r.bank_account_name || '',
});

export const useProcurementStore = create<ProcurementState>()((set, get) => ({
  suppliers: [],
  spRecords: [],
  invoiceTrackers: [],
  _loaded: false,

  fetchAll: async () => {
    const [suppRes, spRes, spItemsRes, invRes] = await Promise.all([
      supabase.from('suppliers').select('*'),
      supabase.from('sp_records').select('*'),
      supabase.from('sp_items').select('*'),
      supabase.from('invoice_trackers').select('*'),
    ]);

    const suppliers = (suppRes.data || []).map(mapSupplier);

    const spItemsAll = spItemsRes.data || [];
    const spRecords: SPRecord[] = (spRes.data || []).map((sp: any) => ({
      id: sp.id,
      spNo: sp.sp_no || '',
      spType: sp.sp_type as SPRecord['spType'],
      supplierId: sp.supplier_id || '',
      supplierName: sp.supplier_name || '',
      apotekerPemesan: sp.apoteker_pemesan || '',
      date: sp.date || '',
      printed: sp.printed || false,
      items: spItemsAll.filter((i: any) => i.sp_id === sp.id).map((i: any) => ({
        itemName: i.item_name || '',
        qty: i.qty || '',
        unit: i.unit || '',
        keterangan: i.keterangan || '',
        hargaSatuan: i.harga_satuan || '',
        diskon: i.diskon || '',
      })),
    }));

    const invoiceTrackers: InvoiceTracker[] = (invRes.data || []).map((t: any) => ({
      id: t.id,
      grnId: t.grn_id || '',
      invoiceNo: t.invoice_no || '',
      supplierName: t.supplier_name || '',
      totalAmount: Number(t.total_amount) || 0,
      receiveDate: t.receive_date || '',
      dueDate: t.due_date || '',
      topDays: t.top_days || 0,
      status: t.status as 'Belum Bayar' | 'Lunas',
    }));

    set({ suppliers, spRecords, invoiceTrackers, _loaded: true });
  },

  addSupplier: async (s) => {
    const { data, error } = await supabase.from('suppliers').insert({
      name: s.name, address: s.address, phone: s.phone, email: s.email,
      top_days: s.topDays, no_izin_pbf: s.noIzinPBF, no_cdob: s.noCDOB,
      bank_name: s.bankName, bank_account: s.bankAccount, bank_account_name: s.bankAccountName,
    }).select().single();
    if (error) throw error;
    set((st) => ({ suppliers: [...st.suppliers, mapSupplier(data)] }));
  },

  updateSupplier: async (id, data) => {
    const update: any = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.address !== undefined) update.address = data.address;
    if (data.phone !== undefined) update.phone = data.phone;
    if (data.email !== undefined) update.email = data.email;
    if (data.topDays !== undefined) update.top_days = data.topDays;
    if (data.noIzinPBF !== undefined) update.no_izin_pbf = data.noIzinPBF;
    if (data.noCDOB !== undefined) update.no_cdob = data.noCDOB;
    if (data.bankName !== undefined) update.bank_name = data.bankName;
    if (data.bankAccount !== undefined) update.bank_account = data.bankAccount;
    if (data.bankAccountName !== undefined) update.bank_account_name = data.bankAccountName;

    const { error } = await supabase.from('suppliers').update(update).eq('id', id);
    if (error) throw error;
    set((st) => ({ suppliers: st.suppliers.map((s) => s.id === id ? { ...s, ...data } : s) }));
  },

  removeSupplier: async (id) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
    set((st) => ({ suppliers: st.suppliers.filter((s) => s.id !== id) }));
  },

  addSPRecord: async (sp) => {
    const { data: spData, error: spError } = await supabase.from('sp_records').insert({
      sp_no: sp.spNo, sp_type: sp.spType, supplier_id: sp.supplierId,
      supplier_name: sp.supplierName, apoteker_pemesan: sp.apotekerPemesan,
      date: sp.date, printed: sp.printed,
    }).select().single();
    if (spError) throw spError;

    if (sp.items.length > 0) {
      await supabase.from('sp_items').insert(sp.items.map((i) => ({
        sp_id: spData.id, item_name: i.itemName, qty: i.qty, unit: i.unit,
        keterangan: i.keterangan, harga_satuan: i.hargaSatuan, diskon: i.diskon,
      })));
    }

    set((st) => ({ spRecords: [...st.spRecords, { ...sp, id: spData.id }] }));
  },

  updateSPRecord: async (id, data) => {
    const update: any = {};
    if (data.spNo !== undefined) update.sp_no = data.spNo;
    if (data.spType !== undefined) update.sp_type = data.spType;
    if (data.supplierId !== undefined) update.supplier_id = data.supplierId;
    if (data.supplierName !== undefined) update.supplier_name = data.supplierName;
    if (data.apotekerPemesan !== undefined) update.apoteker_pemesan = data.apotekerPemesan;
    if (data.date !== undefined) update.date = data.date;
    if (data.printed !== undefined) update.printed = data.printed;

    if (Object.keys(update).length > 0) {
      await supabase.from('sp_records').update(update).eq('id', id);
    }

    if (data.items) {
      await supabase.from('sp_items').delete().eq('sp_id', id);
      if (data.items.length > 0) {
        await supabase.from('sp_items').insert(data.items.map((i) => ({
          sp_id: id, item_name: i.itemName, qty: i.qty, unit: i.unit,
          keterangan: i.keterangan, harga_satuan: i.hargaSatuan, diskon: i.diskon,
        })));
      }
    }

    set((st) => ({ spRecords: st.spRecords.map((sp) => sp.id === id ? { ...sp, ...data } : sp) }));
  },

  removeSPRecord: async (id) => {
    await supabase.from('sp_records').delete().eq('id', id);
    set((st) => ({ spRecords: st.spRecords.filter((sp) => sp.id !== id) }));
  },

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

  addInvoiceTracker: async (t) => {
    const { data, error } = await supabase.from('invoice_trackers').insert({
      grn_id: t.grnId, invoice_no: t.invoiceNo, supplier_name: t.supplierName,
      total_amount: t.totalAmount, receive_date: t.receiveDate, due_date: t.dueDate,
      top_days: t.topDays, status: t.status,
    }).select().single();
    if (error) throw error;
    set((st) => ({ invoiceTrackers: [...st.invoiceTrackers, { ...t, id: data.id }] }));
  },

  markPaid: async (id) => {
    await supabase.from('invoice_trackers').update({ status: 'Lunas' }).eq('id', id);
    set((st) => ({ invoiceTrackers: st.invoiceTrackers.map((t) => t.id === id ? { ...t, status: 'Lunas' } : t) }));
  },
}));
