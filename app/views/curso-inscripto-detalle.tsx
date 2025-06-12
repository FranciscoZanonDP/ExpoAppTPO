import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const cursos = {
    curso1: {
        titulo: 'Pastelería Básica',
        autor: 'Zanon',
        imagen: require('../../assets/images/curso_panaderia.jpeg'),
        horario: 'Mie-22hs',
        precio: '$35.000',
        descripcion: 'Curso completo de pastelería básica, aprende desde cero.',
    },
    curso2: {
        titulo: 'Curso de Pastas',
        autor: 'Zanon',
        imagen: require('../../assets/images/curso_pastas.jpg'),
        horario: 'Jue-20hs',
        precio: '$30.000',
        descripcion: 'Descubre los secretos de la pasta casera y sus salsas.',
    },
    curso3: {
        titulo: 'Curso de Cocina Saludable',
        autor: 'Zanon',
        imagen: require('../../assets/images/curso_saludable.jpg'),
        horario: 'Vie-18hs',
        precio: '$28.000',
        descripcion: 'Cocina platos ricos y saludables para toda la familia.',
    },
};

export default function CursoInscriptoDetalleScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const curso = cursos[id as keyof typeof cursos];

    if (!curso) {
        return (
            <View style={styles.centered}>
                <Text style={{ color: '#FF7B6B', fontSize: 18 }}>Curso no encontrado</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.headerImageContainer}>
                <Image source={curso.imagen} style={styles.headerImage} />
                <View style={styles.headerOverlay} />
                <TouchableOpacity style={styles.backButtonContainer} onPress={() => router.replace('/views/mis-cursos')}>
                    <Ionicons name="arrow-back" size={32} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>{curso.titulo}</Text>
                    <Text style={styles.headerSubtitle}>Hecho por: {curso.autor}</Text>
                </View>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.infoLabel}>Horario:</Text>
                <Text style={styles.infoValue}>{curso.horario}</Text>
                <Text style={styles.infoLabel}>Precio:</Text>
                <Text style={styles.infoValue}>{curso.precio}</Text>
                <Text style={styles.infoLabel}>Descripción:</Text>
                <Text style={styles.infoValue}>{curso.descripcion}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerImageContainer: {
        width: '100%',
        height: 260,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000',
    },
    headerImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        resizeMode: 'cover',
    },
    headerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    backButtonContainer: {
        position: 'absolute',
        top: 32,
        left: 18,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 20,
        padding: 4,
    },
    headerTextContainer: {
        position: 'absolute',
        bottom: 32,
        width: '100%',
        alignItems: 'center',
        zIndex: 5,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
    },
    headerSubtitle: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '400',
    },
    infoContainer: {
        padding: 24,
    },
    infoLabel: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#FF7B6B',
        marginTop: 12,
    },
    infoValue: {
        fontSize: 16,
        color: '#222',
        marginBottom: 4,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
}); 