import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { PasoMedio } from '../RecetaContext';

interface PasoMediaManagerProps {
    medios: PasoMedio[];
    onMediosChange: (medios: PasoMedio[]) => void;
    maxMedios?: number;
}

export const PasoMediaManager: React.FC<PasoMediaManagerProps> = ({ 
    medios, 
    onMediosChange, 
    maxMedios = 5 
}) => {
    const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

    const subirMedio = async (tipo: 'imagen' | 'video', uri: string): Promise<string | null> => {
        try {
            // Convertir a base64
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            
            // Crear el formato de data URL
            const mimeType = tipo === 'imagen' ? 'image/jpeg' : 'video/mp4';
            const mediaData = `data:${mimeType};base64,${base64}`;
            
            // Generar nombre de archivo
            const extension = tipo === 'imagen' ? 'jpg' : 'mp4';
            const fileName = `paso-${tipo}-${Date.now()}.${extension}`;
            
            // Enviar al servidor
            const response = await fetch('https://expo-app-tpo.vercel.app/api/upload-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageData: mediaData,
                    fileName,
                }),
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                return result.url;
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error al subir medio:', error);
            Alert.alert('Error', `No se pudo subir ${tipo === 'imagen' ? 'la imagen' : 'el video'}`);
            return null;
        }
    };

    const seleccionarImagen = async () => {
        if (medios.length >= maxMedios) {
            Alert.alert('Límite alcanzado', `Máximo ${maxMedios} medios por paso`);
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const uploadId = `img-${Date.now()}`;
                setUploading(prev => ({ ...prev, [uploadId]: true }));

                const url = await subirMedio('imagen', result.assets[0].uri);
                
                if (url) {
                    const nuevoMedio: PasoMedio = {
                        tipo: 'imagen',
                        url,
                        orden: medios.length + 1
                    };
                    onMediosChange([...medios, nuevoMedio]);
                }

                setUploading(prev => ({ ...prev, [uploadId]: false }));
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo seleccionar la imagen');
        }
    };

    const seleccionarVideo = async () => {
        if (medios.length >= maxMedios) {
            Alert.alert('Límite alcanzado', `Máximo ${maxMedios} medios por paso`);
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const uploadId = `vid-${Date.now()}`;
                setUploading(prev => ({ ...prev, [uploadId]: true }));

                const url = await subirMedio('video', result.assets[0].uri);
                
                if (url) {
                    const nuevoMedio: PasoMedio = {
                        tipo: 'video',
                        url,
                        orden: medios.length + 1
                    };
                    onMediosChange([...medios, nuevoMedio]);
                }

                setUploading(prev => ({ ...prev, [uploadId]: false }));
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo seleccionar el video');
        }
    };

    const eliminarMedio = (index: number) => {
        Alert.alert(
            'Eliminar medio',
            '¿Estás seguro de que quieres eliminar este medio?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        const nuevosMedios = medios.filter((_, i) => i !== index);
                        // Reordenar
                        const mediosReordenados = nuevosMedios.map((medio, i) => ({
                            ...medio,
                            orden: i + 1
                        }));
                        onMediosChange(mediosReordenados);
                    }
                }
            ]
        );
    };

    const isUploading = Object.values(uploading).some(Boolean);

    return (
        <View style={styles.container}>
            {/* Botones para agregar medios */}
            <View style={styles.buttonsContainer}>
                <TouchableOpacity 
                    style={[styles.addButton, styles.imageButton]} 
                    onPress={seleccionarImagen}
                    disabled={isUploading || medios.length >= maxMedios}
                >
                    <Ionicons name="camera" size={20} color="white" />
                    <Text style={styles.buttonText}>Foto</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.addButton, styles.videoButton]} 
                    onPress={seleccionarVideo}
                    disabled={isUploading || medios.length >= maxMedios}
                >
                    <Ionicons name="videocam" size={20} color="white" />
                    <Text style={styles.buttonText}>Video</Text>
                </TouchableOpacity>
            </View>

            {/* Indicador de carga */}
            {isUploading && (
                <View style={styles.uploadingContainer}>
                    <ActivityIndicator size="small" color="#FF7B6B" />
                    <Text style={styles.uploadingText}>Subiendo...</Text>
                </View>
            )}

            {/* Lista de medios */}
            {medios.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediosContainer}>
                    {medios.map((medio, index) => (
                        <View key={index} style={styles.medioItem}>
                            {medio.tipo === 'imagen' ? (
                                <Image source={{ uri: medio.url }} style={styles.medioPreview} />
                            ) : (
                                <View style={[styles.medioPreview, styles.videoPreview]}>
                                    <Ionicons name="play-circle" size={40} color="white" />
                                    <Text style={styles.videoText}>Video</Text>
                                </View>
                            )}
                            
                            <View style={styles.medioActions}>
                                <TouchableOpacity onPress={() => eliminarMedio(index)}>
                                    <Ionicons name="close-circle" size={20} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Contador */}
            <Text style={styles.counter}>
                {medios.length}/{maxMedios} medios
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        width: '100%',
        alignSelf: 'stretch',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
        paddingHorizontal: 0,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 5,
    },
    imageButton: {
        backgroundColor: '#4CAF50',
    },
    videoButton: {
        backgroundColor: '#2196F3',
    },
    buttonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    uploadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    uploadingText: {
        color: '#FF7B6B',
        fontSize: 12,
    },
    mediosContainer: {
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    medioItem: {
        marginRight: 15,
        alignItems: 'center',
    },
    medioPreview: {
        width: 80,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    videoPreview: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#333',
    },
    videoText: {
        color: 'white',
        fontSize: 10,
        marginTop: 4,
        fontWeight: 'bold',
    },
    medioActions: {
        flexDirection: 'row',
        marginTop: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    counter: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
}); 