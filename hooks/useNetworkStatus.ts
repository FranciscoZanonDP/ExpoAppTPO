import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NetworkStatus {
  isConnected: boolean;
  isWifi: boolean;
  isMobileData: boolean;
  type: string | null;
}

export interface PendingSync {
  id: string;
  action: 'create' | 'update' | 'delete' | 'fetch';
  endpoint: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  expiresAt: number;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: false,
    isWifi: false,
    isMobileData: false,
    type: null,
  });

  const [pendingSync, setPendingSync] = useState<PendingSync[]>([]);
  const [cachedData, setCachedData] = useState<Map<string, CachedData>>(new Map());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Obtener estado inicial de la red
    const getInitialNetworkState = async () => {
      const state = await NetInfo.fetch();
      updateNetworkStatus(state);
    };

    getInitialNetworkState();

    // Suscribirse a cambios de red
    const unsubscribe = NetInfo.addEventListener((state) => {
      updateNetworkStatus(state);
    });

    // Cargar datos pendientes y cache
    loadPendingSync();
    loadCachedData();

    return () => {
      unsubscribe();
    };
  }, []);

  const updateNetworkStatus = (state: any) => {
    const isWifi = state.type === 'wifi';
    const isMobileData = state.type === 'cellular';
    const wasConnected = networkStatus.isConnected;
    const wasWifi = networkStatus.isWifi;
    const wasMobileData = networkStatus.isMobileData;
    
    const newNetworkStatus = {
      isConnected: state.isConnected,
      isWifi,
      isMobileData,
      type: state.type,
    };
    
    setNetworkStatus(newNetworkStatus);

    // Log para debugging
    console.log('🔄 Cambio de red detectado:', {
      anterior: { isWifi: wasWifi, isMobileData: wasMobileData, isConnected: wasConnected },
      actual: { isWifi, isMobileData, isConnected: state.isConnected, type: state.type }
    });

    // Si se conecta a WiFi y hay datos pendientes, sincronizar
    if (state.isConnected && isWifi && pendingSync.length > 0 && !isSyncing) {
      console.log('📡 Sincronizando datos pendientes en WiFi');
      syncPendingData();
    }

    // Si cambia de WiFi a datos móviles
    if (wasWifi && isMobileData && state.isConnected) {
      console.log('📱 Cambio detectado: WiFi → Datos móviles');
    }

    // Si cambia de datos móviles a WiFi
    if (wasMobileData && isWifi && state.isConnected) {
      console.log('📶 Cambio detectado: Datos móviles → WiFi');
    }

    // Si se pierde la conexión
    if (wasConnected && !state.isConnected) {
      console.log('❌ Conexión perdida - Los datos se guardarán localmente');
    }

    // Si se recupera la conexión
    if (!wasConnected && state.isConnected) {
      console.log('✅ Conexión recuperada');
    }
  };

  const loadPendingSync = async () => {
    try {
      const pendingData = await AsyncStorage.getItem('pendingSync');
      if (pendingData) {
        setPendingSync(JSON.parse(pendingData));
      }
    } catch (error) {
      console.error('Error loading pending sync:', error);
    }
  };

  const loadCachedData = async () => {
    try {
      const cachedDataStr = await AsyncStorage.getItem('cachedData');
      if (cachedDataStr) {
        const parsed = JSON.parse(cachedDataStr);
        const map = new Map<string, CachedData>();
        for (const [key, value] of Object.entries(parsed)) {
          map.set(key, value as CachedData);
        }
        setCachedData(map);
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  };

  const addPendingSync = async (action: 'create' | 'update' | 'delete' | 'fetch', endpoint: string, data: any) => {
    const newPending: PendingSync = {
      id: Date.now().toString(),
      action,
      endpoint,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    const updatedPending = [...pendingSync, newPending];
    setPendingSync(updatedPending);

    try {
      await AsyncStorage.setItem('pendingSync', JSON.stringify(updatedPending));
    } catch (error) {
      console.error('Error saving pending sync:', error);
    }
  };

  const cacheData = async (key: string, data: any, expiresInHours: number = 24) => {
    const cachedItem: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (expiresInHours * 60 * 60 * 1000),
    };

    const newCache = new Map(cachedData);
    newCache.set(key, cachedItem);
    setCachedData(newCache);

    try {
      const cacheObject = Object.fromEntries(newCache);
      await AsyncStorage.setItem('cachedData', JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Error saving cached data:', error);
    }
  };

  const getCachedData = (key: string): any | null => {
    const item = cachedData.get(key);
    if (!item) return null;

    // Verificar si expiró
    if (Date.now() > item.expiresAt) {
      const newCache = new Map(cachedData);
      newCache.delete(key);
      setCachedData(newCache);
      return null;
    }

    return item.data;
  };

  const syncPendingData = async () => {
    if (pendingSync.length === 0 || isSyncing) return;

    setIsSyncing(true);
    const maxRetries = 3;

    try {
      for (const pending of pendingSync) {
        if (pending.retryCount >= maxRetries) continue;

        try {
          let response;
          
          switch (pending.action) {
            case 'create':
              response = await fetch(pending.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pending.data),
              });
              break;
            
            case 'update':
              response = await fetch(pending.endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pending.data),
              });
              break;
            
            case 'delete':
              response = await fetch(pending.endpoint, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pending.data),
              });
              break;
            
            case 'fetch':
              response = await fetch(pending.endpoint);
              break;
          }

          if (response?.ok) {
            // Eliminar de pendientes si fue exitoso
            const updatedPending = pendingSync.filter(p => p.id !== pending.id);
            setPendingSync(updatedPending);
            await AsyncStorage.setItem('pendingSync', JSON.stringify(updatedPending));
          } else {
            // Incrementar contador de reintentos
            const updatedPending = pendingSync.map(p => 
              p.id === pending.id 
                ? { ...p, retryCount: p.retryCount + 1 }
                : p
            );
            setPendingSync(updatedPending);
            await AsyncStorage.setItem('pendingSync', JSON.stringify(updatedPending));
          }
        } catch (error) {
          console.error(`Error syncing pending item ${pending.id}:`, error);
          // Incrementar contador de reintentos
          const updatedPending = pendingSync.map(p => 
            p.id === pending.id 
              ? { ...p, retryCount: p.retryCount + 1 }
              : p
          );
          setPendingSync(updatedPending);
          await AsyncStorage.setItem('pendingSync', JSON.stringify(updatedPending));
        }
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const clearExpiredCache = async () => {
    const now = Date.now();
    const newCache = new Map(cachedData);
    let hasChanges = false;

    for (const [key, item] of newCache.entries()) {
      if (now > item.expiresAt) {
        newCache.delete(key);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      setCachedData(newCache);
      const cacheObject = Object.fromEntries(newCache);
      await AsyncStorage.setItem('cachedData', JSON.stringify(cacheObject));
    }
  };

  const shouldShowDataWarning = () => {
    return networkStatus.isConnected && networkStatus.isMobileData;
  };

  const shouldSyncAutomatically = () => {
    return networkStatus.isConnected && networkStatus.isWifi;
  };

  const isOffline = () => {
    return !networkStatus.isConnected;
  };

  const getPendingSyncCount = () => {
    return pendingSync.length;
  };

  return {
    networkStatus,
    pendingSync,
    cachedData,
    isSyncing,
    addPendingSync,
    cacheData,
    getCachedData,
    shouldShowDataWarning,
    shouldSyncAutomatically,
    syncPendingData,
    clearExpiredCache,
    isOffline,
    getPendingSyncCount,
  };
}; 