import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

interface SyncStatusProps {
  pendingSyncCount: number;
  isSyncing: boolean;
  isOffline: boolean;
  onSyncPress?: () => void;
}

export default function SyncStatus({ 
  pendingSyncCount, 
  isSyncing, 
  isOffline, 
  onSyncPress 
}: SyncStatusProps) {
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isSyncing) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isSyncing, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (pendingSyncCount === 0 && !isOffline) {
    return null;
  }

  return (
    <View style={styles.container}>
      {isOffline ? (
        <View style={styles.offlineStatus}>
          <Ionicons name="cloud-offline-outline" size={16} color="#FF7B6B" />
          <ThemedText style={styles.offlineText}>Modo offline</ThemedText>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.syncStatus, isSyncing && styles.syncing]} 
          onPress={onSyncPress}
          disabled={isSyncing}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons 
              name={isSyncing ? "sync" : "sync-outline"} 
              size={16} 
              color={isSyncing ? "#FF7B6B" : "#666"} 
            />
          </Animated.View>
          <ThemedText style={[styles.syncText, isSyncing && styles.syncingText]}>
            {isSyncing 
              ? "Sincronizando..." 
              : `${pendingSyncCount} pendiente${pendingSyncCount > 1 ? 's' : ''}`
            }
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  offlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 123, 107, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF7B6B',
  },
  offlineText: {
    color: '#FF7B6B',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 102, 102, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#666',
  },
  syncing: {
    backgroundColor: 'rgba(255, 123, 107, 0.1)',
    borderColor: '#FF7B6B',
  },
  syncText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  syncingText: {
    color: '#FF7B6B',
  },
}); 