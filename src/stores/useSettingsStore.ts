import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  setBusiness: (b: Partial<BusinessSettings>) => void;
  setInventory: (i: Partial<InventorySettings>) => void;
  setMasterData: (m: Partial<MasterDataSettings>) => void;
  addUnit: (name: string) => void;
  removeUnit: (id: string) => void;
  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
  setLoyalty: (l: Partial<LoyaltySettings>) => void;
  setRolePermissions: (role: RoleName, permissions: string[]) => void;
  setReceipt: (r: Partial<ReceiptSettings>) => void;
}

const allPermissions = [
  'dashboard', 'transaksi', 'inventaris', 'pengadaan', 'laporan', 'pelanggan', 'manajemen_user', 'pengaturan'
];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      business: {
        namaApotek: 'Apotek Dinadawi',
        alamat: '',
        noSIA: '',
        ppnPercent: 11,
        logoUrl: '',
        email: '',
        telepon: '',
        website: '',
        namaAPJ: 'Apt. Madinatul Adawiyah, S.Farm',
        noSIPA: '',
        noSTRA: '',
        apotekerPendamping: [],
      },
      inventory: {
        stokKritis: 10,
        reminderKadaluwarsa: 3,
      },
      masterData: {
        units: [
          { id: '1', name: 'Tablet' },
          { id: '2', name: 'Kapsul' },
          { id: '3', name: 'Botol' },
          { id: '4', name: 'Box' },
          { id: '5', name: 'Strip' },
          { id: '6', name: 'Tube' },
          { id: '7', name: 'Ampul' },
        ],
        categories: [
          { id: '1', name: 'Obat Bebas' },
          { id: '2', name: 'Obat Bebas Terbatas' },
          { id: '3', name: 'Obat Keras' },
          { id: '4', name: 'Obat Narkotika' },
          { id: '5', name: 'Obat Psikotropika' },
        ],
      },
      loyalty: {
        pointValue: 5000,
        goldThreshold: 500000,
      },
      roles: [
        { role: 'Apoteker', permissions: [...allPermissions] },
        { role: 'Asisten Apoteker', permissions: ['dashboard', 'transaksi', 'inventaris', 'pengadaan', 'pelanggan'] },
        { role: 'Kasir', permissions: ['dashboard', 'transaksi', 'pelanggan'] },
      ],
      receipt: {
        headerLine1: '',
        headerLine2: '',
        headerLine3: '',
        footerLine1: 'Terima kasih atas kunjungan Anda',
        footerLine2: 'Semoga lekas sembuh!',
      },
      setBusiness: (b) => set((s) => ({ business: { ...s.business, ...b } })),
      setInventory: (i) => set((s) => ({ inventory: { ...s.inventory, ...i } })),
      setMasterData: (m) => set((s) => ({ masterData: { ...s.masterData, ...m } })),
      addUnit: (name) => set((s) => ({
        masterData: { ...s.masterData, units: [...s.masterData.units, { id: crypto.randomUUID(), name }] }
      })),
      removeUnit: (id) => set((s) => ({
        masterData: { ...s.masterData, units: s.masterData.units.filter((u) => u.id !== id) }
      })),
      addCategory: (name) => set((s) => ({
        masterData: { ...s.masterData, categories: [...s.masterData.categories, { id: crypto.randomUUID(), name }] }
      })),
      removeCategory: (id) => set((s) => ({
        masterData: { ...s.masterData, categories: s.masterData.categories.filter((c) => c.id !== id) }
      })),
      setLoyalty: (l) => set((s) => ({ loyalty: { ...s.loyalty, ...l } })),
      setRolePermissions: (role, permissions) => set((s) => ({
        roles: s.roles.map((r) => r.role === role ? { ...r, permissions } : r),
      })),
      setReceipt: (r) => set((s) => ({ receipt: { ...s.receipt, ...r } })),
    }),
    {
      name: 'apotek-storage',
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          return {
            ...persistedState,
            business: {
              namaApotek: 'Apotek Dinadawi',
              alamat: '',
              noSIA: '',
              ppnPercent: 11,
              logoUrl: '',
              email: '',
              telepon: '',
              website: '',
              namaAPJ: 'Apt. Madinatul Adawiyah, S.Farm',
              noSIPA: '',
              noSTRA: '',
              apotekerPendamping: [],
              ...(persistedState?.business || {}),
            },
            receipt: {
              headerLine1: '',
              headerLine2: '',
              headerLine3: '',
              footerLine1: 'Terima kasih atas kunjungan Anda',
              footerLine2: 'Semoga lekas sembuh!',
              ...(persistedState?.receipt || {}),
            },
          };
        }
        return persistedState as SettingsState;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
