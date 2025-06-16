import { StyleSheet, View, SafeAreaView, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
    const router = useRouter();
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sugerencias, setSugerencias] = useState<string[]>([]);

    const handleRegister = async () => {
        if (!nombre || !email) {
            Alert.alert('Por favor completa todos los campos.');
            return;
        }
        setLoading(true);
        setSugerencias([]);
        try {
            // Verificar email y alias únicos
            const res = await fetch('https://expo-app-tpo.vercel.app/api/verificar-usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, alias: nombre })
            });
            const data = await res.json();
            if (data.emailOcupado) {
                Alert.alert('El email ya está registrado.');
                setLoading(false);
                return;
            }
            if (data.aliasOcupado) {
                setSugerencias(data.sugerencias || []);
                Alert.alert('El alias ya está en uso. Prueba con otro.');
                setLoading(false);
                return;
            }
            // Enviar código de verificación
            const res2 = await fetch('https://expo-app-tpo.vercel.app/api/enviar-codigo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data2 = await res2.json();
            if (!data2.enviado) {
                Alert.alert('No se pudo enviar el código. Intenta más tarde.');
                setLoading(false);
                return;
            }
            // Navegar a verificación
            router.push({
                pathname: '/views/verification',
                params: { nombre, email }
            });
        } catch (err) {
            Alert.alert('Error de red: ' + String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = () => {
        router.push('/views/login');
    };

    const handleBack = () => {
        router.push('/views/login');
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
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
                        {/* Formulario */}
                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                <ThemedText style={styles.inputLabel}>Alias</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Tu alias"
                                    placeholderTextColor="#999"
                                    value={nombre}
                                    onChangeText={setNombre}
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <ThemedText style={styles.inputLabel}>Email</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    placeholder="tu@email.com"
                                    placeholderTextColor="#999"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            {sugerencias.length > 0 && (
                                <View style={{ marginBottom: 10 }}>
                                    <ThemedText style={{ color: '#FF7B6B', marginBottom: 5 }}>Sugerencias de alias:</ThemedText>
                                    {sugerencias.map((s, i) => (
                                        <TouchableOpacity key={i} onPress={() => setNombre(s)}>
                                            <ThemedText style={{ color: '#333', marginBottom: 2 }}>{s}</ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.registerButton}
                                onPress={handleRegister}
                                disabled={loading}
                            >
                                {loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.registerButtonText}>Siguiente</ThemedText>}
                            </TouchableOpacity>

                            <View style={styles.loginContainer}>
                                <ThemedText style={styles.loginText}>¿Ya tienes cuenta? </ThemedText>
                                <TouchableOpacity onPress={handleLogin}>
                                    <ThemedText style={styles.loginLink}>Inicia sesión</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
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
        marginBottom: 20,
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
    },
    registerButton: {
        backgroundColor: '#FF7B6B',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    registerButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loginText: {
        color: '#666',
        fontSize: 14,
    },
    loginLink: {
        color: '#FF7B6B',
        fontSize: 14,
        fontWeight: '600',
    },
}); 