import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function EditarRecetaPasosScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [pasos, setPasos] = useState<any[]>([]);
    const [receta, setReceta] = useState<any>(null);

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
        setPasos([...pasos, { descripcion: '' }]);
    };

    const handleRemovePaso = (idx: number) => {
        if (pasos.length > 1) {
            setPasos(pasos.filter((_, i) => i !== idx));
        }
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
                    <TouchableOpacity style={styles.guardarButton} onPress={handleGuardar}>
                        <Text style={styles.guardarButtonText}>Guardar pasos</Text>
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
}); 