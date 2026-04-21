import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

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
  _loaded: boolean;
  fetchAll: () => Promise<void>;
  addDrug: (drug: Omit<DrugMaster, 'id'>) => Promise<void>;
  updateDrug: (id: string, data: Partial<DrugMaster>) => Promise<void>;
  removeDrug: (id: string) => Promise<void>;
  addGRN: (grn: Omit<GRNEntry, 'id'>) => Promise<void>;
  updateGRN: (id: string, grn: Omit<GRNEntry, 'id'>, user?: string) => Promise<void>;
  removeGRN: (id: string) => Promise<void>;
  addStockCard: (entry: Omit<StockCardEntry, 'id'>) => Promise<void>;
  addTransaction: (tx: Omit<TransactionRecord, 'id'>) => Promise<void>;
  updateTransaction: (id: string, tx: Omit<TransactionRecord, 'id'>, user?: string) => Promise<void>;
  removeTransaction: (id: string, user?: string) => Promise<void>;
  deductStock: (drugId: string, qty: number) => Promise<void>;
  clearPriceAlerts: () => Promise<void>;
}

const mapDrugRow = (r: any): DrugMaster => ({
  id: r.id,
  name: r.name,
  barcode: r.barcode || '',
  category: r.category || '',
  activeIngredient: r.active_ingredient || '',
  kegunaan: r.kegunaan || '',
  imageUrl: r.image_url || '',
  baseUnit: r.base_unit || '',
  sellPrice: Number(r.sell_price) || 0,
  rack: r.rack || '',
  stock: Number(r.stock) || 0,
  minStock: Number(r.min_stock) || 0,
  conversions: Array.isArray(r.conversions) ? r.conversions : [],
});

