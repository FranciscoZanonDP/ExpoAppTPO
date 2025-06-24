import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useReceta } from '../RecetaContext';

export default function CargarReceta2Screen() {
    const router = useRouter();
    const { receta, setReceta } = useReceta();
    
    const [ingredientes, setIngredientes] = useState(receta.ingredientes || []);
    const [nombre, setNombre] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [unidad, setUnidad] = useState('');

    const [editIndex, setEditIndex] = useState(-1);
    const [editNombre, setEditNombre] = useState('');
    const [editCantidad, setEditCantidad] = useState('');
    const [editUnidad, setEditUnidad] = useState('');

    useEffect(() => {
        if (!receta.ingredientes || receta.ingredientes.length === 0) {
            setIngredientes([]);
        }
    }, [receta.ingredientes]);

    const handleAddIngrediente = () => {
        if (nombre.trim() && cantidad.trim() && unidad.trim()) {
            setIngredientes([...ingredientes, { nombre: nombre.trim(), cantidad: cantidad.trim(), unidad: unidad.trim() }]);
            setNombre('');
            setCantidad('');
            setUnidad('');
        }
    };

    const handleRemoveIngrediente = (index: number) => {
        const nuevosIngredientes = [...ingredientes];
        nuevosIngredientes.splice(index, 1);
        setIngredientes(nuevosIngredientes);
    };

    const handleMoveIngrediente = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === ingredientes.length - 1)) {
            return;
        }
        const nuevosIngredientes = [...ingredientes];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [nuevosIngredientes[index], nuevosIngredientes[newIndex]] = [nuevosIngredientes[newIndex], nuevosIngredientes[index]];
        setIngredientes(nuevosIngredientes);
    };
    
    const handleStartEdit = (index: number) => {
        setEditIndex(index);
        const ing = ingredientes[index];
        setEditNombre(ing.nombre);
        setEditCantidad(ing.cantidad);
        setEditUnidad(ing.unidad);
    };

    const handleEndEdit = () => {
        if (editNombre.trim() && editCantidad.trim() && editUnidad.trim()) {
            const nuevosIngredientes = [...ingredientes];
            nuevosIngredientes[editIndex] = {
                nombre: editNombre.trim(),
                cantidad: editCantidad.trim(),
                unidad: editUnidad.trim()
            };
            setIngredientes(nuevosIngredientes);
        }
        setEditIndex(-1);
    };

    const handleSiguiente = () => {
        setReceta(prev => ({
            ...prev,
            ingredientes,
        }));
        router.push({ pathname: '/views/cargar-receta-pasos', params: { reset: '1' } });
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'white' }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
             <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Cargar receta</Text>
            </View>
             <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/views/cargar-receta-1')}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Ingredientes</Text>
                <Text style={styles.subtitle}>Agrega y organiza los ingredientes de tu receta</Text>

                <View style={styles.addIngredientContainer}>
                    <TextInput
                        style={styles.inputNombre}
                        placeholder="Ingrediente"
                        value={nombre}
                        onChangeText={setNombre}
                    />
                    <TextInput
                        style={styles.inputCantidad}
                        placeholder="Cant"
                        value={cantidad}
                        onChangeText={setCantidad}
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.inputUnidad}
                        placeholder="Unidad"
                        value={unidad}
                        onChangeText={setUnidad}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleAddIngrediente}>
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {ingredientes.map((ing, index) => (
                    <View key={index} style={styles.ingredientContainer}>
                         {editIndex === index ? (
                            <View style={styles.editView}>
                                <TextInput style={styles.editInput} value={editNombre} onChangeText={setEditNombre} placeholder="Nombre"/>
                                <TextInput style={[styles.editInput, {flex: 0.5}]} value={editCantidad} onChangeText={setEditCantidad} placeholder="Cant." keyboardType="numeric"/>
                                <TextInput style={[styles.editInput, {flex: 0.5}]} value={editUnidad} onChangeText={setEditUnidad} placeholder="Unidad"/>
                                <TouchableOpacity onPress={handleEndEdit}>
                                    <Ionicons name="checkmark" size={24} color="green" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <View style={styles.ingredientInfo}>
                                    <Text style={styles.ingredientName}>{ing.nombre}</Text>
                                    <Text style={styles.ingredientQuantity}>{ing.cantidad} {ing.unidad}</Text>
                                </View>
                                <View style={styles.ingredientActions}>
                                    <TouchableOpacity onPress={() => handleMoveIngrediente(index, 'up')}>
                                        <Ionicons name="arrow-up" size={22} color="#888" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleMoveIngrediente(index, 'down')}>
                                        <Ionicons name="arrow-down" size={22} color="#888" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleStartEdit(index)}>
                                        <Ionicons name="pencil" size={18} color="#007BFF" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleRemoveIngrediente(index)}>
                                        <Ionicons name="close" size={22} color="#FF3B30" />
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                ))}
                
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryText}>Tu receta tiene {ingredientes.length} {ingredientes.length === 1 ? 'ingrediente' : 'ingredientes'}</Text>
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.outlineButton} onPress={() => router.replace('/views/cargar-receta-1')}>
                        <Text style={styles.outlineButtonText}>Atrás</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.outlineButton, { opacity: ingredientes.length < 1 ? 0.5 : 1 }]} onPress={handleSiguiente} disabled={ingredientes.length < 1}>
                        <Text style={styles.outlineButtonText}>Siguiente</Text>
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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
        paddingBottom: 100,
    },
    headerContainer: {
        backgroundColor: '#333',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingTop: 60,
        paddingBottom: 20,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: -60,
        left: 20,
        backgroundColor: '#222',
        borderRadius: 24,
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    addIngredientContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    inputNombre: {
        flex: 3,
        borderWidth: 1,
        borderColor: 'transparent',
        borderRightColor: '#ddd',
        borderRadius: 0,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: 'transparent',
    },
    inputCantidad: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'transparent',
        borderRightColor: '#ddd',
        borderRadius: 0,
        paddingHorizontal: 10,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
    inputUnidad: {
        flex: 1.5,
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: 0,
        paddingHorizontal: 10,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
    addButton: {
        backgroundColor: '#FF7B6B',
        borderRadius: 8,
        padding: 10,
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    ingredientContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    ingredientInfo: {
        flex: 1,
    },
    ingredientName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    ingredientQuantity: {
        fontSize: 14,
        color: '#666',
    },
    ingredientActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    editView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    editInput: {
        flex: 1,
        borderBottomWidth: 1,
        borderColor: '#007BFF',
        fontSize: 16,
        padding: 5,
    },
    summaryContainer: {
        marginTop: 20,
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
    },
    summaryText: {
        color: '#388E3C',
        fontSize: 16,
        fontWeight: '500',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 30,
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
        fontSize: 18,
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
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});