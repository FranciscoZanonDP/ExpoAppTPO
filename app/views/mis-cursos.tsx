import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

const cursos = {
    curso1: {
        titulo: 'Pastelería Básica',
        autor: 'Zanon',
        imagen: require('../../assets/images/curso_panaderia.jpeg'),
        horario: 'Mie-22hs',
        precio: '$35.000',
    },
    curso2: {
        titulo: 'Curso de Pastas',
        autor: 'Zanon',
        imagen: require('../../assets/images/curso_pastas.jpg'),
        horario: 'Jue-20hs',
        precio: '$30.000',
    },
    curso3: {
        titulo: 'Curso de Cocina Saludable',
        autor: 'Zanon',
        imagen: require('../../assets/images/curso_saludable.jpg'),
        horario: 'Vie-18hs',
        precio: '$28.000',
    },
};

export default function MisCursosScreen() {
    const [misCursos, setMisCursos] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useFocusEffect(
        React.useCallback(() => {
            let isActive = true;
            const fetchMisCursos = async () => {
                setLoading(true);
                const usuarioStr = await AsyncStorage.getItem('usuario');
                if (!usuarioStr) {
                    if (isActive) {
                        setMisCursos([]);
                        setLoading(false);
                    }
                    return;
                }
                const usuario = JSON.parse(usuarioStr);
                try {
                    const res = await fetch(`https://expo-app-tpo.vercel.app/api/inscripciones?usuario_email=${usuario.email}`);
                    const data = await res.json();
                    if (res.ok && Array.isArray(data.inscripciones)) {
                        if (isActive) setMisCursos(data.inscripciones);
                    } else {
                        if (isActive) setMisCursos([]);
                    }
                } catch {
                    if (isActive) setMisCursos([]);
                }
                if (isActive) setLoading(false);
            };
            fetchMisCursos();
            return () => { isActive = false; };
        }, [])
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/views/home')}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Mis Cursos</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {loading ? (
                    <Text style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>Cargando...</Text>
                ) : misCursos.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>No tienes cursos inscriptos.</Text>
                ) : (
                    misCursos.map((inscripcion: any) => {
                        const curso = cursos[inscripcion.curso_id as keyof typeof cursos];
                        if (!curso) return null;
                        
                        const estadoColor = {
                            'por_empezar': '#FF7B6B',
                            'activo': '#28a745',
                            'finalizado': '#6c757d',
                            'dado_de_baja': '#dc3545'
                        };
                        
                        const estadoTexto = {
                            'por_empezar': 'Por empezar',
                            'activo': 'En curso',
                            'finalizado': 'Finalizado',
                            'dado_de_baja': 'Dado de baja'
                        };
                        
                        const estado = inscripcion.estado_calculado || inscripcion.estado || 'por_empezar';
                        
                        return (
                            <TouchableOpacity key={inscripcion.curso_id} style={styles.cursoCard} onPress={() => router.push({ pathname: '/views/curso-inscripto-detalle', params: { id: inscripcion.curso_id } })}>
                                <Image source={curso.imagen} style={styles.cursoImg} />
                                <View style={styles.cursoInfo}>
                                    <View style={styles.cursoTituloContainer}>
                                        <Text style={styles.cursoTitulo}>{curso.titulo}</Text>
                                        <View style={[styles.estadoBadge, { backgroundColor: estadoColor[estado as keyof typeof estadoColor] }]}>
                                            <Text style={styles.estadoTexto}>{estadoTexto[estado as keyof typeof estadoTexto]}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.cursoAutor}>Hecho por: {curso.autor}</Text>
                                    <Text style={styles.cursoHorario}>{inscripcion.curso_horario || curso.horario}</Text>
                                    <Text style={styles.cursoPrecio}>{inscripcion.curso_precio || curso.precio}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#333',
        paddingHorizontal: 40,
        paddingTop: 80,
        paddingBottom: 60,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        position: 'relative',
    },
    headerText: {
        color: 'white',
        fontSize: 28,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 10,
        zIndex: 10,
    },
    cursoCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 24,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    cursoImg: {
        width: 110,
        height: 110,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    cursoInfo: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    cursoTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    cursoAutor: {
        fontSize: 15,
        color: '#FF7B6B',
        marginBottom: 4,
    },
    cursoHorario: {
        fontSize: 14,
        color: '#999',
        marginBottom: 2,
    },
    cursoPrecio: {
        fontSize: 15,
        color: '#222',
        fontWeight: 'bold',
    },
    cursoTituloContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    estadoBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 8,
    },
    estadoTexto: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
    },
}); 