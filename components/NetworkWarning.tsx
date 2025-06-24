import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

interface NetworkWarningProps {
  visible: boolean;
  onContinue: () => void;
  onWaitForWifi: () => void;
  pendingSyncCount?: number;
  isOffline?: boolean;
}

export default function NetworkWarning({ 
  visible, 
  onContinue, 
  onWaitForWifi, 
  pendingSyncCount = 0,
  isOffline = false 
}: NetworkWarningProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onWaitForWifi}
      statusBarTranslucent={false}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={isOffline ? "cloud-offline-outline" : "cellular-outline"} 
              size={48} 
              color="#FF7B6B" 
            />
          </View>
          
          <ThemedText style={styles.title}>
            {isOffline ? "Sin conexión a internet" : "Datos móviles detectados"}
          </ThemedText>
          
          <ThemedText style={styles.message}>
            {isOffline 
              ? "Estás sin conexión. Los datos se guardarán localmente y se sincronizarán cuando vuelvas a conectarte."
              : "Estás usando datos móviles. La app funcionará normalmente, pero algunas funciones pueden consumir datos adicionales."
            }
          </ThemedText>

          {pendingSyncCount > 0 && (
            <View style={styles.syncInfo}>
              <Ionicons name="sync-outline" size={16} color="#666" />
              <ThemedText style={styles.syncText}>
                {pendingSyncCount} {pendingSyncCount === 1 ? 'acción' : 'acciones'} pendiente{pendingSyncCount > 1 ? 's' : ''} de sincronización
              </ThemedText>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.waitButton} onPress={onWaitForWifi}>
              <ThemedText style={styles.waitButtonText}>
                {isOffline ? "Entendido" : "Esperar WiFi"}
              </ThemedText>
            </TouchableOpacity>
            
            {!isOffline && (
              <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
                <ThemedText style={styles.continueButtonText}>Continuar</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    alignItems: 'center',
    maxWidth: 350,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  waitButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  waitButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#FF7B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  syncText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 5,
  },
}); 