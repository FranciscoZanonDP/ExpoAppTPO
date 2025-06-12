import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function CambiarAlumnoDatosScreen() {
    const [titular, setTitular] = useState('Juan Levy');
    const [numTramite, setNumTramite] = useState('78924122214');
    const router = useRouter();

    const handleConfirmar = async () => {
        try {
            const usuarioStr = await AsyncStorage.getItem('usuario');
            if (!usuarioStr) {
                alert('No hay usuario logueado');
                return;
            }
            const usuario = JSON.parse(usuarioStr);
            const response = await fetch('https://expo-app-tpo.vercel.app/api/cambiar-a-alumno', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: usuario.email }),
            });
            const data = await response.json();
            if (!response.ok) {
                alert('Error: ' + data.error);
                return;
            }
            // Actualizar el usuario en AsyncStorage
            const usuarioActualizado = { ...usuario, userType: 'Alumno' };
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
                <ThemedText style={styles.labelRed}>Titular</ThemedText>
                <ThemedText style={styles.titular}>{titular}</ThemedText>
                <View style={styles.line} />
                <ThemedText style={styles.labelRed}>Imagen Frontal del DNI</ThemedText>
                <TouchableOpacity style={styles.imageBox}>
                    <Ionicons name="scan-outline" size={40} color="#FF7B6B" />
                </TouchableOpacity>
                <ThemedText style={styles.labelRed}>Imagen Torso del DNI</ThemedText>
                <TouchableOpacity style={styles.imageBox}>
                    <Ionicons name="scan-outline" size={40} color="#FF7B6B" />
                </TouchableOpacity>
                <ThemedText style={styles.labelRed}>Numero de Trámite</ThemedText>
                <TextInput
                    style={styles.input}
                    value={numTramite}
                    onChangeText={setNumTramite}
                    keyboardType="numeric"
                />
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
    titular: { color: '#222', fontSize: 20, marginBottom: 2, fontWeight: 'bold' },
    line: { height: 2, backgroundColor: '#222', marginBottom: 10 },
    imageBox: { width: 60, height: 60, borderWidth: 2, borderColor: '#FF7B6B', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10, marginTop: 4 },
    input: { borderBottomWidth: 2, borderBottomColor: '#222', fontSize: 18, color: '#222', marginBottom: 30, marginTop: 2, paddingVertical: 6 },
    button: { backgroundColor: '#FF7B6B', borderRadius: 30, paddingVertical: 16, paddingHorizontal: 40, marginTop: 30 },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
}); 