import React from 'react';
import { StyleSheet, View, SafeAreaView, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

type RegistroBody = {
    nombre: string | string[];
    email: string | string[];
    password: string;
    userType: string;
    medioPago?: string;
    fotoDniFrente?: string;
    fotoDniDorso?: string;
    numeroTramiteDni?: string;
};

export default function VerificationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const [etapa, setEtapa] = useState<'codigo' | 'final'>('codigo');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userType, setUserType] = useState('Usuario');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [medioPago, setMedioPago] = useState('');
    const [fotoDniFrente, setFotoDniFrente] = useState('');
    const [fotoDniDorso, setFotoDniDorso] = useState('');
    const [numeroTramiteDni, setNumeroTramiteDni] = useState('');

    const handleBack = () => {
        router.back();
    };

    const handleResendCode = async () => {
        if (!params.email) return;
        setLoading(true);
        try {
            await fetch('https://expo-app-tpo.vercel.app/api/enviar-codigo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: params.email })
            });
            Alert.alert('Código reenviado');
        } catch (err) {
            Alert.alert('No se pudo reenviar el código');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!codigo) {
            Alert.alert('Ingresa el código recibido');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('https://expo-app-tpo.vercel.app/api/verificar-codigo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: params.email, codigo })
            });
            const data = await res.json();
            if (!data.valido) {
                Alert.alert('Código incorrecto');
                setLoading(false);
                return;
            }
            setEtapa('final');
        } catch (err) {
            Alert.alert('Error de red: ' + String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Completa la contraseña');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Las contraseñas no coinciden');
            return;
        }
        setLoading(true);
        try {
            const body: RegistroBody = {
                nombre: params.nombre,
                email: params.email,
                password,
                userType
            };
            if (userType === 'Alumno') {
                body.medioPago = medioPago;
                body.fotoDniFrente = fotoDniFrente;
                body.fotoDniDorso = fotoDniDorso;
                body.numeroTramiteDni = numeroTramiteDni;
            }
            const response = await fetch('https://expo-app-tpo.vercel.app/api/registrar-usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (!response.ok) {
                Alert.alert('Error: ' + data.error);
                setLoading(false);
                return;
            }
            // Obtener el ID del usuario recién registrado de la respuesta
            const userToStore = {
                id: data.userId, // Asumiendo que el backend devuelve el ID en data.userId
                nombre: params.nombre,
                email: params.email,
                userType
            };
            console.log('📝 [Register] Datos del usuario a guardar:', userToStore);
            await AsyncStorage.setItem('usuario', JSON.stringify(userToStore));
            Alert.alert('¡Registro exitoso!');
            router.replace('/views/home');
        } catch (error) {
            Alert.alert('Error de red: ' + String(error));
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async (setter: (uri: string) => void) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a la galería de fotos.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setter(result.assets[0].uri);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Parte superior con fondo coral */}
                <View style={styles.topSection}>
                    {/* Botón de regreso */}
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    {/* Logo centrado */}
                    <ThemedText style={styles.brand}>@Cookit</ThemedText>
                    {/* Título */}
                    <ThemedText style={styles.title}>Regístrate</ThemedText>
                </View>
                {/* Parte inferior con fondo blanco */}
                <View style={styles.bottomSection}>
                    <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
                        {etapa === 'codigo' ? (
                            <>
                                <ThemedText style={styles.verificationText}>
                                    Hemos enviado una verificación a tu Email
                                </ThemedText>
                                <TextInput
                                    style={styles.codeInput}
                                    placeholder="Ingresa el código recibido"
                                    value={codigo}
                                    onChangeText={setCodigo}
                                    keyboardType="numeric"
                                    maxLength={6}
                                />
                                <TouchableOpacity
                                    style={styles.emailButton}
                                    onPress={handleVerify}
                                    disabled={loading}
                                >
                                    <ThemedText style={styles.emailButtonText}>{loading ? 'Verificando...' : 'Verificar'}</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleResendCode} disabled={loading}>
                                    <ThemedText style={styles.resendText}>
                                        ¿No recibiste nada aún? Reenviar código
                                    </ThemedText>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <ThemedText style={styles.verificationText}>
                                    Completa tu registro
                                </ThemedText>
                                <View style={styles.inputContainer}>
                                    <ThemedText style={styles.inputLabel}>Contraseña</ThemedText>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Contraseña"
                                        placeholderTextColor="#999"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        autoCapitalize="none"
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <ThemedText style={styles.inputLabel}>Repetir contraseña</ThemedText>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Repetir contraseña"
                                        placeholderTextColor="#999"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry
                                        autoCapitalize="none"
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <ThemedText style={styles.inputLabel}>Tipo de usuario</ThemedText>
                                    <TouchableOpacity style={styles.dropdownContainer} onPress={() => setDropdownVisible(!dropdownVisible)}>
                                        <ThemedText style={styles.dropdownText}>{userType}</ThemedText>
                                        <Ionicons name={dropdownVisible ? 'chevron-up-outline' : 'chevron-down-outline'} size={20} color="#999" />
                                    </TouchableOpacity>
                                    {dropdownVisible && (
                                        <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 5, marginTop: 5 }}>
                                            <TouchableOpacity onPress={() => { setUserType('Usuario'); setDropdownVisible(false); }} style={{ padding: 10 }}>
                                                <ThemedText style={{ color: userType === 'Usuario' ? '#FF7B6B' : '#333' }}>Usuario</ThemedText>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => { setUserType('Alumno'); setDropdownVisible(false); }} style={{ padding: 10 }}>
                                                <ThemedText style={{ color: userType === 'Alumno' ? '#FF7B6B' : '#333' }}>Alumno</ThemedText>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                                {userType === 'Alumno' && (
                                    <>
                                        <View style={styles.inputContainer}>
                                            <ThemedText style={styles.inputLabel}>Medio de pago (tarjeta de crédito)</ThemedText>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Ej: 4111 1111 1111 1111"
                                                placeholderTextColor="#999"
                                                value={medioPago}
                                                onChangeText={setMedioPago}
                                                keyboardType="default"
                                            />
                                        </View>
                                        <View style={styles.inputContainer}>
                                            <ThemedText style={styles.inputLabel}>Foto DNI frente</ThemedText>
                                            <TouchableOpacity style={styles.imagePickerButton} onPress={() => handlePickImage(setFotoDniFrente)}>
                                                <ThemedText style={styles.imagePickerText}>{fotoDniFrente ? 'Cambiar foto' : 'Seleccionar foto'}</ThemedText>
                                            </TouchableOpacity>
                                            {fotoDniFrente ? <Image source={{ uri: fotoDniFrente }} style={styles.dniImage} /> : null}
                                        </View>
                                        <View style={styles.inputContainer}>
                                            <ThemedText style={styles.inputLabel}>Foto DNI dorso</ThemedText>
                                            <TouchableOpacity style={styles.imagePickerButton} onPress={() => handlePickImage(setFotoDniDorso)}>
                                                <ThemedText style={styles.imagePickerText}>{fotoDniDorso ? 'Cambiar foto' : 'Seleccionar foto'}</ThemedText>
                                            </TouchableOpacity>
                                            {fotoDniDorso ? <Image source={{ uri: fotoDniDorso }} style={styles.dniImage} /> : null}
                                        </View>
                                        <View style={styles.inputContainer}>
                                            <ThemedText style={styles.inputLabel}>Número de trámite del DNI</ThemedText>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Número de trámite"
                                                placeholderTextColor="#999"
                                                value={numeroTramiteDni}
                                                onChangeText={setNumeroTramiteDni}
                                                keyboardType="default"
                                            />
                                        </View>
                                    </>
                                )}
                                <TouchableOpacity
                                    style={styles.emailButton}
                                    onPress={handleRegister}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.emailButtonText}>Finalizar registro</ThemedText>}
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FF7B6B',
    },
    container: {
        flex: 1,
        backgroundColor: '#FF7B6B',
    },
    topSection: {
        backgroundColor: '#FF7B6B',
        paddingHorizontal: 25,
        paddingTop: 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        zIndex: 1,
    },
    bottomSection: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: 0,
        justifyContent: 'center',
    },
    backButton: {
        padding: 5,
        marginTop: 10,
    },
    brand: {
        color: 'white',
        fontSize: 16,
        opacity: 0.9,
        textAlign: 'center',
        marginTop: 10,
    },
    title: {
        color: 'white',
        fontSize: 26,
        fontWeight: '800',
        textAlign: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    formContainer: {
        paddingHorizontal: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verificationText: {
        color: '#333',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
    },
    codeInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 18,
        marginBottom: 20,
        width: '100%',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
    },
    emailButton: {
        backgroundColor: '#FF7B6B',
        borderRadius: 25,
        paddingVertical: 15,
        paddingHorizontal: 40,
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
    },
    emailButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    resendText: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    inputLabel: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 18,
        width: '100%',
        backgroundColor: '#f9f9f9',
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 18,
        width: '100%',
        backgroundColor: '#f9f9f9',
    },
    dropdownText: {
        color: '#333',
        fontSize: 18,
    },
    imagePickerButton: {
        backgroundColor: '#E0E0E0',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    imagePickerText: {
        color: '#333',
        fontSize: 16,
    },
    dniImage: {
        width: 180,
        height: 120,
        borderRadius: 8,
        marginTop: 5,
        marginBottom: 10,
        alignSelf: 'center',
    },
}); 