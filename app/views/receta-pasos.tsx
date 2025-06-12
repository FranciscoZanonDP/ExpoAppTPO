import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView, Text, Linking } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

export default function RecetaPasosScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [receta, setReceta] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number>(0);
    const [estadoPasos, setEstadoPasos] = useState<string[]>([]);

    useEffect(() => {
        const fetchReceta = async () => {
            if (!params.id) return;
            setLoading(true);
            const res = await fetch(`https://expo-app-tpo.vercel.app/api/recetas?id=${params.id}`);
            const data = await res.json();
            setReceta(data);
            setEstadoPasos(Array(data.pasos?.length || 0).fill('Pendiente'));
            setLoading(false);
        };
        fetchReceta();
    }, [params.id]);

    const handleExpand = (idx: number) => {
        setExpanded(expanded === idx ? -1 : idx);
    };

    const handleFinalizar = () => {
        router.back(); // O navega a donde quieras después de finalizar
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
                                            {paso.video_url && (
                                                <TouchableOpacity onPress={() => handleVerVideo(paso.video_url)}>
                                                    <Text style={styles.verVideo}>Ver video</Text>
                                                </TouchableOpacity>
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
            </View>
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
}); 