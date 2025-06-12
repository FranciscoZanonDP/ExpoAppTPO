import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const { width } = Dimensions.get('window');

const cursos = {
    curso1: {
        titulo: 'Pastelería Básica',
        autor: 'Zanon',
        precio: '$35.000',
        modalidad: 'Virtual',
        horario: 'Mie-22hs',
        descripcion: 'inicio: 10-07-25 | finalización: 11-09-25\n1 clase semanal\nAlumnos debe traer sus insumos y utensillos',
        objetivo: 'Dominar las técnicas fundamentales de pastelería, desde la elaboración de masas y batidos básicos hasta la decoración profesional.',
        temario: 'Ingredientes y utensillos básicos - Masas quebradas - Técnicas de horneado - Rellenos y coberturas - Fundamentos de la decoración',
        recomendaciones: 'Tener recipientes de distintos tamaños',
        imagen: require('../../assets/images/curso_panaderia.jpeg'),
    },
    curso2: {
        titulo: 'Curso de Pastas',
        autor: 'Zanon',
        precio: '$30.000',
        modalidad: 'Virtual',
        horario: 'Jue-20hs',
        descripcion: 'inicio: 15-08-25 | finalización: 15-10-25\n1 clase semanal\nAlumnos debe traer sus insumos y utensillos',
        objetivo: 'Aprender a hacer pastas caseras y salsas tradicionales.',
        temario: 'Harinas - Técnicas de amasado - Salsas clásicas - Rellenos - Presentación',
        recomendaciones: 'Tener palo de amasar y cuchillo afilado',
        imagen: require('../../assets/images/curso_pastas.jpg'),
    },
    curso3: {
        titulo: 'Curso de Cocina Saludable',
        autor: 'Zanon',
        precio: '$28.000',
        modalidad: 'Virtual',
        horario: 'Vie-18hs',
        descripcion: 'inicio: 01-09-25 | finalización: 01-11-25\n1 clase semanal\nAlumnos debe traer sus insumos y utensillos',
        objetivo: 'Cocinar platos saludables y equilibrados para toda la familia.',
        temario: 'Verduras - Técnicas de cocción saludable - Menús balanceados - Snacks saludables',
        recomendaciones: 'Tener procesadora o licuadora',
        imagen: require('../../assets/images/curso_saludable.jpg'),
    },
};

export default function CursoDetalleScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const curso = cursos[id as keyof typeof cursos];
    const [isLogged, setIsLogged] = useState<boolean | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('usuario').then((usuario) => {
            setIsLogged(!!usuario);
        });
    }, []);

    if (!curso) {
        return (
            <View style={styles.centered}>
                <ThemedText style={{ color: '#FF7B6B', fontSize: 18 }}>Curso no encontrado</ThemedText>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* Imagen de fondo con overlay */}
            <View style={styles.headerImageContainer}>
                <Image source={curso.imagen} style={styles.headerImage} />
                <View style={styles.headerOverlay} />
                {/* Flecha */}
                <TouchableOpacity style={styles.backButtonContainer} onPress={() => router.replace('/views/home')}>
                    <Ionicons name="arrow-back" size={32} color="#fff" />
                </TouchableOpacity>
                {/* Iconos derecha */}
                <View style={styles.rightIcons}>
                    <TouchableOpacity style={styles.iconCircle}>
                        <Ionicons name="heart" size={24} color="#FF7B6B" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconCircle}>
                        <Ionicons name="chatbubble" size={24} color="#FF7B6B" />
                    </TouchableOpacity>
                </View>
                {/* Título y autor */}
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>{curso.titulo}</Text>
                    <Text style={styles.headerSubtitle}>Hecho por: {curso.autor}</Text>
                </View>
            </View>
            {/* Chips */}
            <View style={styles.chipsContainer}>
                <View style={styles.chip}><Text style={styles.chipText}>{curso.precio}</Text></View>
                <View style={styles.chip}><Text style={styles.chipText}>{curso.modalidad}</Text></View>
                <View style={styles.chip}><Text style={styles.chipText}>{curso.horario}</Text></View>
            </View>
            {/* Info scrollable */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }}>
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Descripción</Text>
                    <Text style={styles.infoText}>{curso.descripcion}</Text>
                </View>
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Objetivo</Text>
                    <Text style={styles.infoText}>{curso.objetivo}</Text>
                </View>
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Temario</Text>
                    <Text style={styles.infoText}>{curso.temario}</Text>
                </View>
                <View style={[styles.infoSection, styles.recomendSection]}>
                    <Text style={[styles.infoTitle, { color: '#D14B4B' }]}>Recomendaciones</Text>
                    <Text style={[styles.infoText, { color: '#222' }]}>{curso.recomendaciones}</Text>
                </View>
                {/* Botón inscribirse o atrás */}
                {isLogged === false ? (
                    <TouchableOpacity style={styles.inscribirseBtn} onPress={() => router.replace('/views/home')}>
                        <Text style={styles.inscribirseBtnText}>Atrás</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.inscribirseBtn} onPress={() => router.push({ pathname: '/views/pago-curso', params: { id } })}>
                        <Text style={styles.inscribirseBtnText}>Inscribirse</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
            {/* Footer navegación igual al home */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.footerTab} onPress={() => router.replace('/views/home')}>
                    <Ionicons name="home" size={28} color="#FF7B6B" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerTab}>
                    <Ionicons name="search" size={28} color="#FF7B6B" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerTab}>
                    <Ionicons name="restaurant" size={28} color="#FF7B6B" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerTab}>
                    <Ionicons name="person" size={28} color="#FF7B6B" />
                </TouchableOpacity>
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
    rightIcons: {
        position: 'absolute',
        top: 28,
        right: 18,
        flexDirection: 'column',
        gap: 12,
        zIndex: 10,
    },
    iconCircle: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 6,
        alignItems: 'center',
        marginBottom: 6,
        elevation: 2,
    },
    headerTextContainer: {
        position: 'absolute',
        bottom: 50,
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
    chipsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        marginTop: -38,
        marginBottom: 10,
        zIndex: 20,
    },
    chip: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 6,
        marginHorizontal: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    chipText: {
        color: '#FF7B6B',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    infoSection: {
        backgroundColor: '#F6F6F6',
        borderRadius: 20,
        marginHorizontal: 18,
        marginBottom: 14,
        padding: 16,
    },
    infoTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
        color: '#222',
    },
    infoText: {
        color: '#999',
        fontSize: 15,
        fontWeight: '400',
    },
    recomendSection: {
        backgroundColor: '#FFD6D0',
        marginBottom: 18,
    },
    inscribirseBtn: {
        marginHorizontal: 60,
        marginTop: 8,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#222',
        borderRadius: 30,
        paddingVertical: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    inscribirseBtnText: {
        color: '#222',
        fontWeight: 'bold',
        fontSize: 18,
    },
    footer: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        backgroundColor: '#fff',
    },
    footerTab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
}); 