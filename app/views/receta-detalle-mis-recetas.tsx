import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function RecetaDetalleMisRecetasScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [receta, setReceta] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [slide, setSlide] = useState(0);
    const slides = ['Descripción', 'Ingredientes', 'Pasos'];
    const translateX = new Animated.Value(-slide * SCREEN_WIDTH);

    useEffect(() => {
        const fetchReceta = async () => {
            setLoading(true);
            const res = await fetch(`https://expo-app-tpo.vercel.app/api/recetas?id=${params.id}`);
            const data = await res.json();
            setReceta(data);
            setLoading(false);
        };
        if (params.id) fetchReceta();
    }, [params.id]);

    useEffect(() => {
        Animated.spring(translateX, {
            toValue: -slide * SCREEN_WIDTH,
            useNativeDriver: true,
        }).start();
    }, [slide]);

    const handleEliminar = () => {
        Alert.alert(
            'Eliminar receta',
            '¿Estás seguro de que deseas eliminar esta receta? Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar', style: 'destructive', onPress: async () => {
                        await fetch(`https://expo-app-tpo.vercel.app/api/recetas/${receta.id}`, { method: 'DELETE' });
                        router.replace('/views/mis-recetas');
                    }
                }
            ]
        );
    };

    if (loading || !receta) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}><ActivityIndicator size="large" color="#FF7B6B" /></View>;
    }

    // Slides content
    const slideContent = [
        // Descripción
        <View key="desc" style={styles.slideContent}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.categoria}>{receta.categoria ? receta.categoria : 'Sin categoría'}</Text>
            <Text style={styles.descripcion}>{receta.descripcion}</Text>
            {/* DEBUG: Mostrar el objeto receta en texto plano para depuración */}
            {/* <Text style={{ color: 'red', fontSize: 10 }}>{JSON.stringify(receta, null, 2)}</Text> */}
        </View>,
        // Ingredientes
        <View key="ing" style={styles.slideContent}>
            <Text style={styles.sectionTitle}>Ingredientes</Text>
            {receta.ingredientes && receta.ingredientes.length > 0 ? (
                receta.ingredientes.map((ing: any, idx: number) => (
                    <View key={idx} style={styles.ingredienteRow}>
                        <Text style={styles.ingredienteNombre}>{ing.nombre}</Text>
                        <Text style={styles.ingredienteCantidad}>{ing.cantidad} {ing.unidad}</Text>
                    </View>
                ))
            ) : (
                <Text style={styles.vacio}>Sin ingredientes</Text>
            )}
        </View>,
        // Pasos
        <View key="pasos" style={styles.slideContent}>
            <Text style={styles.sectionTitle}>Pasos</Text>
            {receta.pasos && receta.pasos.length > 0 ? (
                receta.pasos.map((paso: any, idx: number) => (
                    <View key={idx} style={styles.pasoRow}>
                        <Text style={styles.pasoNumero}>Paso {idx + 1}</Text>
                        <Text style={styles.pasoDescripcion}>{paso.descripcion}</Text>
                    </View>
                ))
            ) : (
                <Text style={styles.vacio}>Sin pasos</Text>
            )}
        </View>
    ];

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/views/mis-recetas')}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{receta.nombre}</Text>
            </View>
            <View style={styles.carouselContainer}>
                {/* Carrusel */}
                <Animated.View style={{ flexDirection: 'row', width: SCREEN_WIDTH * slides.length, transform: [{ translateX }] }}>
                    {slideContent.map((content, idx) => (
                        <View key={idx} style={{ width: SCREEN_WIDTH, paddingHorizontal: 0 }}>{content}</View>
                    ))}
                </Animated.View>
            </View>
            {/* Flechas y puntos debajo del carrusel, alineados */}
            <View style={styles.carouselBelowRowFixed}>
                {/* Flecha izquierda (siempre ocupa espacio) */}
                <View style={styles.arrowFixedBox}>
                    {slide > 0 ? (
                        <TouchableOpacity style={styles.arrowButton} onPress={() => setSlide(slide - 1)}>
                            <Ionicons name="chevron-back" size={32} color="#FF7B6B" />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.arrowButton} />
                    )}
                </View>
                {/* Dots */}
                <View style={styles.dotsContainer}>
                    {slides.map((_, idx) => (
                        <View key={idx} style={[styles.dot, slide === idx && styles.dotActive]} />
                    ))}
                </View>
                {/* Flecha derecha (siempre ocupa espacio) */}
                <View style={styles.arrowFixedBox}>
                    {slide < slides.length - 1 ? (
                        <TouchableOpacity style={styles.arrowButton} onPress={() => setSlide(slide + 1)}>
                            <Ionicons name="chevron-forward" size={32} color="#FF7B6B" />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.arrowButton} />
                    )}
                </View>
            </View>
            <TouchableOpacity style={styles.eliminarButton} onPress={handleEliminar}>
                <Text style={styles.eliminarButtonText}>Eliminar receta</Text>
            </TouchableOpacity>
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
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 10,
        top: 50,
        zIndex: 10,
        padding: 8,
    },
    headerTitle: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    carouselContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 10,
        minHeight: 320,
    },
    carouselBelowRowFixed: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        marginBottom: 18,
        gap: 24,
    },
    arrowFixedBox: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowButton: {
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: 0,
        elevation: 0,
        shadowColor: 'transparent',
        marginHorizontal: 2,
    },
    slideContent: {
        width: SCREEN_WIDTH,
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingHorizontal: 30,
        minHeight: 320,
    },
    categoria: {
        color: '#FF7B6B',
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: 20,
    },
    descripcion: {
        color: '#333',
        fontSize: 16,
        marginTop: 10,
        marginBottom: 20,
    },
    descripcionVacia: {
        color: '#999',
        fontSize: 16,
        marginTop: 10,
        fontStyle: 'italic',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        marginTop: 10,
        marginBottom: 10,
    },
    ingredienteRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        width: '100%',
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
    pasoRow: {
        marginBottom: 16,
        width: '100%',
    },
    pasoNumero: {
        fontWeight: 'bold',
        color: '#FF7B6B',
        fontSize: 18,
    },
    pasoDescripcion: {
        color: '#333',
        fontSize: 16,
        marginLeft: 10,
        marginTop: 2,
    },
    vacio: {
        color: '#999',
        fontSize: 16,
        marginBottom: 10,
    },
    eliminarButton: {
        backgroundColor: '#FF7B6B',
        borderRadius: 30,
        alignItems: 'center',
        paddingVertical: 14,
        margin: 30,
    },
    eliminarButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
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
}); 