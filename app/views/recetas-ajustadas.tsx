import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_IMAGE = "https://media.istockphoto.com/id/1409329028/es/vector/no-hay-imagen-disponible-marcador-de-posici%C3%B3n-miniatura-icono-dise%C3%B1o-de-ilustraci%C3%B3n.jpg?s=612x612&w=0&k=20&c=Bd89b8CBr-IXx9mBbTidc-wu_gtIj8Py_EMr3hGGaPw=";

export default function RecetasAjustadasScreen() {
    const router = useRouter();
    const [recetas, setRecetas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRecetasAjustadas = async () => {
        setLoading(true);
        const guardadasStr = await AsyncStorage.getItem('recetasAjustadas');
        let guardadas = [];
        if (guardadasStr) guardadas = JSON.parse(guardadasStr);
        setRecetas(guardadas.reverse()); // Mostrar la más reciente primero
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            fetchRecetasAjustadas();
        }, [])
    );

    const eliminarReceta = async (fecha: number) => {
        Alert.alert(
            'Eliminar receta',
            '¿Estás seguro de que deseas eliminar esta receta ajustada?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar', style: 'destructive', onPress: async () => {
                        let nuevas = recetas.filter(r => r.fecha !== fecha);
                        await AsyncStorage.setItem('recetasAjustadas', JSON.stringify(nuevas));
                        setRecetas(nuevas);
                    }
                }
            ]
        );
    };

    const editarReceta = (receta: any) => {
        // Redirigir a la pantalla de detalle de receta, pasando los datos ajustados
        router.push({ pathname: '/views/receta-detalle', params: { ...receta, ingredientes: JSON.stringify(receta.ingredientes) } });
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recetas ajustadas</Text>
                <Text style={styles.headerSubtitle}>Tus últimas recetas ajustadas guardadas localmente</Text>
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
                            name="cloud-offline-outline" 
                            size={80} 
                            color="#E0E0E0" 
                        />
                        <Text style={styles.emptyTitle}>No hay recetas ajustadas guardadas</Text>
                        <Text style={styles.emptySubtitle}>Guarda una receta ajustada para verla aquí</Text>
                    </View>
                ) : (
                    <View style={styles.recetasGrid}>
                        {recetas.map((receta: any) => (
                            <View key={receta.fecha} style={styles.recetaCard}>
                                <Image 
                                    source={{ uri: receta.imagen_url || DEFAULT_IMAGE }} 
                                    style={styles.recetaImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.recetaContent}>
                                    <Text style={styles.recetaNombre} numberOfLines={2}>{receta.nombre}</Text>
                                    <Text style={styles.recetaCategoria}>{receta.categoria}</Text>
                                    <Text style={styles.porcionesText}>Porciones: {receta.porciones}</Text>
                                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                        <TouchableOpacity style={styles.editBtn} onPress={() => editarReceta(receta)}>
                                            <Ionicons name="create-outline" size={20} color="#FF7B6B" />
                                            <Text style={styles.editBtnText}>Editar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.deleteBtn} onPress={() => eliminarReceta(receta.fecha)}>
                                            <Ionicons name="trash-outline" size={20} color="#fff" />
                                            <Text style={styles.deleteBtnText}>Eliminar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
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
    },
    recetasGrid: {
        flexDirection: 'column',
        gap: 18,
        paddingHorizontal: 16,
    },
    recetaCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        marginBottom: 12,
        flexDirection: 'row',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        padding: 10,
    },
    recetaImage: {
        width: 90,
        height: 90,
        borderRadius: 18,
        marginRight: 14,
        backgroundColor: '#EEE',
    },
    recetaContent: {
        flex: 1,
        justifyContent: 'center',
    },
    recetaNombre: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
    },
    recetaCategoria: {
        color: '#FF7B6B',
        fontWeight: 'bold',
        fontSize: 15,
        marginBottom: 2,
    },
    porcionesText: {
        color: '#666',
        fontSize: 14,
        marginTop: 2,
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3EE',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 14,
        marginRight: 10,
    },
    editBtnText: {
        color: '#FF7B6B',
        fontWeight: 'bold',
        marginLeft: 4,
        fontSize: 15,
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF7B6B',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 14,
    },
    deleteBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 4,
        fontSize: 15,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'black',
        borderTopWidth: 1,
        borderTopColor: '#FF7B6B',
    },
}); 