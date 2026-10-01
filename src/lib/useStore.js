import { useSyncExternalStore } from 'react';
import { storeSnapshot } from './storage';

const subscribe = callback => {
  window.addEventListener('tlbc_storage_update', callback);
  return () => window.removeEventListener('tlbc_storage_update', callback);
};
export default function useStore() {
  return useSyncExternalStore(subscribe, storeSnapshot);
}
