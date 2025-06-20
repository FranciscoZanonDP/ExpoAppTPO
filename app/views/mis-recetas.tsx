import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_IMAGE = "https://media.istockphoto.com/id/1409329028/es/vector/no-hay-imagen-disponible-marcador-de-posici%C3%B3n-miniatura-icono-dise%C3%B1o-de-ilustraci%C3%B3n.jpg?s=612x612&w=0&k=20&c=Bd89b8CBr-IXx9mBbTidc-wu_gtIj8Py_EMr3hGGaPw=";

export default function MisRecetasScreen() {
    const router = useRouter();
    const [recetas, setRecetas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState<any>(null);

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
                    const res = await fetch(`https://expo-app-tpo.vercel.app/api/recetas?usuario_id=${usuario.id}&limit=3`);
                    const data = await res.json();
                    if (isActive && res.ok && data.recetas) {
                        setRecetas(data.recetas);
                    } else if (isActive) {
                        setRecetas([]);
                    }
                } catch (err) {
                    if (isActive) setRecetas([]);
                }
                if (isActive) setLoading(false);
            };
            fetchRecetas();
            return () => { isActive = false; };
        }, [])
    );

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Mis recetas</Text>
                <View style={styles.searchBar}>
                    <Text style={styles.searchText}>Buscar</Text>
                    <Ionicons name="menu" size={28} color="white" style={styles.menuIcon} />
                </View>
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>En revisión</Text>
                    <TouchableOpacity>
                        <Text style={styles.sectionLink}>Ver todas</Text>
                    </TouchableOpacity>
                </View>
                {/* Aquí irían las recetas en revisión, por ahora vacío */}
                <View style={{ height: 40 }} />
                <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>Cargadas</Text>
                    <TouchableOpacity>
                        <Text style={styles.sectionLink}>Ver todas</Text>
                    </TouchableOpacity>
                </View>
                {loading ? (
                    <ActivityIndicator size="large" color="#FF7B6B" style={{ marginTop: 30 }} />
                ) : recetas.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginTop: 30, color: '#999' }}>No tienes recetas cargadas.</Text>
                ) : (
                    <View style={styles.placeholderRow}>
                        {recetas.map((receta, idx) => (
                            <TouchableOpacity key={receta.id} style={styles.placeholderBox} onPress={() => router.push({ pathname: '/views/receta-detalle-mis-recetas', params: { id: receta.id } })}>
                                <Image 
                                    source={{ uri: receta.imagen || DEFAULT_IMAGE }} 
                                    style={styles.recetaImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.recetaTextContainer}>
                                    <Text style={styles.recetaNombre}>{receta.nombre}</Text>
                                    <Text style={styles.recetaCategoria}>{receta.categoria}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/views/cargar-receta-1')}>
                        <Text style={styles.actionButtonText}>Cargar receta</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/views/editar-mis-recetas')}>
                        <Text style={styles.actionButtonText}>Editar recetas</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <View style={styles.bottomNav}>
                <TouchableOpacity onPress={() => router.replace('/views/home')}>
                    <Ionicons name="home-outline" size={32} color="#FF7B6B" />
                </TouchableOpacity>
                <Ionicons name="search-outline" size={32} color="#FF7B6B" />
                <Ionicons name="restaurant-outline" size={32} color="#FF7B6B" />
                <Ionicons name="person" size={32} color="#FF7B6B" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#333',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF7B6B',
        borderRadius: 30,
        paddingHorizontal: 24,
        paddingVertical: 12,
        width: '100%',
        justifyContent: 'space-between',
    },
    searchText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
    },
    menuIcon: {
        marginLeft: 10,
    },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 32,
        marginHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'black',
    },
    sectionLink: {
        fontWeight: 'bold',
        color: 'black',
        fontSize: 16,
    },
    placeholderRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginHorizontal: 20,
        marginTop: 24,
        gap: 16,
    },
    placeholderBox: {
        width: 110,
        height: 140,
        backgroundColor: '#E5E5E5',
        borderRadius: 6,
        overflow: 'hidden',
    },
    recetaImage: {
        width: '100%',
        height: 80,
    },
    recetaTextContainer: {
        padding: 8,
        flex: 1,
        justifyContent: 'center',
    },
    recetaNombre: {
        fontWeight: 'bold',
        color: '#FF7B6B',
        textAlign: 'center',
        fontSize: 12,
        marginBottom: 2,
    },
    recetaCategoria: {
        color: '#333',
        textAlign: 'center',
        fontSize: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 32,
    },
    actionButton: {
        backgroundColor: '#E5E5E5',
        borderRadius: 4,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    actionButtonText: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'black',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 18,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        backgroundColor: 'white',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
}); 