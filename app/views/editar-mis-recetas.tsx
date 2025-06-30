import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavbar from '@/components/BottomNavbar';

export default function EditarMisRecetasScreen() {
    const router = useRouter();
    const [recetas, setRecetas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState<any>(null);

    const fetchRecetas = async () => {
        setLoading(true);
        const usuarioStr = await AsyncStorage.getItem('usuario');
        if (!usuarioStr) {
            setLoading(false);
            setUsuario(null);
            return;
        }
        const usuario = JSON.parse(usuarioStr);
        setUsuario(usuario);
        console.log('Usuario cargado:', usuario);
        let url = '';
        if (usuario.id) {
            url = `https://expo-app-tpo.vercel.app/api/recetas?usuario_id=${usuario.id}`;
        } else if (usuario.email) {
            url = `https://expo-app-tpo.vercel.app/api/recetas?usuario_email=${usuario.email}`;
        } else {
            setRecetas([]);
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok && data.recetas) {
                setRecetas(data.recetas);
            } else {
                setRecetas([]);
            }
        } catch (err) {
            console.error('Error cargando recetas:', err);
            setRecetas([]);
        }
        setLoading(false);
    };

    // Usar useFocusEffect para recargar las recetas cada vez que la pantalla obtiene el foco
    useFocusEffect(
        useCallback(() => {
            console.log('Recargando recetas...');
            fetchRecetas();
        }, [])
    );

    const handleEditar = async (receta: any) => {
        const res = await fetch(`https://expo-app-tpo.vercel.app/api/recetas?id=${receta.id}`);
        const recetaCompleta = await res.json();
        router.push({ pathname: '/views/editar-receta', params: { receta: JSON.stringify(recetaCompleta) } });
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/views/mis-recetas')}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar mis recetas</Text>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {loading ? (
                    <ActivityIndicator size="large" color="#FF7B6B" style={{ marginTop: 30 }} />
                ) : !usuario ? (
                    <Text style={{ textAlign: 'center', marginTop: 30, color: '#999' }}>Debes iniciar sesión para ver tus recetas.</Text>
                ) : recetas.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginTop: 30, color: '#999' }}>No tienes recetas cargadas.</Text>
                ) : (
                    <View style={styles.recetasList}>
                        {recetas.map((receta) => (
                            <TouchableOpacity key={receta.id} style={styles.recetaBox} onPress={() => handleEditar(receta)}>
                                <Text style={styles.recetaNombre}>{receta.nombre}</Text>
                                <Text style={styles.recetaCategoria}>{receta.categoria}</Text>
                                <Ionicons name="create-outline" size={24} color="#FF7B6B" style={{ position: 'absolute', right: 16, top: 16 }} />
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
        paddingBottom: 40,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
    },
    recetasList: {
        marginTop: 30,
        paddingHorizontal: 20,
    },
    recetaBox: {
        backgroundColor: '#E5E5E5',
        borderRadius: 8,
        padding: 20,
        marginBottom: 18,
        position: 'relative',
    },
    recetaNombre: {
        fontWeight: 'bold',
        color: '#FF7B6B',
        fontSize: 20,
        marginBottom: 4,
    },
    recetaCategoria: {
        color: '#333',
        fontSize: 16,
    },

    backButton: {
        position: 'absolute',
        left: 10,
        top: 50,
        zIndex: 10,
        padding: 8,
    },
}); 