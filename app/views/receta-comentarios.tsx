import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RecetaComentariosScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [comentarios, setComentarios] = useState<any[]>([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [comentLoading, setComentLoading] = useState(false);
    const [usuarioId, setUsuarioId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsuario = async () => {
            const usuarioStr = await AsyncStorage.getItem('usuario');
            if (usuarioStr) {
                const usuario = JSON.parse(usuarioStr);
                setUsuarioId(usuario.id);
            }
        };
        fetchUsuario();
    }, []);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const fetchComentarios = async () => {
                if (!params.id) return;
                const res = await fetch(`https://expo-app-tpo.vercel.app/api/comentarios?receta_id=${params.id}`);
                const data = await res.json();
                if (isActive) setComentarios(data.comentarios || []);
            };
            fetchComentarios();
            return () => { isActive = false; };
        }, [params.id])
    );

    const handleComentar = async () => {
        if (!usuarioId || !nuevoComentario.trim() || !params.id) return;
        setComentLoading(true);
        await fetch('https://expo-app-tpo.vercel.app/api/comentarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receta_id: params.id, usuario_id: usuarioId, texto: nuevoComentario })
        });
        setNuevoComentario('');
        // Refrescar comentarios
        const res = await fetch(`https://expo-app-tpo.vercel.app/api/comentarios?receta_id=${params.id}`);
        const data = await res.json();
        setComentarios(data.comentarios || []);
        setComentLoading(false);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Comentarios</ThemedText>
            </View>
            <ScrollView style={styles.content}>
                <View style={styles.comentariosBox}>
                    {comentarios.length === 0 ? (
                        <ThemedText style={{ color: '#999', marginBottom: 10 }}>No hay comentarios.</ThemedText>
                    ) : (
                        comentarios.map((c: any) => (
                            <View key={c.id} style={{ marginBottom: 14 }}>
                                <ThemedText style={{ fontWeight: 'bold', color: '#333' }}>{c.usuario_nombre || 'Usuario'}</ThemedText>
                                <ThemedText style={{ color: '#444', marginBottom: 2 }}>{c.texto}</ThemedText>
                                <ThemedText style={{ color: '#bbb', fontSize: 11 }}>{new Date(c.created_at).toLocaleString()}</ThemedText>
                            </View>
                        ))
                    )}
                    {usuarioId && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                            <TextInput
                                style={{ flex: 1, borderWidth: 1, borderColor: '#FF7B6B', borderRadius: 10, padding: 8, marginRight: 8, color: '#222', backgroundColor: '#fafafa' }}
                                placeholder="Agregar un comentario..."
                                placeholderTextColor="#bbb"
                                value={nuevoComentario}
                                onChangeText={setNuevoComentario}
                                editable={!comentLoading}
                            />
                            <TouchableOpacity onPress={handleComentar} disabled={comentLoading || !nuevoComentario.trim()} style={{ backgroundColor: '#FF7B6B', borderRadius: 10, padding: 10 }}>
                                <Ionicons name="send" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#FF7B6B',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        alignItems: 'center',
        position: 'relative',
        marginBottom: 10,
    },
    backButton: {
        position: 'absolute',
        left: 10,
        top: 60,
        zIndex: 10,
        padding: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginTop: 10,
    },
    content: {
        flex: 1,
        padding: 15,
    },
    comentariosBox: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        marginTop: 10,
    },
}); 