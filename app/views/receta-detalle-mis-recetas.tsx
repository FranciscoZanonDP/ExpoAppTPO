import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Animated, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DEFAULT_IMAGE = "https://media.istockphoto.com/id/1409329028/es/vector/no-hay-imagen-disponible-marcador-de-posici%C3%B3n-miniatura-icono-dise%C3%B1o-de-ilustraci%C3%B3n.jpg?s=612x612&w=0&k=20&c=Bd89b8CBr-IXx9mBbTidc-wu_gtIj8Py_EMr3hGGaPw=";

export default function RecetaDetalleMisRecetasScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [receta, setReceta] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [slide, setSlide] = useState(0);
    const translateX = useRef(new Animated.Value(0)).current;

    const slides = [
        { key: 'descripcion', title: 'Descripción' },
        { key: 'ingredientes', title: 'Ingredientes' },
        { key: 'pasos', title: 'Pasos' }
    ];

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
                        try {
                            console.log('=== DEBUGGING ELIMINACIÓN ===');
                            console.log('ID de la receta a eliminar:', receta.id);
                            console.log('Tipo del ID:', typeof receta.id);
                            
                            const url = `https://expo-app-tpo.vercel.app/api/recetas?id=${receta.id}`;
                            console.log('URL de eliminación:', url);
                            
                            const response = await fetch(url, { 
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ id: receta.id })
                            });
                            
                            console.log('Status de respuesta:', response.status);
                            console.log('Response OK:', response.ok);
                            
                            const result = await response.json();
                            console.log('Resultado del servidor:', result);
                            
                            if (response.ok && result.success) {
                                Alert.alert('Éxito', 'Receta eliminada correctamente', [
                                    { text: 'OK', onPress: () => router.replace('/views/mis-recetas') }
                                ]);
                            } else {
                                console.log('Error del servidor:', result.error);
                                Alert.alert('Error', `Error del servidor: ${result.error || 'No se pudo eliminar la receta'}`);
                            }
                        } catch (error) {
                            console.error('Error al eliminar receta:', error);
                            Alert.alert('Error', `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
                        }
                    }
                }
            ]
        );
    };

    if (loading || !receta) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF7B6B" />
            </View>
        );
    }

    const renderSlideContent = (slideKey: string) => {
        switch (slideKey) {
            case 'descripcion':
                return (
                    <ScrollView style={styles.slideScrollView} showsVerticalScrollIndicator={false}>
                        <View style={styles.slideContent}>
            <Text style={styles.sectionTitle}>Descripción</Text>
                            
                            {/* Imagen de la receta */}
                            <View style={styles.imagenContainer}>
                                <Image 
                                    source={{ uri: receta.imagen_url || DEFAULT_IMAGE }} 
                                    style={styles.imagenReceta}
                                    resizeMode="cover"
                                />
                            </View>
                            
                            <View style={styles.infoContainer}>
                                <Text style={styles.categoria}>{receta.categoria || 'Sin categoría'}</Text>
                                <Text style={styles.descripcion}>
                                    {receta.descripcion || 'Sin descripción disponible.'}
                                </Text>
                                
                                {/* Estado de la receta */}
                                <View style={styles.estadoContainer}>
                                    <Text style={styles.estadoLabel}>Estado:</Text>
                                    <View style={[
                                        styles.estadoBadge, 
                                        receta.estado === 'aprobada' ? styles.estadoAprobada : styles.estadoEnRevision
                                    ]}>
                                        <Text style={styles.estadoTexto}>
                                            {receta.estado === 'aprobada' ? 'Aprobada' : 'En revisión'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                );
            
            case 'ingredientes':
                return (
                    <ScrollView style={styles.slideScrollView} showsVerticalScrollIndicator={false}>
                        <View style={styles.slideContent}>
            <Text style={styles.sectionTitle}>Ingredientes</Text>
                            <View style={styles.listContainer}>
            {receta.ingredientes && receta.ingredientes.length > 0 ? (
                receta.ingredientes.map((ing: any, idx: number) => (
                                        <View key={idx} style={styles.ingredienteCard}>
                        <Text style={styles.ingredienteNombre}>{ing.nombre}</Text>
                                            <Text style={styles.ingredienteCantidad}>
                                                {ing.cantidad} {ing.unidad}
                                            </Text>
                    </View>
                ))
            ) : (
                                    <Text style={styles.vacio}>No hay ingredientes registrados</Text>
            )}
                            </View>
                        </View>
                    </ScrollView>
                );
            
            case 'pasos':
                return (
                    <ScrollView style={styles.slideScrollView} showsVerticalScrollIndicator={false}>
                        <View style={styles.slideContent}>
            <Text style={styles.sectionTitle}>Pasos</Text>
                            <View style={styles.listContainer}>
            {receta.pasos && receta.pasos.length > 0 ? (
                receta.pasos.map((paso: any, idx: number) => (
                                        <View key={idx} style={styles.pasoCard}>
                                            <View style={styles.pasoHeader}>
                                                <View style={styles.pasoNumeroContainer}>
                                                    <Text style={styles.pasoNumero}>{idx + 1}</Text>
                                                </View>
                                                <Text style={styles.pasoTitulo}>Paso {idx + 1}</Text>
                                            </View>
                        <Text style={styles.pasoDescripcion}>{paso.descripcion}</Text>
                                            
                                            {/* Mostrar medios del paso */}
                                            {((paso.medios && paso.medios.length > 0) || paso.imagen_url) && (
                                                <View style={styles.pasoMediaContainer}>
                                                    <ScrollView 
                                                        horizontal 
                                                        showsHorizontalScrollIndicator={false}
                                                        style={styles.pasoMediaScroll}
                                                    >
                                                        {/* Mostrar medios múltiples si existen */}
                                                        {paso.medios && paso.medios.map((medio: any, medioIdx: number) => (
                                                            <View key={`medio-${medioIdx}`} style={styles.pasoMediaItem}>
                                                                {medio.tipo === 'imagen' ? (
                                                                    <Image 
                                                                        source={{ uri: medio.url }} 
                                                                        style={styles.pasoImagen}
                                                                        resizeMode="cover"
                                                                    />
                                                                ) : (
                                                                    <View style={[styles.pasoImagen, styles.pasoVideo]}>
                                                                        <Ionicons name="play-circle" size={40} color="white" />
                                                                        <Text style={styles.videoLabel}>Video</Text>
                                                                    </View>
                                                                )}
                                                            </View>
                                                        ))}
                                                        
                                                        {/* Mostrar imagen tradicional si existe */}
                                                        {paso.imagen_url && (
                                                            <View style={styles.pasoMediaItem}>
                                                                <Image 
                                                                    source={{ uri: paso.imagen_url }} 
                                                                    style={styles.pasoImagen}
                                                                    resizeMode="cover"
                                                                />
                                                            </View>
                                                        )}
                                                    </ScrollView>
                                                </View>
                                            )}
                    </View>
                ))
            ) : (
                                    <Text style={styles.vacio}>No hay pasos registrados</Text>
            )}
        </View>
                        </View>
                    </ScrollView>
                );
            
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/views/mis-recetas')}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={2}>{receta.nombre}</Text>
            </View>

            {/* Carrusel */}
            <View style={styles.carouselContainer}>
                <Animated.View style={[
                    styles.carouselContent,
                    { 
                        width: SCREEN_WIDTH * slides.length,
                        transform: [{ translateX }] 
                    }
                ]}>
                    {slides.map((slideInfo, idx) => (
                        <View key={slideInfo.key} style={styles.slide}>
                            {renderSlideContent(slideInfo.key)}
                        </View>
                    ))}
                </Animated.View>
            </View>

            {/* Controles del carrusel */}
            <View style={styles.carouselControls}>
                <TouchableOpacity 
                    style={[styles.arrowButton, slide === 0 && styles.arrowDisabled]}
                    onPress={() => slide > 0 && setSlide(slide - 1)}
                    disabled={slide === 0}
                >
                    <Ionicons name="chevron-back" size={24} color={slide === 0 ? "#ccc" : "#FF7B6B"} />
                        </TouchableOpacity>

                <View style={styles.dotsContainer}>
                    {slides.map((_, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[styles.dot, slide === idx && styles.dotActive]}
                            onPress={() => setSlide(idx)}
                        />
                    ))}
                </View>

                <TouchableOpacity 
                    style={[styles.arrowButton, slide === slides.length - 1 && styles.arrowDisabled]}
                    onPress={() => slide < slides.length - 1 && setSlide(slide + 1)}
                    disabled={slide === slides.length - 1}
                >
                    <Ionicons name="chevron-forward" size={24} color={slide === slides.length - 1 ? "#ccc" : "#FF7B6B"} />
                        </TouchableOpacity>
            </View>

            {/* Botón eliminar */}
            <TouchableOpacity style={styles.eliminarButton} onPress={handleEliminar}>
                <Ionicons name="trash-outline" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.eliminarButtonText}>Eliminar receta</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    headerContainer: {
        backgroundColor: '#333',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingTop: 60,
        paddingBottom: 30,
        alignItems: 'center',
        paddingHorizontal: 60,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: 55,
        zIndex: 10,
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
    },
    headerTitle: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 34,
    },
    carouselContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    carouselContent: {
        flexDirection: 'row',
        height: '100%',
    },
    slide: {
        width: SCREEN_WIDTH,
        flex: 1,
    },
    slideScrollView: {
        flex: 1,
        backgroundColor: 'white',
    },
    slideContent: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        minHeight: '100%',
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    imagenContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    imagenReceta: {
        width: 200,
        height: 200,
        borderRadius: 15,
    },
    infoContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 15,
        padding: 20,
    },
    categoria: {
        color: '#FF7B6B',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 12,
        textAlign: 'center',
    },
    descripcion: {
        color: '#333',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
        textAlign: 'justify',
    },
    estadoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    estadoLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginRight: 10,
    },
    estadoBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    estadoAprobada: {
        backgroundColor: '#d4edda',
    },
    estadoEnRevision: {
        backgroundColor: '#fff3cd',
    },
    estadoTexto: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    listContainer: {
        flex: 1,
    },
    ingredienteCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 4,
        borderLeftColor: '#FF7B6B',
    },
    ingredienteNombre: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    ingredienteCantidad: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF7B6B',
    },
    pasoCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#FF7B6B',
    },
    pasoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    pasoNumeroContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FF7B6B',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    pasoNumero: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    pasoTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    pasoDescripcion: {
        fontSize: 16,
        color: '#555',
        lineHeight: 22,
    },
    vacio: {
        color: '#999',
        fontSize: 16,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 40,
    },
    carouselControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    arrowButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowDisabled: {
        backgroundColor: '#f0f0f0',
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 6,
    },
    dotActive: {
        backgroundColor: '#FF7B6B',
    },
    eliminarButton: {
        backgroundColor: '#FF7B6B',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        marginHorizontal: 20,
        marginVertical: 15,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    eliminarButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    pasoMediaContainer: {
        marginTop: 12,
    },
    pasoMediaScroll: {
        marginVertical: 8,
    },
    pasoMediaItem: {
        marginRight: 12,
    },
    pasoImagen: {
        width: 160,
        height: 120,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    pasoVideo: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#333',
    },
    videoLabel: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 4,
    },
    pasoImagenSingle: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginTop: 8,
    },
}); 