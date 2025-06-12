import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function EditarRecetaIngredientesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [ingredientes, setIngredientes] = useState<any[]>([]);
    const [receta, setReceta] = useState<any>(null);

    useEffect(() => {
        if (params.receta) {
            try {
                const r = JSON.parse(params.receta as string);
                setReceta(r);
                setIngredientes(r.ingredientes || []);
            } catch {
                setReceta(null);
            }
        }
    }, [params.receta]);

    const handleIngredienteChange = (idx: number, field: string, value: string) => {
        const nuevos = [...ingredientes];
        nuevos[idx][field] = value;
        setIngredientes(nuevos);
    };

    const handleAddIngrediente = () => {
        setIngredientes([...ingredientes, { nombre: '', cantidad: '', unidad: '' }]);
    };

    const handleRemoveIngrediente = (idx: number) => {
        if (ingredientes.length > 1) {
            setIngredientes(ingredientes.filter((_, i) => i !== idx));
        }
    };

    const handleGuardar = () => {
        router.replace({ pathname: '/views/editar-receta', params: { receta: JSON.stringify({ ...receta, ingredientes }) } });
    };

    if (!receta) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>No se pudo cargar la receta.</Text></View>;

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Editar ingredientes</Text>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.formContainer}>
                    {ingredientes.map((ing, idx) => (
                        <View key={idx} style={{ marginBottom: 18 }}>
                            <Text style={styles.label}>Ingrediente</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre"
                                value={ing.nombre}
                                onChangeText={v => handleIngredienteChange(idx, 'nombre', v)}
                            />
                            <Text style={styles.label}>Cantidad</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Cantidad"
                                value={ing.cantidad}
                                onChangeText={v => handleIngredienteChange(idx, 'cantidad', v)}
                            />
                            <Text style={styles.label}>Unidad</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Unidad"
                                value={ing.unidad}
                                onChangeText={v => handleIngredienteChange(idx, 'unidad', v)}
                            />
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {ingredientes.length > 1 && (
                                    <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveIngrediente(idx)}>
                                        <Ionicons name="remove" size={18} color="white" />
                                    </TouchableOpacity>
                                )}
                                {idx === ingredientes.length - 1 && (
                                    <TouchableOpacity style={styles.addButton} onPress={handleAddIngrediente}>
                                        <Ionicons name="add" size={18} color="white" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.guardarButton} onPress={handleGuardar}>
                        <Text style={styles.guardarButtonText}>Guardar ingredientes</Text>
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