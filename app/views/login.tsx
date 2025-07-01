import { StyleSheet, View, SafeAreaView, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Por favor completa todos los campos.');
            return;
        }
        try {
            // Limpiar cualquier dato previo
            await AsyncStorage.clear();
            console.log('🔄 [Login] Storage limpiado antes de iniciar login');

            const response = await fetch('https://expo-app-tpo.vercel.app/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            
            const data = await response.json();
            if (!response.ok) {
                alert('Error: ' + data.error);
                return;
            }

            // Verificar que los datos del usuario estén completos
            if (!data.user || !data.user.id || !data.user.email || !data.user.userType) {
                console.error('❌ [Login] Datos de usuario incompletos:', data.user);
                alert('Error: Datos de usuario incompletos');
                return;
            }
            
            // Asegurarse de que el usuario tenga todos los campos necesarios
            const userToStore = {
                id: data.user.id,
                nombre: data.user.nombre,
                email: data.user.email,
                userType: data.user.userType
            };
            
            console.log('📝 [Login] Datos del usuario a guardar:', userToStore);
            
            // Guarda el usuario en AsyncStorage
            await AsyncStorage.setItem('usuario', JSON.stringify(userToStore));
            console.log('✅ [Login] Usuario guardado en AsyncStorage');
            
            // Verificar que se guardó correctamente
            const storedUser = await AsyncStorage.getItem('usuario');
            if (!storedUser) {
                throw new Error('No se pudo verificar el almacenamiento del usuario');
            }
            console.log('🔍 [Login] Usuario verificado en storage:', storedUser);
            
            alert('¡Login exitoso! Bienvenido, ' + userToStore.nombre);
            
            // Redirigir según el rol del usuario
            if (data.user.userType === 'Administrador') {
                router.replace({
                    pathname: '/views/admin-panel'
                });
            } else {
                router.replace({
                    pathname: '/views/home'
                });
            }
        } catch (error) {
            alert('Error de red: ' + String(error));
        }
    };

    const handleRegister = () => {
        // Navegar a la pantalla de registro con los campos vacíos
        router.push({
            pathname: '/views/register',
            params: { nombre: '', email: '', password: '', userType: 'Usuario' }
        });
    };

    const handleBack = () => {
        router.back();
    };

    const handleForgotPassword = () => {
        router.push('/views/forgot-password');
    };

    const handleGuestLogin = async () => {
        try {
            // Limpiar cualquier dato de usuario previo
            await AsyncStorage.clear();
            console.log('🔄 [Login] Storage limpiado para invitado');
            
            // Verificar que se limpió correctamente
            const storedUser = await AsyncStorage.getItem('usuario');
            console.log('🔍 [Login] Verificación después de limpiar:', storedUser);
            
            // Simplemente redirigir al home sin guardar nada
            router.replace({
                pathname: '/views/home'
            });
        } catch (error) {
            console.error('❌ [Login] Error durante acceso como invitado:', error);
            alert('Error al acceder como invitado');
        }
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
                        <ThemedText style={styles.title}>Inicia sesión</ThemedText>
                    </View>

                    {/* Parte inferior con fondo blanco */}
                    <View style={styles.bottomSection}>
                        {/* Formulario */}
                        <View style={styles.formContainer}>
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
                                <View style={styles.checkmark}>
                                    <Ionicons name="checkmark" size={20} color="#4CAF50" />
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <ThemedText style={styles.inputLabel}>Contraseña</ThemedText>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={password}
                                        placeholder="••••••••••"
                                        placeholderTextColor="#999"
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

                            <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                                <ThemedText style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={handleLogin}
                            >
                                <ThemedText style={styles.loginButtonText}>Acceder</ThemedText>
                            </TouchableOpacity>

                            <View style={styles.registerContainer}>
                                <ThemedText style={styles.registerText}>¿Aún no tienes cuenta? </ThemedText>
                                <TouchableOpacity onPress={handleRegister}>
                                    <ThemedText style={styles.registerLink}>Regístrate</ThemedText>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
                                <ThemedText style={styles.guestButtonText}>Acceder como invitado</ThemedText>
                            </TouchableOpacity>
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
        paddingRight: 30, // Espacio para el ícono de verificación
    },
    checkmark: {
        position: 'absolute',
        right: 0,
        bottom: 10,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 25,
    },
    forgotPasswordText: {
        color: '#FF7B6B',
        fontSize: 12,
    },
    loginButton: {
        backgroundColor: '#FF7B6B',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    registerText: {
        color: '#666',
        fontSize: 14,
    },
    registerLink: {
        color: '#FF7B6B',
        fontSize: 14,
        fontWeight: '600',
    },
    googleButton: {
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    googleIcon: {
        marginRight: 10,
    },
    googleButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    guestButton: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    guestButtonText: {
        color: '#666',
        fontSize: 14,
    },
}); 