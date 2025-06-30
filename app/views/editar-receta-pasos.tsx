import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export default function EditarRecetaPasosScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [pasos, setPasos] = useState<any[]>([]);
    const [receta, setReceta] = useState<any>(null);
    const [subiendoArchivo, setSubiendoArchivo] = useState(false);

    useEffect(() => {
        if (params.receta) {
            try {
                const r = JSON.parse(params.receta as string);
                setReceta(r);
                setPasos(r.pasos || []);
            } catch {
                setReceta(null);
            }
        }
    }, [params.receta]);

    const handlePasoChange = (idx: number, value: string) => {
        const nuevos = [...pasos];
        nuevos[idx].descripcion = value;
        setPasos(nuevos);
    };

    const handleAddPaso = () => {
        setPasos([...pasos, { descripcion: '', medios: [] }]);
    };

    const handleRemovePaso = (idx: number) => {
        if (pasos.length > 1) {
            setPasos(pasos.filter((_, i) => i !== idx));
        }
    };

    const seleccionarArchivo = async (pasoIndex: number, tipo: 'imagen' | 'video') => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: tipo === 'imagen' ? 'images' : 'videos',
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await subirArchivo(result.assets[0].uri, pasoIndex, tipo);
            }
        } catch (error) {
            Alert.alert('Error', `No se pudo seleccionar el ${tipo}`);
        }
    };

    const subirArchivo = async (uri: string, pasoIndex: number, tipo: 'imagen' | 'video') => {
        setSubiendoArchivo(true);
        try {
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });

            const response = await fetch('https://expo-app-tpo.vercel.app/api/upload-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64,
                    filename: `paso_${receta.id}_${pasoIndex}_${Date.now()}.${tipo === 'imagen' ? 'jpg' : 'mp4'}`,
                }),
            });

            const data = await response.json();
            if (response.ok && data.url) {
                const nuevosPasos = [...pasos];
                if (!nuevosPasos[pasoIndex].medios) {
                    nuevosPasos[pasoIndex].medios = [];
                }
                nuevosPasos[pasoIndex].medios.push({
                    tipo,
                    url: data.url,
                    orden: nuevosPasos[pasoIndex].medios.length + 1
                });
                setPasos(nuevosPasos);
            } else {
                throw new Error(data.error || 'Error al subir archivo');
            }
        } catch (error) {
            console.error('Error subiendo archivo:', error);
            Alert.alert('Error', 'No se pudo subir el archivo');
        } finally {
            setSubiendoArchivo(false);
        }
    };

    const handleRemoveMedio = (pasoIndex: number, medioIndex: number) => {
        const nuevosPasos = [...pasos];
        nuevosPasos[pasoIndex].medios.splice(medioIndex, 1);
        setPasos(nuevosPasos);
    };

    const handleGuardar = () => {
        router.replace({ pathname: '/views/editar-receta', params: { receta: JSON.stringify({ ...receta, pasos }) } });
    };

    if (!receta) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>No se pudo cargar la receta.</Text></View>;

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Editar pasos</Text>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.formContainer}>
                    {pasos.map((paso, idx) => (
                        <View key={idx} style={{ marginBottom: 18 }}>
                            <Text style={styles.label}>{`Paso ${idx + 1}`}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Descripción"
                                value={paso.descripcion}
                                onChangeText={v => handlePasoChange(idx, v)}
                                multiline
                            />
                            
                            {/* Sección de medios */}
                            <View style={styles.mediosContainer}>
                                {paso.medios?.map((medio: any, medioIdx: number) => (
                                    <View key={medioIdx} style={styles.medioPreview}>
                                        {medio.tipo === 'imagen' ? (
                                            <Image source={{ uri: medio.url }} style={styles.medioImagen} />
                                        ) : (
                                            <View style={styles.videoPlaceholder}>
                                                <Ionicons name="videocam" size={24} color="#666" />
                                            </View>
                                        )}
                                        <TouchableOpacity
                                            style={styles.removeMedioButton}
                                            onPress={() => handleRemoveMedio(idx, medioIdx)}
                                        >
                                            <Ionicons name="close-circle" size={24} color="#FF7B6B" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                
                                <View style={styles.addMediaButtons}>
                                    <TouchableOpacity
                                        style={styles.addMediaButton}
                                        onPress={() => seleccionarArchivo(idx, 'imagen')}
                                        disabled={subiendoArchivo}
                                    >
                                        <Ionicons name="image" size={24} color="#666" />
                                        <Text style={styles.addMediaText}>Imagen</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.addMediaButton}
                                        onPress={() => seleccionarArchivo(idx, 'video')}
                                        disabled={subiendoArchivo}
                                    >
                                        <Ionicons name="videocam" size={24} color="#666" />
                                        <Text style={styles.addMediaText}>Video</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {pasos.length > 1 && (
                                    <TouchableOpacity style={styles.removeButton} onPress={() => handleRemovePaso(idx)}>
                                        <Ionicons name="remove" size={18} color="white" />
                                    </TouchableOpacity>
                                )}
                                {idx === pasos.length - 1 && (
                                    <TouchableOpacity style={styles.addButton} onPress={handleAddPaso}>
                                        <Ionicons name="add" size={18} color="white" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))}
                    <TouchableOpacity 
                        style={styles.guardarButton} 
                        onPress={handleGuardar}
                        disabled={subiendoArchivo}
                    >
                        <Text style={styles.guardarButtonText}>
                            {subiendoArchivo ? 'Subiendo archivo...' : 'Guardar pasos'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
        marginBottom: 8,
        color: 'black',
        minHeight: 60,
        textAlignVertical: 'top',
    },
    addButton: {
        backgroundColor: '#222',
        borderRadius: 30,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    removeButton: {
        backgroundColor: '#FF7B6B',
        borderRadius: 30,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
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
    mediosContainer: {
        marginTop: 10,
        marginBottom: 15,
    },
    medioPreview: {
        position: 'relative',
        marginBottom: 10,
    },
    medioImagen: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    videoPlaceholder: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        backgroundColor: '#E5E5E5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeMedioButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'white',
        borderRadius: 15,
    },
    addMediaButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    addMediaButton: {
        backgroundColor: '#E5E5E5',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 5,
    },
    addMediaText: {
        color: '#666',
        marginTop: 5,
    },
}); 