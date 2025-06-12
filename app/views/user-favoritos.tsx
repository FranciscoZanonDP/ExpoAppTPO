import { StyleSheet, View, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserFavoritosScreen() {
    const router = useRouter();
    const [favoritos, setFavoritos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState<any>(null);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const fetchFavoritos = async () => {
                setLoading(true);
                const usuarioStr = await AsyncStorage.getItem('usuario');
                if (!usuarioStr) {
                    setFavoritos([]);
                    setUsuario(null);
                    setLoading(false);
                    return;
                }
                const usuarioObj = JSON.parse(usuarioStr);
                setUsuario(usuarioObj);
                const res = await fetch(`https://expo-app-tpo.vercel.app/api/favoritos?usuario_id=${usuarioObj.id}`);
                const data = await res.json();
                if (isActive) setFavoritos(data.favoritos || []);
                if (isActive) setLoading(false);
            };
            fetchFavoritos();
            return () => { isActive = false; };
        }, [])
    );

    const handleRecipePress = (receta: any) => {
        router.push({ pathname: '/views/receta-detalle', params: { id: receta.id } });
    };

    const handleBack = () => {
        if (usuario?.userType === 'Alumno') {
            router.replace('/views/alumno-info');
        } else {
            router.replace('/views/user-info');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Recetas Favoritas</ThemedText>
                </View>
                <ScrollView style={styles.content}>
                    <View style={styles.recipesGrid}>
                        {loading ? (
                            <ThemedText style={{ textAlign: 'center', color: '#999', marginVertical: 20 }}>Cargando...</ThemedText>
                        ) : favoritos.length === 0 ? (
                            <ThemedText style={{ textAlign: 'center', color: '#999', marginVertical: 20 }}>No tienes recetas favoritas.</ThemedText>
                        ) : (
                            favoritos.reduce((rows: any[][], receta: any, idx: number) => {
                                if (idx % 2 === 0) rows.push([receta]);
                                else rows[rows.length - 1].push(receta);
                                return rows;
                            }, []).map((row, rowIdx) => (
                                <View style={styles.row} key={rowIdx}>
                                    {row.map((receta: any) => (
                                        <TouchableOpacity
                                            style={styles.recipeCard}
                                            key={receta.id}
                                            onPress={() => handleRecipePress(receta)}
                                        >
                                            <Image
                                                source={receta.imagen_url ? { uri: receta.imagen_url } : require('../../assets/images/tortadebanana.jpg')}
                                                style={styles.recipeImage}
                                            />
                                            <View style={styles.recipeInfo}>
                                                <ThemedText style={styles.recipeTitle}>{receta.nombre}</ThemedText>
                                                <ThemedText style={styles.recipeCategory}>{receta.categoria}</ThemedText>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#FF7B6B',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        alignItems: 'center',
        position: 'relative',
        marginBottom: 10,
    },
    backButton: {
        position: 'absolute',
        left: 10,
        top: 60,
        zIndex: 10,
        padding: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginTop: 10,
    },
    content: {
        flex: 1,
        padding: 15,
    },
    recipesGrid: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    recipeCard: {
        width: '48%',
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    recipeImage: {
        width: '100%',
        height: 120,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    recipeInfo: {
        padding: 10,
    },
    recipeTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    recipeCategory: {
        fontSize: 12,
        color: '#999',
    },
}); 