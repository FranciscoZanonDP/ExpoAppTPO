import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export default function EditarRecetaScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [receta, setReceta] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [nuevaImagen, setNuevaImagen] = useState<string | null>(null);
    const [subiendoImagen, setSubiendoImagen] = useState(false);

    useEffect(() => {
        const cargarReceta = async () => {
            if (params.receta) {
                // Si se pasa la receta completa como parámetro
                try {
                    setReceta(JSON.parse(params.receta as string));
                } catch {
                    setReceta(null);
                }
            } else if (params.id) {
                // Si solo se pasa el ID, cargar la receta completa desde la API
                try {
                    setLoading(true);
                    const response = await fetch(`https://expo-app-tpo.vercel.app/api/recetas?id=${params.id}`);
                    const data = await response.json();
                    
                    if (response.ok && data.id) {
                        setReceta(data);
                    } else {
                        Alert.alert('Error', 'No se pudo cargar la receta');
                        setReceta(null);
                    }
                } catch (error) {
                    console.error('Error cargando receta:', error);
                    Alert.alert('Error', 'No se pudo conectar con el servidor');
                    setReceta(null);
                } finally {
                    setLoading(false);
                }
            }
        };

        cargarReceta();
    }, [params.receta, params.id]);

    const seleccionarImagen = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setNuevaImagen(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo seleccionar la imagen');
        }
    };

    const subirImagen = async () => {
        if (!nuevaImagen) return null;

        setSubiendoImagen(true);
        try {
            // Convertir imagen a base64
            const base64 = await FileSystem.readAsStringAsync(nuevaImagen, {
                encoding: 'base64',
            });

            const response = await fetch('https://expo-app-tpo.vercel.app/api/upload-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64,
                    filename: `receta_${receta.id}_${Date.now()}.jpg`,
                }),
            });

            const data = await response.json();
            if (response.ok && data.url) {
                return data.url;
            } else {
                throw new Error(data.error || 'Error al subir imagen');
            }
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            Alert.alert('Error', 'No se pudo subir la imagen');
            return null;
        } finally {
            setSubiendoImagen(false);
        }
    };

    const handleGuardar = async () => {
        setLoading(true);
        try {
            let imagenUrl = receta.imagen_url;

            // Si hay una nueva imagen, subirla primero
            if (nuevaImagen) {
                const urlSubida = await subirImagen();
                if (urlSubida) {
                    imagenUrl = urlSubida;
                } else {
                    // Si falló la subida de imagen, no continuar
                    setLoading(false);
                    return;
                }
            }

            // Actualizar receta con la nueva URL de imagen
            const recetaActualizada = {
                ...receta,
                imagen_url: imagenUrl
            };

            const response = await fetch(`https://expo-app-tpo.vercel.app/api/recetas/${receta.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recetaActualizada),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                Alert.alert('Éxito', 'Receta actualizada correctamente', [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (params.id) {
                                // Si vino desde cargar-receta-1, regresar allí
                                router.replace('/views/cargar-receta-1');
                            } else {
                                // Si vino desde editar-mis-recetas, regresar allí
                                router.replace('/views/editar-mis-recetas');
                            }
                        }
                    }
                ]);
            } else {
                Alert.alert('Error', data.error || 'No se pudo actualizar la receta');
            }
        } catch (err) {
            Alert.alert('Error', 'No se pudo conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    if (!receta) {
        if (loading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <ActivityIndicator size="large" color="#FF7B6B" />
                    <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>Cargando receta...</Text>
                </View>
            );
        }
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <Text style={{ fontSize: 16, color: '#666' }}>No se pudo cargar la receta.</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => {
                    // Si vino desde cargar-receta-1 (cuando se pasa ID), regresar allí
                    if (params.id) {
                        router.replace('/views/cargar-receta-1');
                    } else {
                        // Si vino desde editar-mis-recetas (cuando se pasa receta completa), regresar allí
                        router.replace('/views/editar-mis-recetas');
                    }
                }}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar receta</Text>
            </View>
            <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Nombre de la receta</Text>
                    <TextInput
                        style={styles.input}
                        value={receta.nombre}
                        onChangeText={v => setReceta((r: any) => ({ ...r, nombre: v }))}
                    />
                    <Text style={styles.label}>Categoría</Text>
                    <TextInput
                        style={styles.input}
                        value={receta.categoria}
                        onChangeText={v => setReceta((r: any) => ({ ...r, categoria: v }))}
                    />
                    <Text style={styles.label}>Descripción</Text>
                    <TextInput
                        style={styles.textarea}
                        value={receta.descripcion}
                        onChangeText={v => setReceta((r: any) => ({ ...r, descripcion: v }))}
                        multiline
                    />
                    
                    {/* Sección de imagen */}
                    <Text style={styles.label}>Imagen de la receta</Text>
                    <View style={styles.imagenContainer}>
                        {(nuevaImagen || receta.imagen_url) ? (
                            <View style={styles.imagenPreview}>
                                <Image 
                                    source={{ uri: nuevaImagen || receta.imagen_url }} 
                                    style={styles.imagenReceta}
                                />
                                <TouchableOpacity 
                                    style={styles.cambiarImagenBtn}
                                    onPress={seleccionarImagen}
                                    disabled={subiendoImagen}
                                >
                                    <Ionicons name="camera" size={20} color="white" />
                                    <Text style={styles.cambiarImagenText}>
                                        {nuevaImagen ? 'Cambiar imagen' : 'Cambiar imagen'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity 
                                style={styles.seleccionarImagenBtn}
                                onPress={seleccionarImagen}
                                disabled={subiendoImagen}
                            >
                                <Ionicons name="camera-outline" size={40} color="#FF7B6B" />
                                <Text style={styles.seleccionarImagenText}>
                                    {subiendoImagen ? 'Subiendo...' : 'Agregar imagen'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity style={styles.editButton} onPress={() => router.push({ pathname: '/views/editar-receta-ingredientes', params: { receta: JSON.stringify(receta) } })}>
                        <Text style={styles.editButtonText}>Editar ingredientes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.editButton} onPress={() => router.push({ pathname: '/views/editar-receta-pasos', params: { receta: JSON.stringify(receta) } })}>
                        <Text style={styles.editButtonText}>Editar pasos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.guardarButton, { marginBottom: 30 }]} onPress={handleGuardar} disabled={loading || subiendoImagen}>
                        <Text style={styles.guardarButtonText}>
                            {loading ? 'Guardando...' : subiendoImagen ? 'Subiendo imagen...' : 'Guardar cambios'}
                        </Text>
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
    formContainer: {
        marginTop: 30,
        paddingHorizontal: 30,
    },
    label: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 8,
        color: 'black',
    },
    input: {
        backgroundColor: '#E5E5E5',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 18,
        color: 'black',
    },
    textarea: {
        backgroundColor: '#E5E5E5',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 18,
        fontSize: 16,
        marginBottom: 30,
        color: 'black',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    guardarButton: {
        backgroundColor: '#FF7B6B',
        borderRadius: 30,
        alignItems: 'center',
        paddingVertical: 14,
        marginTop: 10,
    },
    guardarButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 15,
        paddingBottom: 25,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        backgroundColor: 'white',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    editButton: {
        backgroundColor: '#E5E5E5',
        borderRadius: 20,
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 10,
    },
    editButtonText: {
        color: '#FF7B6B',
        fontWeight: 'bold',
        fontSize: 16,
    },
    backButton: {
        position: 'absolute',
        left: 10,
        top: 50,
        zIndex: 10,
        padding: 8,
    },
    imagenContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    imagenPreview: {
        position: 'relative',
        alignItems: 'center',
    },
    imagenReceta: {
        width: 200,
        height: 150,
        borderRadius: 15,
        marginBottom: 10,
    },
    cambiarImagenBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF7B6B',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        gap: 5,
    },
    cambiarImagenText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    seleccionarImagenBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#FF7B6B',
        borderStyle: 'dashed',
        paddingVertical: 30,
        paddingHorizontal: 40,
        minHeight: 120,
    },
    seleccionarImagenText: {
        color: '#FF7B6B',
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 8,
    },
}); 