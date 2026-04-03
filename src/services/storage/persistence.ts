interface StorageService {
  get<T>(key: string, defaultValue: T): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
}

class LocalStorageService implements StorageService {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const raw = localStorage.getItem(`pdf-reader:${key}`);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(`pdf-reader:${key}`, JSON.stringify(value));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }
}

class ElectronStorageService implements StorageService {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const electronAPI = (window as any).electronAPI;
      const value = await electronAPI.store.get(key);
      return value !== undefined && value !== null ? value : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const electronAPI = (window as any).electronAPI;
      await electronAPI.store.set(key, value);
    } catch (e) {
      console.error("Failed to save to electron-store:", e);
    }
  }
}

function isElectron(): boolean {
  return !!(window as any).electronAPI?.store;
}

export const storage: StorageService = isElectron()
  ? new ElectronStorageService()
  : new LocalStorageService();
