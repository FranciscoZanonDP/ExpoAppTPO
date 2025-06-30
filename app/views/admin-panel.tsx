import { StyleSheet, View, TouchableOpacity, ScrollView, SafeAreaView, Image, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_IMAGE = "https://media.istockphoto.com/id/1409329028/es/vector/no-hay-imagen-disponible-marcador-de-posici%C3%B3n-miniatura-icono-dise%C3%B1o-de-ilustraci%C3%B3n.jpg?s=612x612&w=0&k=20&c=Bd89b8CBr-IXx9mBbTidc-wu_gtIj8Py_EMr3hGGaPw=";

export default function AdminPanelScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'recetas' | 'comentarios'>('recetas');
    const [recetasPendientes, setRecetasPendientes] = useState<any[]>([]);
    const [comentariosPendientes, setComentariosPendientes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar datos pendientes
    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchPendientes = async () => {
                setLoading(true);
                try {
                    // Cargar recetas pendientes
                    const resRecetas = await fetch('https://expo-app-tpo.vercel.app/api/recetas?estado=en_revision');
                    const dataRecetas = await resRecetas.json();
                    if (isActive) setRecetasPendientes(dataRecetas.recetas || []);

                    // Cargar comentarios pendientes
                    const resComentarios = await fetch('https://expo-app-tpo.vercel.app/api/comentarios?estado=en_revision');
                    const dataComentarios = await resComentarios.json();
                    console.log('Respuesta de comentarios:', dataComentarios);
                    if (isActive) setComentariosPendientes(dataComentarios.comentarios || []);
                } catch (error) {
                    console.error('Error cargando pendientes:', error);
                    Alert.alert('Error', 'No se pudieron cargar los elementos pendientes');
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            fetchPendientes();
            return () => { isActive = false; };
        }, [])
    );

    // Manejar aprobación/rechazo de recetas
    const handleRecetaAction = async (recetaId: string, action: 'aprobar' | 'rechazar') => {
        try {
            console.log('Actualizando receta:', recetaId, 'a estado:', action === 'aprobar' ? 'aprobada' : 'rechazada');
            const res = await fetch(`https://expo-app-tpo.vercel.app/api/recetas/${recetaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: action === 'aprobar' ? 'aprobada' : 'rechazada' })
            });

            const data = await res.json();
            console.log('Respuesta del servidor:', data);

            if (res.ok) {
                setRecetasPendientes(prev => prev.filter(r => r.id !== recetaId));
                Alert.alert('Éxito', `Receta ${action === 'aprobar' ? 'aprobada' : 'rechazada'} correctamente`);
            } else {
                Alert.alert('Error', data.error || 'No se pudo procesar la acción');
            }
        } catch (error) {
            console.error('Error procesando receta:', error);
            Alert.alert('Error', 'Error de conexión');
        }
    };

    // Manejar aprobación/rechazo de comentarios
    const handleComentarioAction = async (comentarioId: string, action: 'aprobar' | 'rechazar') => {
        try {
            console.log('Actualizando comentario:', comentarioId, 'a estado:', action === 'aprobar' ? 'aprobada' : 'rechazada');
            const res = await fetch(`https://expo-app-tpo.vercel.app/api/comentarios/${comentarioId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: action === 'aprobar' ? 'aprobada' : 'rechazada' })
            });

            const data = await res.json();
            console.log('Respuesta del servidor:', data);

            if (res.ok) {
                setComentariosPendientes(prev => prev.filter(c => c.id !== comentarioId));
                Alert.alert('Éxito', `Comentario ${action === 'aprobar' ? 'aprobado' : 'rechazado'} correctamente`);
            } else {
                Alert.alert('Error', data.error || 'No se pudo procesar la acción');
            }
        } catch (error) {
            console.error('Error procesando comentario:', error);
            Alert.alert('Error', 'Error de conexión');
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('usuario');
        router.replace('/views/login');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText style={styles.headerTitle}>Panel de Administración</ThemedText>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'recetas' && styles.activeTab]}
                        onPress={() => setActiveTab('recetas')}
                    >
                        <ThemedText style={[styles.tabText, activeTab === 'recetas' && styles.activeTabText]}>
                            Recetas ({recetasPendientes.length})
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'comentarios' && styles.activeTab]}
                        onPress={() => setActiveTab('comentarios')}
                    >
                        <ThemedText style={[styles.tabText, activeTab === 'comentarios' && styles.activeTabText]}>
                            Comentarios ({comentariosPendientes.length})
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Contenido */}
                <ScrollView style={styles.content}>
                    {loading ? (
                        <ThemedText style={styles.loadingText}>Cargando...</ThemedText>
                    ) : activeTab === 'recetas' ? (
                        // Lista de recetas pendientes
                        recetasPendientes.length === 0 ? (
                            <ThemedText style={styles.emptyText}>No hay recetas pendientes</ThemedText>
                        ) : (
                            recetasPendientes.map(receta => (
                                <View key={receta.id} style={styles.card}>
                                    <Image 
                                        source={receta.imagen_url ? { uri: receta.imagen_url } : { uri: DEFAULT_IMAGE }}
                                        style={styles.recipeImage}
                                    />
                                    <View style={styles.cardContent}>
                                        <ThemedText style={styles.cardTitle}>{receta.nombre}</ThemedText>
                                        <ThemedText style={styles.cardSubtitle}>Por: {receta.usuario_nombre}</ThemedText>
                                        <View style={styles.cardActions}>
                                            <TouchableOpacity 
                                                style={[styles.actionButton, styles.approveButton]}
                                                onPress={() => handleRecetaAction(receta.id, 'aprobar')}
                                            >
                                                <ThemedText style={styles.actionButtonText}>Aprobar</ThemedText>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                style={[styles.actionButton, styles.rejectButton]}
                                                onPress={() => handleRecetaAction(receta.id, 'rechazar')}
                                            >
                                                <ThemedText style={styles.actionButtonText}>Rechazar</ThemedText>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )
                    ) : (
                        // Lista de comentarios pendientes
                        comentariosPendientes.length === 0 ? (
                            <ThemedText style={styles.emptyText}>No hay comentarios pendientes</ThemedText>
                        ) : (
                            comentariosPendientes.map(comentario => (
                                <View key={comentario.id} style={styles.card}>
                                    <View style={styles.cardContent}>
                                        <ThemedText style={styles.cardTitle}>Comentario en: {comentario.receta_nombre}</ThemedText>
                                        <ThemedText style={styles.cardSubtitle}>Por: {comentario.usuario_nombre}</ThemedText>
                                        <ThemedText style={styles.commentText}>{comentario.texto}</ThemedText>
                                        <View style={styles.cardActions}>
                                            <TouchableOpacity 
                                                style={[styles.actionButton, styles.approveButton]}
                                                onPress={() => handleComentarioAction(comentario.id, 'aprobar')}
                                            >
                                                <ThemedText style={styles.actionButtonText}>Aprobar</ThemedText>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                style={[styles.actionButton, styles.rejectButton]}
                                                onPress={() => handleComentarioAction(comentario.id, 'rechazar')}
                                            >
                                                <ThemedText style={styles.actionButtonText}>Rechazar</ThemedText>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#FF7B6B',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    logoutButton: {
        padding: 8,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 4,
        margin: 10,
        borderRadius: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: '#FF7B6B',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
    },
    activeTabText: {
        color: 'white',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 10,
    },
    loadingText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    recipeImage: {
        width: '100%',
        height: 150,
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    commentText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    approveButton: {
        backgroundColor: '#4CAF50',
    },
    rejectButton: {
        backgroundColor: '#f44336',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
}); 