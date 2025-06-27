import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    nombre: string;
    email: string;
    tipo: string;
    [key: string]: any;
}

export function useAuth(redirectToLoginIfNoUser: boolean = false) {
    const [usuario, setUsuario] = useState<User | null>(null);
    const [usuarioId, setUsuarioId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            const fetchUsuario = async () => {
                setLoading(true);
                try {
                    const usuarioStr = await AsyncStorage.getItem('usuario');
                    if (usuarioStr) {
                        const usuarioData = JSON.parse(usuarioStr);
                        setUsuario(usuarioData);
                        setUsuarioId(usuarioData.id);
                    } else {
                        setUsuario(null);
                        setUsuarioId(null);
                        if (redirectToLoginIfNoUser) {
                            router.replace('/views/login');
                        }
                    }
                } catch (error) {
                    console.error('Error al cargar usuario:', error);
                    setUsuario(null);
                    setUsuarioId(null);
                } finally {
                    setLoading(false);
                }
            };
            fetchUsuario();
        }, [router, redirectToLoginIfNoUser])
    );

    const logout = async () => {
        await AsyncStorage.removeItem('usuario');
        setUsuario(null);
        setUsuarioId(null);
        router.replace('/views/login');
    };

    return {
        usuario,
        usuarioId,
        loading,
        isAuthenticated: !!usuario,
        logout
    };
} 