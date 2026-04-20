import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export type RoleName = 'Apoteker' | 'Asisten Apoteker' | 'Kasir';

export interface ApotekerPendamping {
  nama: string;
  sipa: string;
}

export interface BusinessSettings {
  namaApotek: string;
  alamat: string;
  noSIA: string;
  ppnPercent: number;
  logoUrl: string;
  email: string;
  telepon: string;
  website: string;
  namaAPJ: string;
  noSIPA: string;
  noSTRA: string;
  apotekerPendamping: ApotekerPendamping[];
}

export interface InventorySettings {
  stokKritis: number;
  reminderKadaluwarsa: number;
}

export interface UnitItem {
  id: string;
  name: string;
}

export interface CategoryItem {
  id: string;
  name: string;
}

export interface MasterDataSettings {
  units: UnitItem[];
  categories: CategoryItem[];
}

export interface LoyaltySettings {
  pointValue: number;
  goldThreshold: number;
}

export interface RolePermission {
  role: RoleName;
  permissions: string[];
}

export interface ReceiptSettings {
  headerLine1: string;
  headerLine2: string;
  headerLine3: string;
  footerLine1: string;
  footerLine2: string;
}

export interface SettingsState {
  business: BusinessSettings;
  inventory: InventorySettings;
  masterData: MasterDataSettings;
  loyalty: LoyaltySettings;
  roles: RolePermission[];
  receipt: ReceiptSettings;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  fetchAll: () => Promise<void>;
  setBusiness: (b: Partial<BusinessSettings>) => void;
  setInventory: (i: Partial<InventorySettings>) => void;
  setMasterData: (m: Partial<MasterDataSettings>) => void;
  addUnit: (name: string) => Promise<void>;
  removeUnit: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  setLoyalty: (l: Partial<LoyaltySettings>) => void;
  setRolePermissions: (role: RoleName, permissions: string[]) => void;
  setReceipt: (r: Partial<ReceiptSettings>) => void;
  saveSetting: (key: string, value: any) => Promise<void>;
}

const allPermissions = [
  'dashboard', 'transaksi', 'inventaris', 'pengadaan', 'laporan', 'pelanggan', 'manajemen_user', 'pengaturan'
];

const defaultBusiness: BusinessSettings = {
  namaApotek: 'Apotek Dinadawi', alamat: '', noSIA: '', ppnPercent: 11, logoUrl: '',
  email: '', telepon: '', website: '', namaAPJ: 'Apt. Madinatul Adawiyah, S.Farm',
  noSIPA: '', noSTRA: '', apotekerPendamping: [],
};

