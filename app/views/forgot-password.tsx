import React from 'react';
import { StyleSheet, View, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'email' | 'codigo'>('email');
    const [codigo, setCodigo] = useState('');
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleBack = () => {
        router.back();
    };

    const handleSendLink = async () => {
        if (!email) {
            Alert.alert('Por favor ingresa tu email');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('https://expo-app-tpo.vercel.app/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'recuperar', email })
            });
            const data = await res.json();
            if (!res.ok) {
                Alert.alert('Error', data.error || 'No se pudo enviar el código');
                setLoading(false);
                return;
            }
            Alert.alert('Código enviado', 'Revisa tu email. El código es válido por 30 minutos.');
            setStep('codigo');
        } catch (err) {
            Alert.alert('Error de red', String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!codigo || !nuevaPassword || !confirmPassword) {
            Alert.alert('Completa todos los campos');
            return;
        }
        if (nuevaPassword !== confirmPassword) {
            Alert.alert('Las contraseñas no coinciden');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('https://expo-app-tpo.vercel.app/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cambiar', email, codigo, nuevaPassword })
            });
            const data = await res.json();
            if (!res.ok) {
                Alert.alert('Error', data.error || 'No se pudo cambiar la contraseña');
                setLoading(false);
                return;
            }
            Alert.alert('¡Contraseña cambiada!', 'Ya puedes iniciar sesión con tu nueva contraseña.');
            router.replace('/views/login');
        } catch (err) {
            Alert.alert('Error de red', String(err));
        } finally {
            setLoading(false);
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
                    <ThemedText style={styles.title}>Cambiar contraseña</ThemedText>
                </View>

                {/* Parte inferior con fondo blanco */}
                <View style={styles.bottomSection}>
                    <View style={styles.formContainer}>
                        {step === 'email' ? (
                            <>
                                <View style={styles.inputContainer}>
                                    <ThemedText style={styles.inputLabel}>Email</ThemedText>
                                    <TextInput
                                        style={styles.input}
                                        value={email}
                                        placeholder="cookit@cookit.com"
                                        placeholderTextColor="#999"
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    <View style={styles.checkmark}>
                                        <Ionicons name="checkmark" size={20} color="#4CAF50" />
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.sendButton}
                                    onPress={handleSendLink}
                                    disabled={loading}
                                >
                                    <ThemedText style={styles.sendButtonText}>{loading ? 'Enviando...' : 'Enviar código'}</ThemedText>
                                </TouchableOpacity>
                                <ThemedText style={styles.infoText}>
                                    Recibirás un código por email. El código es válido por 30 minutos.
                                </ThemedText>
                            </>
                        ) : (
                            <>
                                <View style={styles.inputContainer}>
                                    <ThemedText style={styles.inputLabel}>Código recibido</ThemedText>
                                    <TextInput
                                        style={styles.input}
                                        value={codigo}
                                        placeholder="Código"
                                        placeholderTextColor="#999"
                                        onChangeText={setCodigo}
                                        keyboardType="numeric"
                                        autoCapitalize="none"
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <ThemedText style={styles.inputLabel}>Nueva contraseña</ThemedText>
                                    <TextInput
                                        style={styles.input}
                                        value={nuevaPassword}
                                        placeholder="Nueva contraseña"
                                        placeholderTextColor="#999"
                                        onChangeText={setNuevaPassword}
                                        secureTextEntry
                                        autoCapitalize="none"
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <ThemedText style={styles.inputLabel}>Repetir contraseña</ThemedText>
                                    <TextInput
                                        style={styles.input}
                                        value={confirmPassword}
                                        placeholder="Repetir contraseña"
                                        placeholderTextColor="#999"
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry
                                        autoCapitalize="none"
                                    />
                                </View>
                                <TouchableOpacity
                                    style={styles.sendButton}
                                    onPress={handleChangePassword}
                                    disabled={loading}
                                >
                                    <ThemedText style={styles.sendButtonText}>{loading ? 'Cambiando...' : 'Cambiar contraseña'}</ThemedText>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
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
        paddingTop: 30,
    },
    inputContainer: {
        marginBottom: 30,
        position: 'relative',
    },
    inputLabel: {
        color: '#FF7B6B',
        fontSize: 14,
        marginBottom: 5,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingVertical: 10,
        fontSize: 16,
        color: '#333',
        paddingRight: 30,
    },
    checkmark: {
        position: 'absolute',
        right: 0,
        bottom: 10,
    },
    sendButton: {
        backgroundColor: '#FF7B6B',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    sendButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    infoText: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 40,
    },
    remindContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    remindText: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
}); 