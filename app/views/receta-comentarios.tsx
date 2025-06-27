import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function RecetaComentariosScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [comentarios, setComentarios] = useState<any[]>([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [comentLoading, setComentLoading] = useState(false);
    
    // Usar el hook de autenticación
    const { usuarioId, isAuthenticated } = useAuth();

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const fetchComentarios = async () => {
                if (!params.id) return;
                // Obtener comentarios aprobados + los propios en revisión del usuario
                const url = usuarioId 
                    ? `https://expo-app-tpo.vercel.app/api/comentarios?receta_id=${params.id}&usuario_id=${usuarioId}`
                    : `https://expo-app-tpo.vercel.app/api/comentarios?receta_id=${params.id}`;
                const res = await fetch(url);
                const data = await res.json();
                if (isActive) setComentarios(data.comentarios || []);
            };
            fetchComentarios();
            return () => { isActive = false; };
        }, [params.id, usuarioId])
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
        const url = usuarioId 
            ? `https://expo-app-tpo.vercel.app/api/comentarios?receta_id=${params.id}&usuario_id=${usuarioId}`
            : `https://expo-app-tpo.vercel.app/api/comentarios?receta_id=${params.id}`;
        const res = await fetch(url);
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
                            <View key={c.id} style={{ 
                                marginBottom: 14, 
                                backgroundColor: c.estado === 'en_revision' ? '#FFF9E6' : 'transparent',
                                padding: c.estado === 'en_revision' ? 12 : 0,
                                borderRadius: c.estado === 'en_revision' ? 8 : 0,
                                borderLeftWidth: c.estado === 'en_revision' ? 3 : 0,
                                borderLeftColor: c.estado === 'en_revision' ? '#FFB800' : 'transparent'
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                    <ThemedText style={{ fontWeight: 'bold', color: '#333' }}>{c.usuario_nombre || 'Usuario'}</ThemedText>
                                    {c.estado === 'en_revision' && (
                                        <View style={{ 
                                            backgroundColor: '#FFB800', 
                                            paddingHorizontal: 8, 
                                            paddingVertical: 2, 
                                            borderRadius: 10, 
                                            marginLeft: 8 
                                        }}>
                                            <ThemedText style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>EN REVISIÓN</ThemedText>
                                        </View>
                                    )}
                                </View>
                                <ThemedText style={{ color: '#444', marginBottom: 2 }}>{c.texto}</ThemedText>
                                <ThemedText style={{ color: '#bbb', fontSize: 11 }}>{new Date(c.created_at).toLocaleString()}</ThemedText>
                                {c.estado === 'en_revision' && (
                                    <ThemedText style={{ color: '#CC8800', fontSize: 11, fontStyle: 'italic', marginTop: 4 }}>
                                        Tu comentario está siendo revisado por un moderador
                                    </ThemedText>
                                )}
                            </View>
                        ))
                    )}
                    
                    
                    
                    {isAuthenticated && usuarioId && (
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