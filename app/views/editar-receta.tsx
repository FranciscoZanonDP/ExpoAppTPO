import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function EditarRecetaScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [receta, setReceta] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (params.receta) {
            try {
                setReceta(JSON.parse(params.receta as string));
            } catch {
                setReceta(null);
            }
        }
    }, [params.receta]);

    const handleGuardar = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://expo-app-tpo.vercel.app/api/recetas/${receta.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(receta),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                Alert.alert('Éxito', 'Receta actualizada');
                router.replace('/views/editar-mis-recetas');
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
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>No se pudo cargar la receta.</Text></View>;
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/views/editar-mis-recetas')}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar receta</Text>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
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
                    <TouchableOpacity style={styles.editButton} onPress={() => router.push({ pathname: '/views/editar-receta-ingredientes', params: { receta: JSON.stringify(receta) } })}>
                        <Text style={styles.editButtonText}>Editar ingredientes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.editButton} onPress={() => router.push({ pathname: '/views/editar-receta-pasos', params: { receta: JSON.stringify(receta) } })}>
                        <Text style={styles.editButtonText}>Editar pasos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.guardarButton} onPress={handleGuardar} disabled={loading}>
                        <Text style={styles.guardarButtonText}>{loading ? 'Guardando...' : 'Guardar cambios'}</Text>
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
        paddingVertical: 18,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        backgroundColor: 'white',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
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
}); 