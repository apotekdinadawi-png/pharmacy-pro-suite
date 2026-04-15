import { useEffect } from 'react';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { useProcurementStore } from '@/stores/useProcurementStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useCustomerStore } from '@/stores/useCustomerStore';

/**
 * Hook to initialize all Supabase-backed stores when user is authenticated.
 * Call this once in AppLayout or similar top-level component.
 */
export const useInitStores = () => {
  const invLoaded = useInventoryStore((s) => s._loaded);
  const procLoaded = useProcurementStore((s) => s._loaded);
  const settLoaded = useSettingsStore((s) => s._hasHydrated);
  const custLoaded = useCustomerStore((s) => s._loaded);

  useEffect(() => {
    if (!invLoaded) useInventoryStore.getState().fetchAll();
    if (!procLoaded) useProcurementStore.getState().fetchAll();
    if (!settLoaded) useSettingsStore.getState().fetchAll();
    if (!custLoaded) useCustomerStore.getState().fetchAll();
  }, [invLoaded, procLoaded, settLoaded, custLoaded]);

  return {
    loading: !invLoaded || !procLoaded || !settLoaded || !custLoaded,
  };
};