export const useInventoryStore = create<InventoryState>()((set, get) => ({
  drugs: [],
  grnEntries: [],
  stockCards: [],
  transactions: [],
  priceAlerts: [],
  _loaded: false,

  fetchAll: async () => {
    const [drugsRes, grnRes, grnItemsRes, stockRes, txRes, txItemsRes, alertsRes] = await Promise.all([
      supabase.from('drugs').select('*'),
      supabase.from('grn_entries').select('*'),
      supabase.from('grn_items').select('*'),
      supabase.from('stock_cards').select('*'),
      supabase.from('transactions').select('*'),
      supabase.from('transaction_items').select('*'),
      supabase.from('price_alerts').select('*'),
    ]);

    const drugs = (drugsRes.data || []).map(mapDrugRow);

    const grnItems = grnItemsRes.data || [];
    const grnEntries: GRNEntry[] = (grnRes.data || []).map((g: any) => ({
      id: g.id,
      invoiceNo: g.invoice_no || '',
      supplierId: g.supplier_id || '',
      supplierName: g.supplier_name || '',
      date: g.date || '',
      topDays: g.top_days || 0,
      items: grnItems.filter((i: any) => i.grn_id === g.id).map((i: any) => ({
        drugId: i.drug_id || '',
        drugName: i.drug_name || '',
        qty: Number(i.qty) || 0,
        unit: i.unit || '',
        batch: i.batch || '',
        expDate: i.exp_date || '',
        buyPrice: Number(i.buy_price) || 0,
        buyPriceWithPPN: Number(i.buy_price_with_ppn) || 0,
        previousBuyPrice: Number(i.previous_buy_price) || 0,
        priceIncreased: i.price_increased || false,
      })),
    }));

    const stockCards: StockCardEntry[] = (stockRes.data || []).map((s: any) => ({
      id: s.id,
      date: s.date || '',
      drugName: s.drug_name || '',
      type: s.type as 'Masuk' | 'Keluar',
      qty: Number(s.qty) || 0,
      unit: s.unit || '',
      batch: s.batch || '',
      expDate: s.exp_date || '',
      source: s.source || '',
      user: s.user || '',
      stockAfter: Number(s.stock_after) || 0,
    }));

    const txItems = txItemsRes.data || [];
    const transactions: TransactionRecord[] = (txRes.data || []).map((t: any) => ({
      id: t.id,
      date: t.date || '',
      total: Number(t.total) || 0,
      paymentMethod: t.payment_method || '',
      kasir: t.kasir || '',
      doctorName: t.doctor_name,
      patientName: t.patient_name,
      items: txItems.filter((i: any) => i.transaction_id === t.id).map((i: any) => ({
        drugId: i.drug_id || '',
        drugName: i.drug_name || '',
        qty: Number(i.qty) || 0,
        unit: i.unit || '',
        price: Number(i.price) || 0,
        subtotal: Number(i.subtotal) || 0,
      })),
    }));

    const priceAlerts = (alertsRes.data || []).map((a: any) => ({
      drugName: a.drug_name || '',
      oldPrice: Number(a.old_price) || 0,
      newPrice: Number(a.new_price) || 0,
      date: a.date || '',
    }));

    set({ drugs, grnEntries, stockCards, transactions, priceAlerts, _loaded: true });
  },

  addDrug: async (drug) => {
    const { data, error } = await supabase.from('drugs').insert({
      name: drug.name,
      barcode: drug.barcode,
      category: drug.category,
      active_ingredient: drug.activeIngredient,
      kegunaan: drug.kegunaan,
      image_url: drug.imageUrl,
      base_unit: drug.baseUnit,
      sell_price: drug.sellPrice,
      rack: drug.rack,
      stock: drug.stock,
      min_stock: drug.minStock,
      conversions: drug.conversions as any,
    }).select().single();
    if (error) throw error;
    set((s) => ({ drugs: [...s.drugs, mapDrugRow(data)] }));
  },

  updateDrug: async (id, data) => {
    const update: any = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.barcode !== undefined) update.barcode = data.barcode;
    if (data.category !== undefined) update.category = data.category;
    if (data.activeIngredient !== undefined) update.active_ingredient = data.activeIngredient;
    if (data.kegunaan !== undefined) update.kegunaan = data.kegunaan;
    if (data.imageUrl !== undefined) update.image_url = data.imageUrl;
    if (data.baseUnit !== undefined) update.base_unit = data.baseUnit;
    if (data.sellPrice !== undefined) update.sell_price = data.sellPrice;
    if (data.rack !== undefined) update.rack = data.rack;
    if (data.stock !== undefined) update.stock = data.stock;
    if (data.minStock !== undefined) update.min_stock = data.minStock;
    if (data.conversions !== undefined) update.conversions = data.conversions as any;

    const { error } = await supabase.from('drugs').update(update).eq('id', id);
    if (error) throw error;
    set((s) => ({ drugs: s.drugs.map((d) => d.id === id ? { ...d, ...data } : d) }));
  },

  removeDrug: async (id) => {
    const { error } = await supabase.from('drugs').delete().eq('id', id);
    if (error) throw error;
    set((s) => ({ drugs: s.drugs.filter((d) => d.id !== id) }));
  },

  addGRN: async (grn) => {
    // Insert GRN entry
    const { data: grnData, error: grnError } = await supabase.from('grn_entries').insert({
      invoice_no: grn.invoiceNo,
      supplier_id: grn.supplierId,
      supplier_name: grn.supplierName,
      date: grn.date,
      top_days: grn.topDays,
    }).select().single();
    if (grnError) throw grnError;

    // Insert GRN items
    const itemInserts = grn.items.map((i) => ({
      grn_id: grnData.id,
      drug_id: i.drugId,
      drug_name: i.drugName,
      qty: i.qty,
      unit: i.unit,
      batch: i.batch,
      exp_date: i.expDate,
      buy_price: i.buyPrice,
      buy_price_with_ppn: i.buyPriceWithPPN,
      previous_buy_price: i.previousBuyPrice,
      price_increased: i.priceIncreased,
    }));
    await supabase.from('grn_items').insert(itemInserts);

    // Update drug stock
    const state = get();
    for (const item of grn.items) {
      const drug = state.drugs.find((d) => d.id === item.drugId);
      if (drug) {
        const newStock = drug.stock + item.qty;
        await supabase.from('drugs').update({ stock: newStock }).eq('id', drug.id);
      }
    }

    // Insert stock cards
    const cardInserts = grn.items.map((i) => ({
      date: grn.date,
      drug_name: i.drugName,
      type: 'Masuk',
      qty: i.qty,
      unit: i.unit,
      batch: i.batch,
      exp_date: i.expDate,
      source: `GRN #${grn.invoiceNo}`,
      user: 'Admin',
      stock_after: (state.drugs.find((d) => d.id === i.drugId)?.stock || 0) + i.qty,
    }));
    await supabase.from('stock_cards').insert(cardInserts);

    // Insert price alerts
    const alertInserts = grn.items
      .filter((i) => i.priceIncreased)
      .map((i) => ({
        drug_name: i.drugName,
        old_price: i.previousBuyPrice,
        new_price: i.buyPrice,
        date: grn.date,
      }));
    if (alertInserts.length > 0) {
      await supabase.from('price_alerts').insert(alertInserts);
    }

    // Refresh all data
    await get().fetchAll();
  },

  updateGRN: async (id, grn, user = 'Admin') => {
    const state = get();
    const oldGRN = state.grnEntries.find((g) => g.id === id);
    if (!oldGRN) throw new Error('GRN tidak ditemukan');

    const { error: grnError } = await supabase.from('grn_entries').update({
      invoice_no: grn.invoiceNo,
      supplier_id: grn.supplierId,
      supplier_name: grn.supplierName,
      date: grn.date,
      top_days: grn.topDays,
    }).eq('id', id);
    if (grnError) throw grnError;

    await supabase.from('grn_items').delete().eq('grn_id', id);
    const itemInserts = grn.items.map((i) => ({
      grn_id: id,
      drug_id: i.drugId,
      drug_name: i.drugName,
      qty: i.qty,
      unit: i.unit,
      batch: i.batch,
      exp_date: i.expDate,
      buy_price: i.buyPrice,
      buy_price_with_ppn: i.buyPriceWithPPN,
      previous_buy_price: i.previousBuyPrice,
      price_increased: i.priceIncreased,
    }));
    if (itemInserts.length > 0) await supabase.from('grn_items').insert(itemInserts);

    // Compute qty deltas per drug (new - old)
    const deltas = new Map<string, { drug: DrugMaster | undefined; delta: number; newItem: GRNItem }>();
    for (const oldItem of oldGRN.items) {
      const cur = deltas.get(oldItem.drugId) || { drug: state.drugs.find((d) => d.id === oldItem.drugId), delta: 0, newItem: oldItem };
      cur.delta -= oldItem.qty;
      deltas.set(oldItem.drugId, cur);
    }
    for (const newItem of grn.items) {
      const cur = deltas.get(newItem.drugId) || { drug: state.drugs.find((d) => d.id === newItem.drugId), delta: 0, newItem };
      cur.delta += newItem.qty;
      cur.newItem = newItem;
      deltas.set(newItem.drugId, cur);
    }

    const stockCardInserts: any[] = [];
    for (const [drugId, info] of deltas.entries()) {
      if (!info.drug || info.delta === 0) continue;
      const newStock = Math.max(0, info.drug.stock + info.delta);
      await supabase.from('drugs').update({ stock: newStock }).eq('id', drugId);
      stockCardInserts.push({
        date: new Date().toISOString().split('T')[0],
        drug_name: info.drug.name,
        type: 'Koreksi',
        qty: Math.abs(info.delta),
        unit: info.newItem.unit,
        batch: info.newItem.batch,
        exp_date: info.newItem.expDate,
        source: `Edit GRN #${grn.invoiceNo} (${info.delta > 0 ? '+' : ''}${info.delta})`,
        user,
        stock_after: newStock,
      });
    }
    if (stockCardInserts.length > 0) await supabase.from('stock_cards').insert(stockCardInserts);

    await get().fetchAll();
  },

  removeGRN: async (id) => {
    const state = get();
    const grn = state.grnEntries.find((g) => g.id === id);
    if (!grn) return;

    const stockCardInserts: any[] = [];
    for (const item of grn.items) {
      const drug = state.drugs.find((d) => d.id === item.drugId);
      if (!drug) continue;
      const newStock = Math.max(0, drug.stock - item.qty);
      await supabase.from('drugs').update({ stock: newStock }).eq('id', drug.id);
      stockCardInserts.push({
        date: new Date().toISOString().split('T')[0],
        drug_name: drug.name,
        type: 'Koreksi',
        qty: item.qty,
        unit: item.unit,
        batch: item.batch,
        exp_date: item.expDate,
        source: `Hapus GRN #${grn.invoiceNo} (-${item.qty})`,
        user: 'Admin',
        stock_after: newStock,
      });
    }
    if (stockCardInserts.length > 0) await supabase.from('stock_cards').insert(stockCardInserts);

    await supabase.from('grn_items').delete().eq('grn_id', id);
    await supabase.from('grn_entries').delete().eq('id', id);
    await get().fetchAll();
  },

  addStockCard: async (entry) => {
    const { data, error } = await supabase.from('stock_cards').insert({
      date: entry.date,
      drug_name: entry.drugName,
      type: entry.type,
      qty: entry.qty,
      unit: entry.unit,
      batch: entry.batch,
      exp_date: entry.expDate,
      source: entry.source,
      user: entry.user,
      stock_after: entry.stockAfter,
    }).select().single();
    if (error) throw error;
    set((s) => ({ stockCards: [...s.stockCards, { ...entry, id: data.id }] }));
  },

  addTransaction: async (tx) => {
    const { data: txData, error: txError } = await supabase.from('transactions').insert({
      date: tx.date,
      total: tx.total,
      payment_method: tx.paymentMethod,
      kasir: tx.kasir,
      doctor_name: tx.doctorName,
      patient_name: tx.patientName,
    }).select().single();
    if (txError) throw txError;

    const itemInserts = tx.items.map((i) => ({
      transaction_id: txData.id,
      drug_id: i.drugId,
      drug_name: i.drugName,
      qty: i.qty,
      unit: i.unit,
      price: i.price,
      subtotal: i.subtotal,
    }));
    await supabase.from('transaction_items').insert(itemInserts);

    set((s) => ({ transactions: [...s.transactions, { ...tx, id: txData.id }] }));
  },

  updateTransaction: async (id, tx, user = 'Admin') => {
    const state = get();
    const oldTx = state.transactions.find((t) => t.id === id);
    if (!oldTx) throw new Error('Transaksi tidak ditemukan');

    // Update header
    const { error: txError } = await supabase.from('transactions').update({
      date: tx.date,
      total: tx.total,
      payment_method: tx.paymentMethod,
      kasir: tx.kasir,
      doctor_name: tx.doctorName,
      patient_name: tx.patientName,
    }).eq('id', id);
    if (txError) throw txError;

    // Replace items
    await supabase.from('transaction_items').delete().eq('transaction_id', id);
    const itemInserts = tx.items.map((i) => ({
      transaction_id: id,
      drug_id: i.drugId,
      drug_name: i.drugName,
      qty: i.qty,
      unit: i.unit,
      price: i.price,
      subtotal: i.subtotal,
    }));
    if (itemInserts.length > 0) await supabase.from('transaction_items').insert(itemInserts);

    // Compute qty deltas: stock change = -(new - old) = old - new
    // Skip racikan (drugId starts with "racikan-")
    const deltas = new Map<string, { drug: DrugMaster | undefined; delta: number; newName: string; newUnit: string }>();
    for (const oi of oldTx.items) {
      if (!oi.drugId || oi.drugId.startsWith('racikan-')) continue;
      const cur = deltas.get(oi.drugId) || { drug: state.drugs.find((d) => d.id === oi.drugId), delta: 0, newName: oi.drugName, newUnit: oi.unit };
      cur.delta += oi.qty; // returning to stock
      deltas.set(oi.drugId, cur);
    }
    for (const ni of tx.items) {
      if (!ni.drugId || ni.drugId.startsWith('racikan-')) continue;
      const cur = deltas.get(ni.drugId) || { drug: state.drugs.find((d) => d.id === ni.drugId), delta: 0, newName: ni.drugName, newUnit: ni.unit };
      cur.delta -= ni.qty; // deducting from stock
      cur.newName = ni.drugName;
      cur.newUnit = ni.unit;
      deltas.set(ni.drugId, cur);
    }

    const stockCardInserts: any[] = [];
    for (const [drugId, info] of deltas.entries()) {
      if (!info.drug || info.delta === 0) continue;
      const newStock = Math.max(0, info.drug.stock + info.delta);
      await supabase.from('drugs').update({ stock: newStock }).eq('id', drugId);
      stockCardInserts.push({
        date: new Date().toISOString().split('T')[0],
        drug_name: info.drug.name,
        type: 'Koreksi',
        qty: Math.abs(info.delta),
        unit: info.newUnit,
        batch: '',
        exp_date: '',
        source: `Koreksi Penjualan TRX #${id.slice(0, 8)} (${info.delta > 0 ? '+' : ''}${info.delta})`,
        user,
        stock_after: newStock,
      });
    }
    if (stockCardInserts.length > 0) await supabase.from('stock_cards').insert(stockCardInserts);

    await get().fetchAll();
  },

  removeTransaction: async (id, user = 'Admin') => {
    const state = get();
    const tx = state.transactions.find((t) => t.id === id);
    if (!tx) return;

    // Restore stock for each non-racikan item
    const stockCardInserts: any[] = [];
    for (const item of tx.items) {
      if (!item.drugId || item.drugId.startsWith('racikan-')) continue;
      const drug = state.drugs.find((d) => d.id === item.drugId);
      if (!drug) continue;
      const newStock = drug.stock + item.qty;
      await supabase.from('drugs').update({ stock: newStock }).eq('id', drug.id);
      stockCardInserts.push({
        date: new Date().toISOString().split('T')[0],
        drug_name: drug.name,
        type: 'Koreksi',
        qty: item.qty,
        unit: item.unit,
        batch: '',
        exp_date: '',
        source: `Koreksi Penjualan: Hapus TRX #${id.slice(0, 8)} (+${item.qty})`,
        user,
        stock_after: newStock,
      });
    }
    if (stockCardInserts.length > 0) await supabase.from('stock_cards').insert(stockCardInserts);

    await supabase.from('transaction_items').delete().eq('transaction_id', id);
    await supabase.from('transactions').delete().eq('id', id);
    await get().fetchAll();
  },

  deductStock: async (drugId, qty) => {
    const drug = get().drugs.find((d) => d.id === drugId);
    if (!drug) return;
    const newStock = Math.max(0, drug.stock - qty);
    await supabase.from('drugs').update({ stock: newStock }).eq('id', drugId);
    set((s) => ({
      drugs: s.drugs.map((d) => d.id === drugId ? { ...d, stock: newStock } : d),
    }));
  },

  clearPriceAlerts: async () => {
    await supabase.from('price_alerts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    set({ priceAlerts: [] });
  },
}));
