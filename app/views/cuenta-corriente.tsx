import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

interface Movimiento {
    id: number;
    tipo: 'credito' | 'debito';
    monto: number;
    concepto: string;
    fecha: string;
    curso_titulo?: string;
    aplicado: boolean;
}

interface CuentaCorriente {
    movimientos: Movimiento[];
    saldo: number;
}

export default function CuentaCorrienteScreen() {
    const [cuentaCorriente, setCuentaCorriente] = useState<CuentaCorriente>({ movimientos: [], saldo: 0 });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useFocusEffect(
        React.useCallback(() => {
            let isActive = true;
            const fetchCuentaCorriente = async () => {
                setLoading(true);
                const usuarioStr = await AsyncStorage.getItem('usuario');
                if (!usuarioStr) {
                    if (isActive) {
                        setCuentaCorriente({ movimientos: [], saldo: 0 });
                        setLoading(false);
                    }
                    return;
                }
                const usuario = JSON.parse(usuarioStr);
                try {
                    const res = await fetch(`https://expo-app-tpo.vercel.app/api/inscripciones?usuario_email=${usuario.email}&tipo=cuenta_corriente`);
                    const data = await res.json();
                    if (res.ok) {
                        if (isActive) setCuentaCorriente({
                            movimientos: data.movimientos || [],
                            saldo: data.saldo || 0
                        });
                    } else {
                        if (isActive) setCuentaCorriente({ movimientos: [], saldo: 0 });
                    }
                } catch {
                    if (isActive) setCuentaCorriente({ movimientos: [], saldo: 0 });
                }
                if (isActive) setLoading(false);
            };
            fetchCuentaCorriente();
            return () => { isActive = false; };
        }, [])
    );

    const formatearFecha = (fechaStr: string) => {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
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
                <Text style={styles.headerText}>Cuenta Corriente</Text>
            </View>
            
            {/* Saldo */}
            <View style={styles.saldoContainer}>
                <Text style={styles.saldoLabel}>Saldo Disponible</Text>
                <Text style={[styles.saldoMonto, { color: cuentaCorriente.saldo >= 0 ? '#28a745' : '#dc3545' }]}>
                    {formatearMonto(cuentaCorriente.saldo)}
                </Text>
                <Text style={styles.saldoDescripcion}>
                    {cuentaCorriente.saldo > 0 
                        ? 'Tienes crédito disponible para futuros cursos'
                        : cuentaCorriente.saldo < 0
                        ? 'Tienes un saldo pendiente'
                        : 'No tienes movimientos en tu cuenta'
                    }
                </Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={styles.movimientosTitle}>Movimientos</Text>
                {loading ? (
                    <Text style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>Cargando...</Text>
                ) : cuentaCorriente.movimientos.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>No hay movimientos registrados.</Text>
                ) : (
                    cuentaCorriente.movimientos.map((movimiento) => (
                        <View key={movimiento.id} style={styles.movimientoCard}>
                            <View style={styles.movimientoHeader}>
                                <View style={styles.movimientoIcono}>
                                    <Ionicons 
                                        name={movimiento.tipo === 'credito' ? 'add-circle' : 'remove-circle'} 
                                        size={24} 
                                        color={movimiento.tipo === 'credito' ? '#28a745' : '#dc3545'} 
                                    />
                                </View>
                                <View style={styles.movimientoInfo}>
                                    <Text style={styles.movimientoConcepto}>{movimiento.concepto}</Text>
                                    {movimiento.curso_titulo && (
                                        <Text style={styles.movimientoCurso}>{movimiento.curso_titulo}</Text>
                                    )}
                                    <Text style={styles.movimientoFecha}>{formatearFecha(movimiento.fecha)}</Text>
                                </View>
                                <View style={styles.movimientoMonto}>
                                    <Text style={[styles.movimientoMontoText, 
                                        { color: movimiento.tipo === 'credito' ? '#28a745' : '#dc3545' }
                                    ]}>
                                        {movimiento.tipo === 'credito' ? '+' : '-'}{formatearMonto(movimiento.monto)}
                                    </Text>
                                    {!movimiento.aplicado && (
                                        <View style={styles.pendienteBadge}>
                                            <Text style={styles.pendienteText}>Pendiente</Text>
                                        </View>
                                    )}
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
    saldoContainer: {
        backgroundColor: '#f8f9fa',
        margin: 20,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    saldoLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    saldoMonto: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    saldoDescripcion: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    movimientosTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    movimientoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    movimientoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    movimientoIcono: {
        marginRight: 12,
    },
    movimientoInfo: {
        flex: 1,
    },
    movimientoConcepto: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    movimientoCurso: {
        fontSize: 14,
        color: '#FF7B6B',
        marginBottom: 2,
    },
    movimientoFecha: {
        fontSize: 13,
        color: '#666',
    },
    movimientoMonto: {
        alignItems: 'flex-end',
    },
    movimientoMontoText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    pendienteBadge: {
        backgroundColor: '#fff3cd',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    pendienteText: {
        fontSize: 11,
        color: '#856404',
        fontWeight: 'bold',
    },
}); 