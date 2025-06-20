import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

interface Pago {
    id: number;
    monto: number;
    metodo_pago: string;
    fecha_pago: string;
    numero_tarjeta_ultimos4: string;
    estado: string;
    curso_titulo: string;
    sede: string;
}

export default function HistorialPagosScreen() {
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useFocusEffect(
        React.useCallback(() => {
            let isActive = true;
            const fetchPagos = async () => {
                setLoading(true);
                const usuarioStr = await AsyncStorage.getItem('usuario');
                if (!usuarioStr) {
                    if (isActive) {
                        setPagos([]);
                        setLoading(false);
                    }
                    return;
                }
                const usuario = JSON.parse(usuarioStr);
                try {
                    const res = await fetch(`https://expo-app-tpo.vercel.app/api/inscripciones?usuario_email=${usuario.email}&tipo=pagos`);
                    const data = await res.json();
                    if (res.ok && Array.isArray(data.pagos)) {
                        if (isActive) setPagos(data.pagos);
                    } else {
                        if (isActive) setPagos([]);
                    }
                } catch {
                    if (isActive) setPagos([]);
                }
                if (isActive) setLoading(false);
            };
            fetchPagos();
            return () => { isActive = false; };
        }, [])
    );

    const formatearFecha = (fechaStr: string) => {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatearMonto = (monto: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(monto);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/views/alumno-info')}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Historial de Pagos</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {loading ? (
                    <Text style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>Cargando...</Text>
                ) : pagos.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>No hay pagos registrados.</Text>
                ) : (
                    pagos.map((pago) => (
                        <View key={pago.id} style={styles.pagoCard}>
                            <View style={styles.pagoHeader}>
                                <View style={styles.pagoInfo}>
                                    <Text style={styles.pagoTitulo}>{pago.curso_titulo}</Text>
                                    <Text style={styles.pagoSede}>Sede: {pago.sede}</Text>
                                </View>
                                <View style={styles.pagoMonto}>
                                    <Text style={styles.pagoMontoText}>{formatearMonto(pago.monto)}</Text>
                                    <View style={[styles.pagoEstado, 
                                        { backgroundColor: pago.estado === 'completado' ? '#d4edda' : '#fff3cd' }
                                    ]}>
                                        <Text style={[styles.pagoEstadoText,
                                            { color: pago.estado === 'completado' ? '#155724' : '#856404' }
                                        ]}>
                                            {pago.estado === 'completado' ? 'Completado' : 'Pendiente'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.pagoDetalles}>
                                <View style={styles.pagoDetalle}>
                                    <Ionicons name="calendar" size={16} color="#666" />
                                    <Text style={styles.pagoDetalleText}>{formatearFecha(pago.fecha_pago)}</Text>
                                </View>
                                <View style={styles.pagoDetalle}>
                                    <Ionicons name="card" size={16} color="#666" />
                                    <Text style={styles.pagoDetalleText}>
                                        {pago.metodo_pago === 'tarjeta' ? 'Tarjeta' : pago.metodo_pago} 
                                        {pago.numero_tarjeta_ultimos4 && ` ****${pago.numero_tarjeta_ultimos4}`}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#333',
        paddingHorizontal: 40,
        paddingTop: 80,
        paddingBottom: 60,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        position: 'relative',
    },
    headerText: {
        color: 'white',
        fontSize: 28,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 10,
        zIndex: 10,
    },
    pagoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    pagoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    pagoInfo: {
        flex: 1,
        marginRight: 12,
    },
    pagoTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    pagoSede: {
        fontSize: 14,
        color: '#666',
    },
    pagoMonto: {
        alignItems: 'flex-end',
    },
    pagoMontoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF7B6B',
        marginBottom: 4,
    },
    pagoEstado: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    pagoEstadoText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    pagoDetalles: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    pagoDetalle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pagoDetalleText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
    },
}); 