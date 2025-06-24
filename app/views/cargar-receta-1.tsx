import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useReceta } from '../RecetaContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CargarReceta1Screen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { receta, setReceta, resetReceta } = useReceta();
    const [nombre, setNombre] = useState(receta.nombre || '');
    const [categoria, setCategoria] = useState(receta.categoria || '');
    const [descripcion, setDescripcion] = useState(receta.descripcion || '');
    const [imagenUrl, setImagenUrl] = useState(receta.imagen_url || '');
    const [tocado, setTocado] = useState(false);
    const [subiendoImagen, setSubiendoImagen] = useState(false);

    useEffect(() => {
        if (params.reset) {
            setNombre('');
            setCategoria('');
            setDescripcion('');
            setImagenUrl('');
            setTocado(false);
            resetReceta();
        }
    }, [params.reset]);

    const seleccionarImagen = async () => {
        try {
            // Pedir permisos
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (permissionResult.granted === false) {
                Alert.alert('Permisos requeridos', 'Necesitamos permisos para acceder a tus fotos');
                return;
            }

            // Seleccionar imagen
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                subirImagenABlob(result.assets[0]);
            }
        } catch (error) {
            console.error('Error al seleccionar imagen:', error);
            Alert.alert('Error', 'No se pudo seleccionar la imagen');
        }
    };

    const subirImagenABlob = async (asset: ImagePicker.ImagePickerAsset) => {
        try {
            setSubiendoImagen(true);
            
            // Convertir imagen a base64
            const base64 = await FileSystem.readAsStringAsync(asset.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            
            // Crear el formato de data URL
            const imageData = `data:image/jpeg;base64,${base64}`;
            
            // Generar nombre de archivo
            const fileName = `receta-${Date.now()}.jpg`;
            
            // Enviar al servidor
            const response = await fetch('https://expo-app-tpo.vercel.app/api/upload-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageData,
                    fileName,
                }),
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                setImagenUrl(result.url);
                Alert.alert('Éxito', 'Imagen subida correctamente');
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error al subir imagen:', error);
            Alert.alert('Error', 'No se pudo subir la imagen');
        } finally {
            setSubiendoImagen(false);
        }
    };

    const handleSiguiente = async () => {
        setTocado(true);
        if (nombre.trim() && categoria.trim() && descripcion.trim()) {
            try {
                // Obtener datos del usuario
                const usuarioStr = await AsyncStorage.getItem('usuario');
                if (!usuarioStr) {
                    Alert.alert('Error', 'No se pudo obtener la información del usuario');
                    return;
                }
                const usuario = JSON.parse(usuarioStr);

                // Verificar si ya existe una receta con el mismo nombre para este usuario
                const response = await fetch(`https://expo-app-tpo.vercel.app/api/recetas?usuario_id=${usuario.id}&nombre=${encodeURIComponent(nombre.trim())}`);
                const data = await response.json();

                if (response.ok && data.recetas && data.recetas.length > 0) {
                    const recetaExistente = data.recetas[0];
                    
                    Alert.alert(
                        'Receta duplicada', 
                        `Ya tienes una receta llamada "${nombre.trim()}". ¿Qué deseas hacer?`,
                        [
                            {
                                text: 'Cancelar',
                                style: 'cancel'
                            },
                            {
                                text: 'Editar existente',
                                onPress: () => {
                                    // Navegar a editar la receta existente
                                    router.push({
                                        pathname: '/views/editar-receta',
                                        params: { id: recetaExistente.id }
                                    });
                                }
                            },
                            {
                                text: 'Reemplazar',
                                onPress: () => {
                                    // Continuar con el flujo normal, pero guardando el ID para reemplazar
                                    setReceta(prev => ({
                                        ...prev,
                                        id: recetaExistente.id, // Guardar ID para reemplazar
                                        nombre,
                                        categoria,
                                        descripcion,
                                        imagen_url: imagenUrl,
                                    }));
                                    router.push({ pathname: '/views/cargar-receta-2', params: { reset: '1', reemplazar: 'true' } });
                                }
                            }
                        ]
                    );
                    return;
                }

                // Si no existe, proceder normalmente
                setReceta(prev => ({
                    ...prev,
                    nombre,
                    categoria,
                    descripcion,
                    imagen_url: imagenUrl,
                }));
                router.push({ pathname: '/views/cargar-receta-2', params: { reset: '1' } });
            } catch (error) {
                console.error('Error al verificar receta duplicada:', error);
                Alert.alert('Error', 'No se pudo verificar si la receta ya existe. Inténtalo de nuevo.');
            }
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Cargar receta</Text>
            </View>
            <View style={styles.bodyContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/views/mis-recetas')}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Nombre de la receta</Text>
                    <TextInput
                        style={[styles.input, tocado && !nombre.trim() && { borderColor: 'red', borderWidth: 2 }]}
                        placeholder="Nombre"
                        placeholderTextColor="#BDBDBD"
                        value={nombre}
                        onChangeText={setNombre}
                    />
                    <Text style={styles.label}>Categoría</Text>
                    <TextInput
                        style={[styles.input, tocado && !categoria.trim() && { borderColor: 'red', borderWidth: 2 }]}
                        placeholder="Categoría"
                        placeholderTextColor="#BDBDBD"
                        value={categoria}
                        onChangeText={setCategoria}
                    />
                    <Text style={styles.label}>Descripción</Text>
                    <TextInput
                        style={[styles.textarea, tocado && !descripcion.trim() && { borderColor: 'red', borderWidth: 2 }]}
                        placeholder="Descripción de la receta"
                        placeholderTextColor="#BDBDBD"
                        multiline
                        value={descripcion}
                        onChangeText={setDescripcion}
                    />
                    
                    <Text style={styles.label}>Imagen de la receta</Text>
                    <TouchableOpacity 
                        style={styles.imagenContainer} 
                        onPress={seleccionarImagen}
                        disabled={subiendoImagen}
                    >
                        {imagenUrl ? (
                            <Image source={{ uri: imagenUrl }} style={styles.imagenPreview} />
                        ) : (
                            <View style={styles.imagenPlaceholder}>
                                <Ionicons name="camera" size={32} color="#BDBDBD" />
                                <Text style={styles.imagenPlaceholderText}>
                                    {subiendoImagen ? 'Subiendo imagen...' : 'Toca para agregar imagen'}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.siguienteButton} onPress={handleSiguiente}>
                        <Text style={styles.siguienteButtonText}>Siguiente</Text>
                    </TouchableOpacity>
                </View>
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
        marginTop: 20,
        paddingHorizontal: 0,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginLeft: 30,
        marginBottom: 20,
        backgroundColor: '#222',
        borderRadius: 24,
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    formContainer: {
        marginTop: 0,
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
    imagenContainer: {
        backgroundColor: '#E5E5E5',
        borderRadius: 20,
        padding: 10,
        marginBottom: 18,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
    },
    imagenPreview: {
        width: 100,
        height: 100,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    imagenPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    imagenPlaceholderText: {
        color: '#BDBDBD',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 8,
    },
    siguienteButton: {
        backgroundColor: 'white',
        borderColor: '#222',
        borderWidth: 2,
        borderRadius: 30,
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 10,
    },
    siguienteButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 20,
    },
}); 