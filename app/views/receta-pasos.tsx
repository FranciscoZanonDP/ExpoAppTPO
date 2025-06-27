import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView, Text, Linking, Image, Modal, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StarRating from '@/components/StarRating';
import BottomNavbar from '@/components/BottomNavbar';

export default function RecetaPasosScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [receta, setReceta] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number>(0);
    const [estadoPasos, setEstadoPasos] = useState<string[]>([]);
    const [usuarioId, setUsuarioId] = useState<string | null>(null);
    const [showValoracionModal, setShowValoracionModal] = useState(false);
    const [miValoracion, setMiValoracion] = useState(0);
    const [valoracionEnviada, setValoracionEnviada] = useState(false);

    useEffect(() => {
        // Resetear estados cuando cambia la receta
        setMiValoracion(0);
        setValoracionEnviada(false);
        setShowValoracionModal(false);
        
        const fetchReceta = async () => {
            if (!params.id) return;
            setLoading(true);
            const res = await fetch(`https://expo-app-tpo.vercel.app/api/recetas?id=${params.id}`);
            const data = await res.json();
            setReceta(data);
            setEstadoPasos(Array(data.pasos?.length || 0).fill('Pendiente'));
            setLoading(false);
        };
        
        const fetchUsuario = async () => {
            const usuarioStr = await AsyncStorage.getItem('usuario');
            if (usuarioStr) {
                const usuario = JSON.parse(usuarioStr);
                setUsuarioId(usuario.id);
            }
        };
        
        fetchReceta();
        fetchUsuario();
    }, [params.id]);

    useEffect(() => {
        // Verificar si el usuario ya valoró esta receta
        const fetchMiValoracion = async () => {
            if (!usuarioId || !params.id) return;
            const res = await fetch(`https://expo-app-tpo.vercel.app/api/recetas?action=valoraciones&receta_id=${params.id}&usuario_id=${usuarioId}`);
            const data = await res.json();
            if (data.valoracion) {
                setMiValoracion(data.valoracion.puntuacion);
                setValoracionEnviada(true);
            }
        };
        fetchMiValoracion();
    }, [usuarioId, params.id]);

    const handleExpand = (idx: number) => {
        setExpanded(expanded === idx ? -1 : idx);
    };

    const handleFinalizar = () => {
        if (usuarioId) {
            // Siempre mostrar modal de valoración si hay usuario
            // Permitir tanto crear nueva valoración como editar existente
            setShowValoracionModal(true);
        } else {
            router.back();
        }
    };

    const handleEnviarValoracion = async () => {
        if (!usuarioId || !params.id || miValoracion === 0) return;
        
        try {
            const res = await fetch('https://expo-app-tpo.vercel.app/api/recetas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'valoraciones',
                    receta_id: params.id,
                    usuario_id: usuarioId,
                    puntuacion: miValoracion
                })
            });
            
            if (res.ok) {
                setValoracionEnviada(true);
                setShowValoracionModal(false);
                const mensaje = valoracionEnviada ? 'Tu valoración ha sido actualizada correctamente.' : 'Tu valoración ha sido enviada correctamente.';
                Alert.alert('¡Gracias!', mensaje, [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Error', 'No se pudo enviar la valoración');
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo enviar la valoración');
        }
    };

    const handleSaltarValoracion = () => {
        setShowValoracionModal(false);
        router.back();
    };

    const handleVerVideo = (url: string) => {
        if (url) Linking.openURL(url);
    };

    const handleTogglePaso = (idx: number) => {
        setEstadoPasos(prev => {
            // Si está pendiente y quiere marcar como finalizado
            if (prev[idx] === 'Pendiente') {
                if (idx === 0 || prev[idx - 1] === 'Finalizado') {
                    return prev.map((estado, i) => i === idx ? 'Finalizado' : estado);
                } else {
                    return prev; // No se puede finalizar si el anterior no está finalizado
                }
            } else {
                // Si está finalizado y quiere volver a pendiente
                if (idx === prev.length - 1 || prev[idx + 1] !== 'Finalizado') {
                    return prev.map((estado, i) => i === idx ? 'Pendiente' : estado);
                } else {
                    return prev; // No se puede volver a pendiente si el siguiente está finalizado
                }
            }
        });
    };

    const todosFinalizados = estadoPasos.every(e => e === 'Finalizado');

    if (loading || !receta) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}><ThemedText>Cargando...</ThemedText></View>;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
            <View style={{ flex: 1, backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40 }}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace({ pathname: '/views/receta-detalle', params: { id: receta.id } })}>
                    <Ionicons name="arrow-back" size={32} color="#222" />
                </TouchableOpacity>
                <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 90, paddingBottom: 20 }}>
                    <ThemedText style={[styles.title, { marginTop: 0 }]}>{receta.nombre}</ThemedText>
                    <ThemedText style={styles.categoria}>{receta.categoria}</ThemedText>
                    <View style={{ marginTop: 24 }}>
                        {receta.pasos?.map((paso: any, idx: number) => (
                            <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
                                {/* Timeline */}
                                <View style={{ alignItems: 'center', width: 40 }}>
                                    <View style={[styles.timelineCircle, { backgroundColor: estadoPasos[idx] === 'Finalizado' ? '#FF7B6B' : '#6C6C6C' }]} />
                                    {idx < receta.pasos.length - 1 && <View style={styles.timelineLine} />}
                                </View>
                                {/* Paso */}
                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => handleExpand(idx)}>
                                        <ThemedText style={styles.pasoTitle}>paso {idx + 1}</ThemedText>
                                        <Ionicons name={expanded === idx ? 'chevron-up' : 'chevron-down'} size={20} color="#222" style={{ marginLeft: 4 }} />
                                        <TouchableOpacity onPress={() => handleTogglePaso(idx)}>
                                            <View style={[styles.estadoBadge, { backgroundColor: estadoPasos[idx] === 'Finalizado' ? '#B6F2C8' : '#D3D3D3' }]}>
                                                <Text style={{ color: estadoPasos[idx] === 'Finalizado' ? '#2E7D32' : '#555', fontWeight: 'bold', fontSize: 13 }}>{estadoPasos[idx]}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                    {expanded === idx && (
                                        <View style={{ marginTop: 4, marginBottom: 2 }}>
                                            <ThemedText style={styles.pasoDescripcion}>{paso.descripcion}</ThemedText>
                                            {Array.isArray(paso.medios) && paso.medios.length > 0 && (
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
                                                    {paso.medios.map((medio: any, mIdx: number) => (
                                                        medio.tipo === 'imagen' ? (
                                                            <Image key={mIdx} source={{ uri: medio.url }} style={{ width: 180, height: 120, borderRadius: 8, marginRight: 10 }} />
                                                        ) : medio.tipo === 'video' ? (
                                                            <TouchableOpacity key={mIdx} onPress={() => handleVerVideo(medio.url)} style={{ marginRight: 10 }}>
                                                                <View style={{ width: 180, height: 120, borderRadius: 8, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <Ionicons name="play-circle" size={48} color="#FF7B6B" />
                                                                    <ThemedText style={{ color: 'white', marginTop: 4 }}>Ver video</ThemedText>
                                                                </View>
                                                            </TouchableOpacity>
                                                        ) : null
                                                    ))}
                                                </ScrollView>
                                            )}
                                            {estadoPasos[idx] === 'Finalizado' && (
                                                <View style={[styles.estadoBadge, { backgroundColor: '#B6F2C8', alignSelf: 'flex-end', marginTop: 6 }]}>
                                                    <Text style={{ color: '#2E7D32', fontWeight: 'bold', fontSize: 13 }}>Hecho</Text>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
                <TouchableOpacity style={[styles.finalizarBtn, { opacity: todosFinalizados ? 1 : 0.5 }]} onPress={handleFinalizar} disabled={!todosFinalizados}>
                    <ThemedText style={styles.finalizarBtnText}>Finalizar</ThemedText>
                </TouchableOpacity>
                
                {/* Footer unificado */}
                <BottomNavbar currentScreen="home" />
            </View>

            {/* Modal de Valoración */}
            <Modal
                visible={showValoracionModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowValoracionModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>¡Receta completada!</ThemedText>
                            <ThemedText style={styles.modalSubtitle}>
                                {valoracionEnviada ? '¿Quieres cambiar tu valoración?' : '¿Cómo te pareció esta receta?'}
                            </ThemedText>
                        </View>
                        
                        <View style={styles.valoracionSection}>
                            <StarRating 
                                rating={miValoracion}
                                onRating={setMiValoracion}
                                readonly={false}
                                size={40}
                                style={{ marginVertical: 20 }}
                            />
                            {miValoracion > 0 && (
                                <ThemedText style={styles.valoracionTexto}>
                                    {miValoracion === 1 && "No me gustó"}
                                    {miValoracion === 2 && "Podría mejorar"}
                                    {miValoracion === 3 && "Está bien"}
                                    {miValoracion === 4 && "Me gustó mucho"}
                                    {miValoracion === 5 && "¡Excelente!"}
                                </ThemedText>
                            )}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={styles.saltarBtn} 
                                onPress={handleSaltarValoracion}
                            >
                                <ThemedText style={styles.saltarBtnText}>Saltar</ThemedText>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.enviarBtn, { opacity: miValoracion > 0 ? 1 : 0.5 }]} 
                                onPress={handleEnviarValoracion}
                                disabled={miValoracion === 0}
                            >
                                <ThemedText style={styles.enviarBtnText}>
                                    {valoracionEnviada ? 'Actualizar' : 'Enviar'}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: 18,
        left: 10,
        zIndex: 10,
        backgroundColor: '#F5F5F5',
        borderRadius: 30,
        padding: 6,
        elevation: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
        marginTop: 28,
        marginBottom: 0,
    },
    categoria: {
        color: '#FF7B6B',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 16,
    },
    timelineCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginBottom: 0,
    },
    timelineLine: {
        width: 3,
        height: 32,
        backgroundColor: '#6C6C6C',
        alignSelf: 'center',
    },
    pasoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        marginRight: 8,
    },
    pasoDescripcion: {
        color: '#BDBDBD',
        fontSize: 15,
        marginTop: 4,
        marginBottom: 2,
    },
    verVideo: {
        color: '#FF7B6B',
        fontSize: 14,
        textDecorationLine: 'underline',
        marginTop: 4,
    },
    estadoBadge: {
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginLeft: 8,
    },
    finalizarBtn: {
        backgroundColor: '#FF7B6B',
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
        marginHorizontal: 18,
        marginBottom: 18,
        marginTop: 0,
    },
    finalizarBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        width: '85%',
        maxWidth: 400,
        alignItems: 'center',
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    valoracionSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    valoracionTexto: {
        fontSize: 16,
        color: '#FF7B6B',
        fontWeight: 'bold',
        marginTop: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
        gap: 15,
    },
    saltarBtn: {
        flex: 1,
        backgroundColor: '#E0E0E0',
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: 'center',
    },
    saltarBtnText: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
    },
    enviarBtn: {
        flex: 1,
        backgroundColor: '#FF7B6B',
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: 'center',
    },
    enviarBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
}); 