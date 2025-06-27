import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavbar from '@/components/BottomNavbar';

const DEFAULT_IMAGE = "https://media.istockphoto.com/id/1409329028/es/vector/no-hay-imagen-disponible-marcador-de-posici%C3%B3n-miniatura-icono-dise%C3%B1o-de-ilustraci%C3%B3n.jpg?s=612x612&w=0&k=20&c=Bd89b8CBr-IXx9mBbTidc-wu_gtIj8Py_EMr3hGGaPw=";

export default function TodasMisRecetasScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [recetas, setRecetas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState<any>(null);

    // Obtener título y estado según parámetros
    const estado = params.estado as string;
    const titulo = estado === 'en_revision' ? 'En revisión' : 'Cargadas';

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const fetchRecetas = async () => {
                setLoading(true);
                const usuarioStr = await AsyncStorage.getItem('usuario');
                if (!usuarioStr) {
                    setLoading(false);
                    return;
                }
                const usuario = JSON.parse(usuarioStr);
                setUsuario(usuario);
                
                try {
                    const res = await fetch(`https://expo-app-tpo.vercel.app/api/recetas?usuario_id=${usuario.id}&estado=${estado}`);
                    const data = await res.json();
                    if (isActive && res.ok && data.recetas) {
                        setRecetas(data.recetas);
                    } else if (isActive) {
                        setRecetas([]);
                    }
                } catch (err) {
                    console.error('Error fetching recetas:', err);
                    if (isActive) {
                        setRecetas([]);
                    }
                }
                if (isActive) setLoading(false);
            };
            fetchRecetas();
            return () => { isActive = false; };
        }, [estado])
    );

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/views/mis-recetas')}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{titulo}</Text>
                <Text style={styles.headerSubtitle}>
                    {estado === 'en_revision' ? 'Recetas pendientes de aprobación' : 'Recetas aprobadas y públicas'}
                </Text>
            </View>

            <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <ActivityIndicator size="large" color="#FF7B6B" style={{ marginTop: 50 }} />
                ) : recetas.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons 
                            name={estado === 'en_revision' ? 'time-outline' : 'checkmark-circle-outline'} 
                            size={80} 
                            color="#E0E0E0" 
                        />
                        <Text style={styles.emptyTitle}>
                            {estado === 'en_revision' ? 'No hay recetas en revisión' : 'No hay recetas aprobadas'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {estado === 'en_revision' 
                                ? 'Las recetas que cargues aparecerán aquí mientras son revisadas'
                                : 'Tus recetas aprobadas aparecerán aquí'
                            }
                        </Text>
                        <TouchableOpacity 
                            style={styles.cargarRecetaBtn}
                            onPress={() => router.push('/views/cargar-receta-1')}
                        >
                            <Ionicons name="add-circle" size={24} color="white" />
                            <Text style={styles.cargarRecetaText}>Cargar nueva receta</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.recetasGrid}>
                        {recetas.map((receta: any) => (
                            <TouchableOpacity 
                                key={receta.id} 
                                style={styles.recetaCard} 
                                onPress={() => router.push({ pathname: '/views/receta-detalle-mis-recetas', params: { id: receta.id } })}
                            >
                                <Image 
                                    source={{ uri: receta.imagen_url || DEFAULT_IMAGE }} 
                                    style={styles.recetaImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.recetaContent}>
                                    <Text style={styles.recetaNombre} numberOfLines={2}>{receta.nombre}</Text>
                                    <Text style={styles.recetaCategoria}>{receta.categoria}</Text>
                                    
                                    {estado === 'en_revision' && (
                                        <View style={styles.estadoBadge}>
                                            <Ionicons name="time" size={12} color="#FF8C00" />
                                            <Text style={styles.estadoText}>En revisión</Text>
                                        </View>
                                    )}
                                    
                                    {estado === 'aprobada' && (
                                        <View style={[styles.estadoBadge, { backgroundColor: '#E8F5E8' }]}>
                                            <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                                            <Text style={[styles.estadoText, { color: '#4CAF50' }]}>Aprobada</Text>
                                        </View>
                                    )}

                                    <Text style={styles.fechaCreacion}>
                                        {new Date(receta.created_at).toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Footer unificado */}
            <BottomNavbar currentScreen="recipes" />
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#333',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingTop: 60,
        paddingBottom: 30,
        alignItems: 'center',
        paddingHorizontal: 20,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: 60,
        zIndex: 10,
        padding: 8,
    },
    headerTitle: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 10,
    },
    headerSubtitle: {
        color: '#E0E0E0',
        fontSize: 16,
        textAlign: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingTop: 80,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    cargarRecetaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF7B6B',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
    },
    cargarRecetaText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    recetasGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        gap: 15,
    },
    recetaCard: {
        width: '48%',
        backgroundColor: 'white',
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    recetaImage: {
        width: '100%',
        height: 120,
    },
    recetaContent: {
        padding: 12,
    },
    recetaNombre: {
        fontWeight: 'bold',
        color: '#333',
        fontSize: 16,
        marginBottom: 4,
        lineHeight: 20,
    },
    recetaCategoria: {
        color: '#FF7B6B',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    estadoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginBottom: 8,
        gap: 4,
    },
    estadoText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FF8C00',
    },
    fechaCreacion: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
    },

}); 