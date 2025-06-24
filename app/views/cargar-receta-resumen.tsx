import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useReceta } from '../RecetaContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function CargarRecetaResumenScreen() {
    const router = useRouter();
    const { receta } = useReceta();
    const [expanded, setExpanded] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [usuario, setUsuario] = useState<any>(null);

    // Carrusel ingredientes
    const [slideIng, setSlideIng] = useState(0);
    const translateXIng = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.spring(translateXIng, {
            toValue: -slideIng * SCREEN_WIDTH,
            useNativeDriver: true,
        }).start();
    }, [slideIng]);

    // Carrusel pasos
    const [slidePaso, setSlidePaso] = useState(0);
    const translateXPaso = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.spring(translateXPaso, {
            toValue: -slidePaso * SCREEN_WIDTH,
            useNativeDriver: true,
        }).start();
    }, [slidePaso]);

    useEffect(() => {
        const fetchUsuario = async () => {
            const usuarioStr = await AsyncStorage.getItem('usuario');
            if (usuarioStr) setUsuario(JSON.parse(usuarioStr));
        };
        fetchUsuario();
    }, []);

    const handleSubirReceta = async () => {
        if (!usuario) {
            Alert.alert('Error', 'No hay usuario logueado');
            return;
        }
        setLoading(true);
        try {
            const recetaAEnviar = {
                ...receta,
                usuario_id: usuario.id,
                email: usuario.email
            };
            const response = await fetch('https://expo-app-tpo.vercel.app/api/recetas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recetaAEnviar),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                router.push('/views/cargar-receta-exito');
            } else {
                Alert.alert('Error', data.error || 'No se pudo crear la receta');
            }
        } catch (err) {
            Alert.alert('Error', 'No se pudo conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Cargar receta</Text>
            </View>
            <ScrollView contentContainerStyle={styles.bodyContainer}>
                <Text style={styles.resumenTitle}>Resumen</Text>
                <Text style={styles.nombreReceta}>{receta.nombre}</Text>
                <Text style={styles.categoriaReceta}>{receta.categoria}</Text>
                
                {/* Imagen de la receta */}
                {receta.imagen_url && (
                    <View style={styles.imagenContainer}>
                        <Image source={{ uri: receta.imagen_url }} style={styles.imagenReceta} />
                    </View>
                )}
                
                {/* Carrusel Ingredientes */}
                <Text style={styles.ingredientesTitle}>Ingredientes ({receta.ingredientes.length})</Text>
                <View style={styles.carouselContainer}>
                    <View style={styles.slideBox}>
                        <Text style={styles.ingredienteNombre}>{receta.ingredientes[slideIng]?.nombre}</Text>
                        <Text style={styles.ingredienteCantidad}>{receta.ingredientes[slideIng]?.cantidad} {receta.ingredientes[slideIng]?.unidad}</Text>
                    </View>
                    <View style={styles.carouselBelowRowFixed}>
                        {/* Flecha izquierda o espacio reservado */}
                        <View style={styles.arrowFixedBox}>
                            {slideIng > 0 ? (
                                <TouchableOpacity style={styles.arrowButton} onPress={() => setSlideIng(slideIng - 1)}>
                                    <Ionicons name="chevron-back" size={28} color="#FF7B6B" />
                                </TouchableOpacity>
                            ) : (
                                <View style={[styles.arrowButton, { opacity: 0 }]} />
                            )}
                        </View>
                        <View style={styles.dotsFixedBox}>
                            <View style={styles.dotsContainer}>
                                {receta.ingredientes.map((_, idx) => (
                                    <View key={idx} style={[styles.dot, slideIng === idx && styles.dotActive]} />
                                ))}
                            </View>
                        </View>
                        <View style={styles.arrowFixedBox}>
                            {slideIng < receta.ingredientes.length - 1 ? (
                                <TouchableOpacity style={styles.arrowButton} onPress={() => setSlideIng(slideIng + 1)}>
                                    <Ionicons name="chevron-forward" size={28} color="#FF7B6B" />
                                </TouchableOpacity>
                            ) : (
                                <View style={[styles.arrowButton, { opacity: 0 }]} />
                            )}
                        </View>
                    </View>
                </View>
                {/* Carrusel Pasos */}
                <Text style={styles.pasosTitle}>Pasos</Text>
                <View style={styles.carouselContainer}>
                    <View style={styles.slideBox}>
                        <Text style={styles.pasoNombre}>{`Paso ${slidePaso + 1}`}</Text>
                        <Text style={styles.pasoDescripcion}>{receta.pasos[slidePaso]?.descripcion || 'Sin descripción'}</Text>
                    </View>
                    <View style={styles.carouselBelowRowFixed}>
                        <View style={styles.arrowFixedBox}>
                            {slidePaso > 0 ? (
                                <TouchableOpacity style={styles.arrowButton} onPress={() => setSlidePaso(slidePaso - 1)}>
                                    <Ionicons name="chevron-back" size={28} color="#FF7B6B" />
                                </TouchableOpacity>
                            ) : (
                                <View style={[styles.arrowButton, { opacity: 0 }]} />
                            )}
                        </View>
                        <View style={styles.dotsFixedBox}>
                            <View style={styles.dotsContainer}>
                                {receta.pasos.map((_, idx) => (
                                    <View key={idx} style={[styles.dot, slidePaso === idx && styles.dotActive]} />
                                ))}
                            </View>
                        </View>
                        <View style={styles.arrowFixedBox}>
                            {slidePaso < receta.pasos.length - 1 ? (
                                <TouchableOpacity style={styles.arrowButton} onPress={() => setSlidePaso(slidePaso + 1)}>
                                    <Ionicons name="chevron-forward" size={28} color="#FF7B6B" />
                                </TouchableOpacity>
                            ) : (
                                <View style={[styles.arrowButton, { opacity: 0 }]} />
                            )}
                        </View>
                    </View>
                </View>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.outlineButton} onPress={() => router.replace('/views/cargar-receta-pasos')}>
                        <Text style={styles.outlineButtonText}>Atrás</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.outlineButton} onPress={handleSubirReceta} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#222" />
                        ) : (
                            <Text style={styles.outlineButtonText}>Subir receta</Text>
                        )}
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
    },
    bodyContainer: {
        paddingTop: 40,
        paddingBottom: 40,
        paddingHorizontal: 30,
    },
    resumenTitle: {
        fontSize: 24,
        color: 'black',
        textAlign: 'center',
        marginBottom: 24,
        fontWeight: '400',
    },
    nombreReceta: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 0,
    },
    categoriaReceta: {
        color: '#FF7B6B',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 18,
        marginLeft: 4,
    },
    ingredientesTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        marginTop: 10,
        marginBottom: 10,
    },
    carouselContainer: {
        marginBottom: 18,
        minHeight: 100,
    },
    slideBox: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 10,
        minHeight: 70,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    arrowButton: {
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: 0,
        elevation: 0,
        shadowColor: 'transparent',
        marginHorizontal: 10,
    },
    carouselBelowRowFixed: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        marginBottom: 18,
        width: '100%',
    },
    arrowFixedBox: {
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dotsFixedBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 0,
        marginHorizontal: 10,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: '#FF7B6B',
    },
    ingredienteNombre: {
        fontSize: 18,
        color: 'black',
    },
    ingredienteCantidad: {
        fontSize: 18,
        color: '#BDBDBD',
        fontWeight: 'bold',
    },
    pasosTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        marginTop: 10,
        marginBottom: 10,
    },
    pasoNombre: {
        fontSize: 18,
        color: 'black',
        marginRight: 8,
    },
    pasoDescripcion: {
        color: '#444',
        fontSize: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        marginHorizontal: 0,
    },
    outlineButton: {
        backgroundColor: 'white',
        borderColor: '#222',
        borderWidth: 2,
        borderRadius: 30,
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 40,
        marginHorizontal: 5,
    },
    outlineButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 20,
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
    imagenContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    imagenReceta: {
        width: 120,
        height: 120,
        borderRadius: 15,
        resizeMode: 'cover',
    },
}); 