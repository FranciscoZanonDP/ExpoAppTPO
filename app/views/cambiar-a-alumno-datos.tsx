import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function CambiarAlumnoDatosScreen() {
    const [nombre, setNombre] = useState('');
    const [imagenFrontal, setImagenFrontal] = useState<string | null>(null);
    const [imagenTrasera, setImagenTrasera] = useState<string | null>(null);
    const router = useRouter();

    const pickImage = async (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleConfirmar = async () => {
        try {
            if (!nombre.trim()) {
                alert('Por favor ingresa tu nombre');
                return;
            }
            if (!imagenFrontal || !imagenTrasera) {
                alert('Por favor selecciona ambas imágenes del DNI');
                return;
            }

            const usuarioStr = await AsyncStorage.getItem('usuario');
            if (!usuarioStr) {
                alert('No hay usuario logueado');
                return;
            }
            const usuario = JSON.parse(usuarioStr);
            const response = await fetch('https://expo-app-tpo.vercel.app/api/cambiar-a-alumno', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: usuario.email,
                    nombre: nombre,
                    imagenFrontal: imagenFrontal,
                    imagenTrasera: imagenTrasera
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                alert('Error: ' + data.error);
                return;
            }
            // Actualizar el usuario en AsyncStorage
            const usuarioActualizado = { ...usuario, userType: 'Alumno', nombre: nombre };
            await AsyncStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
            alert('¡Ahora eres Alumno!');
            router.replace('/views/home');
        } catch (error) {
            alert('Error: ' + String(error));
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={styles.header}>
                <ThemedText style={styles.headerText}>Cambiar a alumno</ThemedText>
            </View>
            <View style={styles.formContainer}>
                <ThemedText style={styles.labelRed}>Nombre</ThemedText>
                <View style={styles.inputRow}>
                    <Ionicons name="person-outline" size={22} color="#FF7B6B" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.input}
                        value={nombre}
                        onChangeText={setNombre}
                        placeholder="Ingresa tu nombre completo"
                        autoCapitalize="words"
                        multiline={false}
                    />
                </View>
                <View style={styles.line} />
                
                <ThemedText style={styles.labelRed}>Imagen Frontal del DNI</ThemedText>
                <TouchableOpacity 
                    style={[styles.imageBox, imagenFrontal && styles.imageBoxWithImage]} 
                    onPress={() => pickImage(setImagenFrontal)}
                >
                    {imagenFrontal ? (
                        <Image source={{ uri: imagenFrontal }} style={styles.selectedImage} />
                    ) : (
                        <Ionicons name="image-outline" size={40} color="#FF7B6B" />
                    )}
                </TouchableOpacity>

                <ThemedText style={styles.labelRed}>Imagen Trasera del DNI</ThemedText>
                <TouchableOpacity 
                    style={[styles.imageBox, imagenTrasera && styles.imageBoxWithImage]} 
                    onPress={() => pickImage(setImagenTrasera)}
                >
                    {imagenTrasera ? (
                        <Image source={{ uri: imagenTrasera }} style={styles.selectedImage} />
                    ) : (
                        <Ionicons name="image-outline" size={40} color="#FF7B6B" />
                    )}
                </TouchableOpacity>

                <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity style={styles.button} onPress={handleConfirmar}>
                        <ThemedText style={styles.buttonText}>Confirmar</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { backgroundColor: '#333', paddingHorizontal: 40, paddingTop: 80, paddingBottom: 80, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, alignItems: 'center' },
    headerText: { color: 'white', fontSize: 28, textAlign: 'center', fontWeight: 'bold' },
    formContainer: { marginTop: 40, paddingHorizontal: 20 },
    labelRed: { color: '#FF7B6B', fontSize: 18, marginBottom: 2, marginTop: 18, fontWeight: 'bold' },
    line: { height: 2, backgroundColor: '#222', marginBottom: 10 },
    imageBox: { 
        width: 120, 
        height: 80, 
        borderWidth: 2, 
        borderColor: '#FF7B6B', 
        borderRadius: 10, 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: 10, 
        marginTop: 4 
    },
    imageBoxWithImage: {
        borderStyle: 'dashed',
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#222',
        paddingVertical: 6,
        marginBottom: 10,
    },
    input: { 
        flex: 1,
        fontSize: 18, 
        color: '#222',
        padding: 0,
    },
    button: { backgroundColor: '#FF7B6B', borderRadius: 30, paddingVertical: 16, paddingHorizontal: 40, marginTop: 30 },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
}); 