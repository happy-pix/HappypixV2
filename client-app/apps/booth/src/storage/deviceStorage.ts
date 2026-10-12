// Booth device storage.
//
// Persistent storage for booth pairing, cached configuration, and device UUID.
// The device identity is stored under its own dedicated key and is NEVER deleted
// on logout or event reset — it is only purged when the device is manually
// removed from the CRM.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setStorageAdapter, type StorageAdapter } from '../../../../packages/api/src/index';

export const deviceStorage: StorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      console.warn('[DeviceStorage] setItem failed:', err);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.warn('[DeviceStorage] removeItem failed:', err);
    }
  },
};

setStorageAdapter(deviceStorage);

/**
 * Captured photos are photo URIs (or data URLs).
 * Returns array of photo strings safe for session payload.
 */
export async function photosAsDataUrls(uris: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const uri of uris) {
    if (uri) {
      out.push(uri);
    }
  }
  return out;
}
