import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
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
        descripcion_completa: 'inicio: 10-07-25 | finalización: 11-09-25\n1 clase semanal\nAlumnos debe traer sus insumos y utensillos. Aprenderás técnicas de masas, batidos y decoración profesional.',
        objetivo: 'Dominar las técnicas fundamentales de pastelería, desde la elaboración de masas y batidos básicos hasta la decoración profesional.',
        temario: 'Ingredientes y utensillos básicos - Masas quebradas - Técnicas de horneado - Rellenos y coberturas - Fundamentos de la decoración',
        practicas: 'Elaboración de tartas, bizcochuelos y decoración de tortas.',
        recomendaciones: 'Tener recipientes de distintos tamaños',
        requisitos: 'Batidora, bowls, espátula',
        provee_insumos: 'alumno',
        sedes: [
            {
                nombre: 'Sede Centro',
                direccion: 'Av. Principal 123',
                telefono: '011-1234-5678',
                horarios: 'Miércoles 22hs',
                modalidad: 'Presencial',
                arancel: '$35.000',
                promociones: '10% de descuento pagando en efectivo',
            },
            {
                nombre: 'Sede Norte',
                direccion: 'Calle Falsa 456',
                telefono: '011-8765-4321',
                horarios: 'Jueves 20hs',
                modalidad: 'Virtual',
                arancel: '$32.000',
                promociones: '2x1 para alumnos nuevos',
            },
        ],
    },
    curso2: {
        titulo: 'Curso de Pastas',
        autor: 'Zanon',
        imagen: require('../../assets/images/curso_pastas.jpg'),
        horario: 'Jue-20hs',
        precio: '$30.000',
        descripcion: 'Descubre los secretos de la pasta casera y sus salsas.',
        descripcion_completa: 'inicio: 15-08-25 | finalización: 15-10-25\n1 clase semanal\nAlumnos debe traer sus insumos y utensillos. Aprende técnicas de amasado, salsas y rellenos.',
        objetivo: 'Aprender a hacer pastas caseras y salsas tradicionales.',
        temario: 'Harinas - Técnicas de amasado - Salsas clásicas - Rellenos - Presentación',
        practicas: 'Preparación de pastas frescas y salsas.',
        recomendaciones: 'Tener palo de amasar y cuchillo afilado',
        requisitos: 'Harina, huevos, cuchillo',
        provee_insumos: 'alumno',
        sedes: [
            {
                nombre: 'Sede Centro',
                direccion: 'Av. Principal 123',
                telefono: '011-1234-5678',
                horarios: 'Jueves 20hs',
                modalidad: 'Presencial',
                arancel: '$30.000',
                promociones: '10% de descuento pagando en efectivo',
            },
        ],
    },
    curso3: {
        titulo: 'Curso de Cocina Saludable',
        autor: 'Zanon',
        imagen: require('../../assets/images/curso_saludable.jpg'),
        horario: 'Vie-18hs',
        precio: '$28.000',
        descripcion: 'Cocina platos ricos y saludables para toda la familia.',
        descripcion_completa: 'inicio: 01-09-25 | finalización: 01-11-25\n1 clase semanal\nAlumnos debe traer sus insumos y utensillos. Aprende técnicas de cocción saludable y menús balanceados.',
        objetivo: 'Cocinar platos saludables y equilibrados para toda la familia.',
        temario: 'Verduras - Técnicas de cocción saludable - Menús balanceados - Snacks saludables',
        practicas: 'Preparación de menús saludables y snacks.',
        recomendaciones: 'Tener procesadora o licuadora',
        requisitos: 'Verduras frescas, procesadora',
        provee_insumos: 'alumno',
        sedes: [
            {
                nombre: 'Sede Norte',
                direccion: 'Calle Falsa 456',
                telefono: '011-8765-4321',
                horarios: 'Viernes 18hs',
                modalidad: 'Virtual',
                arancel: '$28.000',
                promociones: 'Descuento 15% para grupos',
            },
        ],
    },
};

export default function CursoInscriptoDetalleScreen() {
    const router = useRouter();
    const { id, sede } = useLocalSearchParams();
    const curso = cursos[id as keyof typeof cursos];
    // Si no hay sede especificada, tomar la primera sede disponible
    const sedeInfo = sede 
        ? curso?.sedes?.find(s => s.nombre === sede)
        : curso?.sedes?.[0];

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
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>Sede:</Text>
                    <Text style={styles.infoValue}>{sedeInfo?.nombre || '-'}</Text>
                    <Text style={styles.infoLabel}>Dirección:</Text>
                    <Text style={styles.infoValue}>{sedeInfo?.direccion || '-'}</Text>
                    <Text style={styles.infoLabel}>Teléfono:</Text>
                    <Text style={styles.infoValue}>{sedeInfo?.telefono || '-'}</Text>
                    <Text style={styles.infoLabel}>Horario:</Text>
                    <Text style={styles.infoValue}>{sedeInfo?.horarios || curso.horario || '-'}</Text>
                    <Text style={styles.infoLabel}>Modalidad:</Text>
                    <Text style={styles.infoValue}>{sedeInfo?.modalidad || '-'}</Text>
                    <Text style={styles.infoLabel}>Arancel:</Text>
                    <Text style={styles.infoValue}>{sedeInfo?.arancel || curso.precio || '-'}</Text>
                    <Text style={styles.infoLabel}>Promociones:</Text>
                    <Text style={styles.infoValue}>{sedeInfo?.promociones || '-'}</Text>
                    <Text style={styles.infoLabel}>Requisitos:</Text>
                    <Text style={styles.infoValue}>{curso.requisitos || '-'}</Text>
                    <Text style={styles.infoLabel}>Descripción:</Text>
                    <Text style={styles.infoValue}>{curso.descripcion_completa || curso.descripcion || '-'}</Text>
                    <Text style={styles.infoLabel}>Objetivo:</Text>
                    <Text style={styles.infoValue}>{curso.objetivo || '-'}</Text>
                    <Text style={styles.infoLabel}>Temario:</Text>
                    <Text style={styles.infoValue}>{curso.temario || '-'}</Text>
                    <Text style={styles.infoLabel}>Prácticas:</Text>
                    <Text style={styles.infoValue}>{curso.practicas || '-'}</Text>
                    <Text style={styles.infoLabel}>Recomendaciones:</Text>
                    <Text style={styles.infoValue}>{curso.recomendaciones || '-'}</Text>
                    <Text style={styles.infoLabel}>Insumos provistos por:</Text>
                    <Text style={styles.infoValue}>{curso.provee_insumos === 'empresa' ? 'La empresa' : 'El alumno'}</Text>
                </View>
            </ScrollView>
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