const defaultInventory: InventorySettings = { stokKritis: 10, reminderKadaluwarsa: 3 };
const defaultLoyalty: LoyaltySettings = { pointValue: 5000, goldThreshold: 500000 };
const defaultReceipt: ReceiptSettings = {
  headerLine1: '', headerLine2: '', headerLine3: '',
  footerLine1: 'Terima kasih atas kunjungan Anda', footerLine2: 'Semoga lekas sembuh!',
};

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  _hasHydrated: false,
  setHasHydrated: (v) => set({ _hasHydrated: v }),
  business: { ...defaultBusiness },
  inventory: { ...defaultInventory },
  masterData: { units: [], categories: [] },
  loyalty: { ...defaultLoyalty },
  roles: [
    { role: 'Apoteker', permissions: [...allPermissions] },
    { role: 'Asisten Apoteker', permissions: ['dashboard', 'transaksi', 'inventaris', 'pengadaan', 'pelanggan'] },
    { role: 'Kasir', permissions: ['dashboard', 'transaksi', 'pelanggan'] },
  ],
  receipt: { ...defaultReceipt },

  fetchAll: async () => {
    const [settingsRes, unitsRes, categoriesRes] = await Promise.all([
      supabase.from('app_settings').select('*'),
      supabase.from('master_units').select('*'),
      supabase.from('master_categories').select('*'),
    ]);

    const settings = settingsRes.data || [];
    const getVal = (key: string, def: any) => {
      const row = settings.find((s: any) => s.key === key);
      return row ? row.value : def;
    };

    const units: UnitItem[] = (unitsRes.data || []).map((u: any) => ({ id: u.id, name: u.name }));
    const dbCategories: CategoryItem[] = (categoriesRes.data || []).map((c: any) => ({ id: c.id, name: c.name }));

    // Permanent built-in categories (always available, cannot be removed).
    // Merged with DB categories — DB version wins if name matches.
    const PERMANENT_CATEGORIES: CategoryItem[] = [
      { id: '__perm_alkes__', name: 'ALKES' },
      { id: '__perm_obat_bebas__', name: 'Obat Bebas' },
      { id: '__perm_obat_bebas_terbatas__', name: 'Obat Bebas Terbatas' },
      { id: '__perm_obat_keras__', name: 'Obat Keras' },
      { id: '__perm_obat_psikotropika__', name: 'Obat Psikotropika' },
      { id: '__perm_obat_narkotika__', name: 'Obat Narkotika' },
    ];
    const dbNames = new Set(dbCategories.map((c) => c.name.toLowerCase()));
    const merged = [
      ...dbCategories,
      ...PERMANENT_CATEGORIES.filter((p) => !dbNames.has(p.name.toLowerCase())),
    ];

    set({
      business: { ...defaultBusiness, ...getVal('business', {}) },
      inventory: { ...defaultInventory, ...getVal('inventory', {}) },
      loyalty: { ...defaultLoyalty, ...getVal('loyalty', {}) },
      receipt: { ...defaultReceipt, ...getVal('receipt', {}) },
      masterData: { units, categories: merged },
      _hasHydrated: true,
    });
  },

  saveSetting: async (key, value) => {
    await supabase.from('app_settings').upsert({ key, value }, { onConflict: 'key' });
  },

  setBusiness: (b) => {
    const newBiz = { ...get().business, ...b };
    set({ business: newBiz });
    get().saveSetting('business', newBiz);
  },

  setInventory: (i) => {
    const newInv = { ...get().inventory, ...i };
    set({ inventory: newInv });
    get().saveSetting('inventory', newInv);
  },

  setMasterData: (m) => set((s) => ({ masterData: { ...s.masterData, ...m } })),

  addUnit: async (name) => {
    const { data, error } = await supabase.from('master_units').insert({ name }).select().single();
    if (error) throw error;
    set((s) => ({ masterData: { ...s.masterData, units: [...s.masterData.units, { id: data.id, name: data.name }] } }));
  },

  removeUnit: async (id) => {
    await supabase.from('master_units').delete().eq('id', id);
    set((s) => ({ masterData: { ...s.masterData, units: s.masterData.units.filter((u) => u.id !== id) } }));
  },

  addCategory: async (name) => {
    const { data, error } = await supabase.from('master_categories').insert({ name }).select().single();
    if (error) throw error;
    set((s) => ({ masterData: { ...s.masterData, categories: [...s.masterData.categories, { id: data.id, name: data.name }] } }));
  },

  removeCategory: async (id) => {
    await supabase.from('master_categories').delete().eq('id', id);
    set((s) => ({ masterData: { ...s.masterData, categories: s.masterData.categories.filter((c) => c.id !== id) } }));
  },

  setLoyalty: (l) => {
    const newLoy = { ...get().loyalty, ...l };
    set({ loyalty: newLoy });
    get().saveSetting('loyalty', newLoy);
  },

  setRolePermissions: (role, permissions) => set((s) => ({
    roles: s.roles.map((r) => r.role === role ? { ...r, permissions } : r),
  })),

  setReceipt: (r) => {
    const newRec = { ...get().receipt, ...r };
    set({ receipt: newRec });
    get().saveSetting('receipt', newRec);
  },
}));
