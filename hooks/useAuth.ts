import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    nombre: string;
    email: string;
    userType: string;
    [key: string]: any;
}

export function useAuth(redirectToLoginIfNoUser: boolean = false) {
    const [usuario, setUsuario] = useState<User | null>(null);
    const [usuarioId, setUsuarioId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUsuario = useCallback(async () => {
        setLoading(true);
        try {
            const usuarioStr = await AsyncStorage.getItem('usuario');
            console.log('🔍 [useAuth] Usuario en AsyncStorage:', usuarioStr);
            
            if (usuarioStr) {
                const usuarioData = JSON.parse(usuarioStr);
                console.log('👤 [useAuth] Datos del usuario:', {
                    id: usuarioData.id,
                    nombre: usuarioData.nombre,
                    email: usuarioData.email,
                    userType: usuarioData.userType
                });

                // Verificar que el usuario tenga todos los campos necesarios
                if (usuarioData.id && usuarioData.email && usuarioData.userType) {
                    setUsuario(usuarioData);
                    setUsuarioId(usuarioData.id);
                } else {
                    console.log('⚠️ [useAuth] Datos de usuario incompletos, limpiando estado');
                    await AsyncStorage.clear();
                    setUsuario(null);
                    setUsuarioId(null);
                    if (redirectToLoginIfNoUser) {
                        router.replace({
                            pathname: '/views/login'
                        });
                    }
                }
            } else {
                console.log('❌ [useAuth] No hay usuario en AsyncStorage');
                setUsuario(null);
                setUsuarioId(null);
                if (redirectToLoginIfNoUser) {
                    router.replace({
                        pathname: '/views/login'
                    });
                }
            }
        } catch (error) {
            console.error('Error al cargar usuario:', error);
            await AsyncStorage.clear();
            setUsuario(null);
            setUsuarioId(null);
        } finally {
            setLoading(false);
        }
    }, [router, redirectToLoginIfNoUser]);

    useFocusEffect(
        useCallback(() => {
            fetchUsuario();
        }, [fetchUsuario])
    );

    const logout = async () => {
        try {
            await AsyncStorage.clear();
            console.log('🔄 [useAuth] Storage limpiado');
            setUsuario(null);
            setUsuarioId(null);
            console.log('🔄 [useAuth] Estados reseteados');
            router.replace({
                pathname: '/views/login'
            });
        } catch (error) {
            console.error('Error durante el logout:', error);
        }
    };

    return {
        usuario,
        usuarioId,
        loading,
        isAuthenticated: !!usuario,
        logout
    };
} 