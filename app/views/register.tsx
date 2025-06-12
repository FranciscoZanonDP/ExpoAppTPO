import { StyleSheet, View, SafeAreaView, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
    const router = useRouter();
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [userType, setUserType] = useState('Usuario');
    const [dropdownVisible, setDropdownVisible] = useState(false);

    // Limpiar campos cada vez que se entra a la pantalla
    useFocusEffect(
        useCallback(() => {
            setNombre('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setUserType('Usuario');
        }, [])
    );

    const handleRegister = async () => {
        if (!nombre || !email || !password || !confirmPassword) {
            alert('Por favor completa todos los campos.');
            return;
        }
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }
        // Solo navegar a verificación, sin fetch
        router.push({
            pathname: '/views/verification',
            params: { nombre, email, password, userType }
        });
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
                                <ThemedText style={styles.inputLabel}>Nombre</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    placeholder="cookit"
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
                                    placeholder="cookit@cookit.com"
                                    placeholderTextColor="#999"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <ThemedText style={styles.inputLabel}>Contraseña</ThemedText>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="••••••••••"
                                        placeholderTextColor="#999"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!passwordVisible}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setPasswordVisible(!passwordVisible)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color="#4CAF50"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <ThemedText style={styles.inputLabel}>Repetir contraseña</ThemedText>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="••••••••••"
                                        placeholderTextColor="#999"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!confirmPasswordVisible}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={confirmPasswordVisible ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color="#4CAF50"
                                        />
                                    </TouchableOpacity>
                                </View>
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

                            <TouchableOpacity
                                style={styles.registerButton}
                                onPress={handleRegister}
                            >
                                <ThemedText style={styles.registerButtonText}>Registrarse</ThemedText>
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: {
        padding: 10,
    },
    dropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingVertical: 10,
    },
    dropdownText: {
        fontSize: 16,
        color: '#999',
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