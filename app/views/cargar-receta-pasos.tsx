import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useReceta } from '../RecetaContext';

export default function CargarRecetaPasosScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { receta, setReceta } = useReceta();
    const [pasos, setPasos] = useState(receta.pasos.length ? receta.pasos : [
        { descripcion: '', imagen: null, video: null }
    ]);

    useEffect(() => {
        if (params.reset) {
            setPasos([{ descripcion: '', imagen: null, video: null }]);
        }
    }, [params.reset]);

    const handleSiguiente = () => {
        setReceta(prev => ({
            ...prev,
            pasos,
        }));
        router.push({ pathname: '/views/cargar-receta-resumen', params: { reset: '1' } });
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Cargar receta</Text>
            </View>
            <View style={[styles.bodyContainer, { flex: 1 }]}>
                <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/views/cargar-receta-2')}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.pasosTitle}>Pasos (Mínimo 2)</Text>
                    {pasos.map((paso, idx) => (
                        <View key={idx}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.label}>{`Paso ${idx + 1}`}</Text>
                                {idx > 0 && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            const nuevosPasos = pasos.filter((_, i) => i !== idx);
                                            setPasos(nuevosPasos);
                                        }}
                                        style={{ marginLeft: 10 }}
                                    >
                                        <Ionicons name="trash" size={22} color="#FF7B6B" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TextInput
                                style={styles.textarea}
                                placeholder="Descripción"
                                placeholderTextColor="#BDBDBD"
                                multiline
                                value={paso.descripcion}
                                onChangeText={text => {
                                    const nuevosPasos = [...pasos];
                                    nuevosPasos[idx].descripcion = text;
                                    setPasos(nuevosPasos);
                                }}
                            />
                            <View style={styles.mediaRow}>
                                <View style={styles.mediaCol}>
                                    <Text style={styles.mediaLabel}>Imágen (opcional)</Text>
                                    <TouchableOpacity style={styles.mediaIcon}>
                                        <Ionicons name="image" size={40} color="#222" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.mediaCol}>
                                    <Text style={styles.mediaLabel}>Video (opcional)</Text>
                                    <TouchableOpacity style={styles.mediaIcon}>
                                        <Ionicons name="logo-youtube" size={40} color="#222" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))}
                    <TouchableOpacity
                        style={styles.addStepButton}
                        onPress={() => setPasos([...pasos, { descripcion: '', imagen: null, video: null }])}
                    >
                        <Text style={styles.addStepText}>Agregar paso</Text>
                    </TouchableOpacity>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.outlineButton} onPress={() => router.replace('/views/cargar-receta-2')}>
                            <Text style={styles.outlineButtonText}>Atrás</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.outlineButton} onPress={handleSiguiente}>
                            <Text style={styles.outlineButtonText}>Siguiente</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
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
        marginTop: 40,
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
    pasosTitle: {
        fontSize: 20,
        color: 'black',
        textAlign: 'center',
        marginBottom: 24,
        fontWeight: '500',
    },
    label: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 8,
        color: 'black',
        marginLeft: 30,
    },
    textarea: {
        backgroundColor: '#E5E5E5',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 18,
        fontSize: 16,
        marginBottom: 20,
        color: 'black',
        minHeight: 100,
        textAlignVertical: 'top',
        marginHorizontal: 30,
    },
    mediaRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 10,
    },
    mediaCol: {
        alignItems: 'center',
    },
    mediaLabel: {
        fontSize: 16,
        color: 'black',
        marginBottom: 6,
    },
    mediaIcon: {
        backgroundColor: '#E5E5E5',
        borderRadius: 10,
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addStepButton: {
        alignSelf: 'center',
        marginVertical: 18,
    },
    addStepText: {
        color: 'black',
        fontWeight: '500',
        fontSize: 18,
        textDecorationLine: 'underline',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginHorizontal: 30,
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
}); 