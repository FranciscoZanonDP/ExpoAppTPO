import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useReceta } from '../RecetaContext';

export default function CargarReceta2Screen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { receta, setReceta } = useReceta();
    const [ingrediente, setIngrediente] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [unidad, setUnidad] = useState('');
    const [showDropdown, setShowDropdown] = useState<null | number>(null);
    const [ingredientes, setIngredientes] = useState<{ nombre: string; cantidad: string; unidad: string; }[]>(receta.ingredientes.length ? receta.ingredientes : [{ nombre: '', cantidad: '', unidad: '' }]);
    const [tocado, setTocado] = useState(false);
    const [errores, setErrores] = useState<{ nombre: boolean; cantidad: boolean; unidad: boolean }[]>([{ nombre: false, cantidad: false, unidad: false }]);

    const handleAddIngrediente = () => {
        setIngredientes([...ingredientes, { nombre: '', cantidad: '', unidad: '' }]);
    };

    const handleIngredienteChange = (idx: number, field: 'nombre' | 'cantidad' | 'unidad', value: string) => {
        const nuevos = [...ingredientes];
        nuevos[idx][field] = value;
        setIngredientes(nuevos);
    };

    const handleRemoveIngrediente = (idx: number) => {
        if (ingredientes.length > 1) {
            setIngredientes(ingredientes.filter((_, i) => i !== idx));
        }
    };

    const handleSiguiente = () => {
        setTocado(true);
        const nuevosErrores = ingredientes.map(ing => ({
            nombre: !ing.nombre.trim(),
            cantidad: !ing.cantidad.trim(),
            unidad: !ing.unidad.trim(),
        }));
        setErrores(nuevosErrores);
        const hayError = nuevosErrores.some(e => e.nombre || e.cantidad || e.unidad);
        if (!hayError) {
            setReceta(prev => ({
                ...prev,
                ingredientes,
            }));
            router.push({ pathname: '/views/cargar-receta-pasos', params: { reset: '1' } });
        }
    };

    useEffect(() => {
        if (params.reset) {
            setIngrediente('');
            setCantidad('');
            setUnidad('');
            setShowDropdown(null);
        }
    }, [params.reset]);

    const smallCircleButton = {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
        marginLeft: 6,
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Cargar receta</Text>
            </View>
            <View style={styles.bodyContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/views/cargar-receta-1')}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.formContainer}>
                    <Text style={styles.porcionText}>Poner cantidades para 1 porción de la receta</Text>
                    <ScrollView style={{ maxHeight: 300 }}>
                        {ingredientes.map((ing, idx) => (
                            <View key={idx} style={{ marginBottom: 18 }}>
                                <Text style={styles.label}>Ingrediente</Text>
                                <TextInput
                                    style={[styles.input, tocado && errores[idx]?.nombre && { borderColor: 'red', borderWidth: 2 }]}
                                    placeholder="Nombre"
                                    placeholderTextColor="#BDBDBD"
                                    value={ing.nombre}
                                    onChangeText={v => handleIngredienteChange(idx, 'nombre', v)}
                                />
                                <Text style={styles.label}>Cantidad</Text>
                                <View style={styles.cantidadRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginRight: 8 }, tocado && errores[idx]?.cantidad && { borderColor: 'red', borderWidth: 2 }]}
                                        placeholder="0..."
                                        placeholderTextColor="#BDBDBD"
                                        keyboardType="numeric"
                                        value={ing.cantidad}
                                        onChangeText={v => handleIngredienteChange(idx, 'cantidad', v)}
                                    />
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginRight: 8 }, tocado && errores[idx]?.unidad && { borderColor: 'red', borderWidth: 2 }]}
                                        placeholder="Tazas, Kg, ..."
                                        placeholderTextColor="#BDBDBD"
                                        value={ing.unidad}
                                        onChangeText={v => handleIngredienteChange(idx, 'unidad', v)}
                                    />
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {ingredientes.length > 1 && (
                                            <TouchableOpacity style={[smallCircleButton, { backgroundColor: '#FF7B6B' }]} onPress={() => handleRemoveIngrediente(idx)}>
                                                <Ionicons name="remove" size={18} color="white" />
                                            </TouchableOpacity>
                                        )}
                                        {idx === ingredientes.length - 1 && (
                                            <TouchableOpacity style={[smallCircleButton, { backgroundColor: '#222' }]} onPress={handleAddIngrediente}>
                                                <Ionicons name="add" size={18} color="white" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                    <Text style={styles.label}>Imágen (opcional)</Text>
                    <TouchableOpacity style={styles.imagePicker}>
                        <Ionicons name="image" size={40} color="#222" />
                    </TouchableOpacity>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.outlineButton} onPress={() => router.replace('/views/cargar-receta-1')}>
                            <Text style={styles.outlineButtonText}>Atrás</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.outlineButton} onPress={handleSiguiente}>
                            <Text style={styles.outlineButtonText}>Siguiente</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    formContainer: {
        marginTop: 30,
        paddingHorizontal: 30,
    },
    porcionText: {
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
        marginBottom: 18,
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
    cantidadRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
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
    imagePicker: {
        backgroundColor: '#E5E5E5',
        borderRadius: 10,
        width: 70,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
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