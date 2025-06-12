import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useReceta } from '../RecetaContext';

export default function CargarReceta1Screen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { receta, setReceta, resetReceta } = useReceta();
    const [nombre, setNombre] = useState(receta.nombre || '');
    const [categoria, setCategoria] = useState(receta.categoria || '');
    const [descripcion, setDescripcion] = useState(receta.descripcion || '');
    const [tocado, setTocado] = useState(false);

    useEffect(() => {
        if (params.reset) {
            setNombre('');
            setCategoria('');
            setDescripcion('');
            setTocado(false);
            resetReceta();
        }
    }, [params.reset]);

    const handleSiguiente = () => {
        setTocado(true);
        if (nombre.trim() && categoria.trim() && descripcion.trim()) {
            setReceta(prev => ({
                ...prev,
                nombre,
                categoria,
                descripcion,
            }));
            router.push({ pathname: '/views/cargar-receta-2', params: { reset: '1' } });
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
                    <TouchableOpacity style={styles.siguienteButton} onPress={handleSiguiente}>
                        <Text style={styles.siguienteButtonText}>Siguiente</Text>
                    </TouchableOpacity>
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