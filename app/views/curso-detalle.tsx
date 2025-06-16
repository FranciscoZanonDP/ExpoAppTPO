import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Modal, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const cursos = {
    curso1: {
        titulo: 'Pastelería Básica',
        autor: 'Zanon',
        precio: '$35.000',
        modalidad: 'Virtual',
        horario: 'Mie-22hs',
        descripcion_breve: 'Curso para aprender las bases de la pastelería.',
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
        imagen: require('../../assets/images/curso_panaderia.jpeg'),
    },
    curso2: {
        titulo: 'Curso de Pastas',
        autor: 'Zanon',
        precio: '$30.000',
        modalidad: 'Virtual',
        horario: 'Jue-20hs',
        descripcion_breve: 'Aprende a hacer pastas caseras y salsas tradicionales.',
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
        imagen: require('../../assets/images/curso_pastas.jpg'),
    },
    curso3: {
        titulo: 'Curso de Cocina Saludable',
        autor: 'Zanon',
        precio: '$28.000',
        modalidad: 'Virtual',
        horario: 'Vie-18hs',
        descripcion_breve: 'Cocina platos saludables y equilibrados.',
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
        imagen: require('../../assets/images/curso_saludable.jpg'),
    },
};

export default function CursoDetalleScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const curso = cursos[id as keyof typeof cursos];
    const [isLogged, setIsLogged] = React.useState<boolean | null>(null);
    const [tipoUsuario, setTipoUsuario] = React.useState<'visitante' | 'alumno' | null>(null);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [sedeSeleccionada, setSedeSeleccionada] = React.useState<string | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            AsyncStorage.getItem('usuario').then((usuario) => {
                if (!usuario) setTipoUsuario('visitante');
                else {
                    try {
                        const user = JSON.parse(usuario);
                        setTipoUsuario(user.userType?.toLowerCase() === 'alumno' ? 'alumno' : 'visitante');
                    } catch {
                        setTipoUsuario('visitante');
                    }
                }
            });
        }, [])
    );

    const handleInscribirse = () => {
        if (curso.sedes && curso.sedes.length > 1) {
            setModalVisible(true);
        } else if (curso.sedes && curso.sedes.length === 1) {
            router.push({ pathname: '/views/pago-curso', params: { id, sede: curso.sedes[0].nombre } });
        } else {
            alert('No hay sedes disponibles para este curso.');
        }
    };

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
            {/* Info scrollable */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }}>
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Descripción</Text>
                    <Text style={styles.infoText}>{tipoUsuario === 'visitante' ? curso.descripcion_breve : curso.descripcion_completa}</Text>
                </View>
                {tipoUsuario === 'alumno' && (
                    <>
                        <View style={styles.infoSection}>
                            <Text style={styles.infoTitle}>Objetivo</Text>
                            <Text style={styles.infoText}>{curso.objetivo}</Text>
                        </View>
                        <View style={styles.infoSection}>
                            <Text style={styles.infoTitle}>Temario</Text>
                            <Text style={styles.infoText}>{curso.temario}</Text>
                        </View>
                        <View style={styles.infoSection}>
                            <Text style={styles.infoTitle}>Prácticas</Text>
                            <Text style={styles.infoText}>{curso.practicas}</Text>
                        </View>
                        <View style={styles.infoSection}>
                            <Text style={styles.infoTitle}>Recomendaciones</Text>
                            <Text style={styles.infoText}>{curso.recomendaciones}</Text>
                        </View>
                        <View style={styles.infoSection}>
                            <Text style={styles.infoTitle}>Requisitos</Text>
                            <Text style={styles.infoText}>{curso.requisitos}</Text>
                            <Text style={styles.infoText}>Insumos provistos por: {curso.provee_insumos === 'empresa' ? 'La empresa' : 'El alumno'}</Text>
                        </View>
                        {/* Sedes */}
                        <View style={styles.infoSection}>
                            <Text style={styles.infoTitle}>Sedes disponibles</Text>
                            {curso.sedes?.map((sede, idx) => (
                                <View key={idx} style={{ marginBottom: 10, backgroundColor: '#FFF6F0', borderRadius: 10, padding: 10 }}>
                                    <Text style={{ fontWeight: 'bold', color: '#D14B4B' }}>{sede.nombre}</Text>
                                    <Text style={{ color: '#222' }}>Dirección: {sede.direccion}</Text>
                                    <Text style={{ color: '#222' }}>Teléfono: {sede.telefono}</Text>
                                    <Text style={{ color: '#222' }}>Horarios: {sede.horarios}</Text>
                                    <Text style={{ color: '#222' }}>Modalidad: {sede.modalidad}</Text>
                                    <Text style={{ color: '#222' }}>Arancel: {sede.arancel}</Text>
                                    <Text style={{ color: '#D14B4B' }}>Promociones: {sede.promociones}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}
                {/* Botón inscribirse o atrás */}
                {tipoUsuario !== 'alumno' ? (
                    <TouchableOpacity style={styles.inscribirseBtn} onPress={() => router.replace('/views/home')}>
                        <Text style={styles.inscribirseBtnText}>Atrás</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.inscribirseBtn} onPress={handleInscribirse}>
                        <Text style={styles.inscribirseBtnText}>Inscribirse</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
            {/* Modal selección de sede */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', alignItems:'center' }}>
                    <View style={{ backgroundColor:'#fff', borderRadius:16, padding:24, width:'80%' }}>
                        <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:12 }}>Seleccioná una sede</Text>
                        {curso.sedes?.map((sede, idx) => (
                            <Pressable key={idx} style={{ padding:12, borderBottomWidth:1, borderColor:'#eee' }} onPress={() => {
                                setModalVisible(false);
                                setSedeSeleccionada(sede.nombre);
                                router.push({ pathname: '/views/pago-curso', params: { id, sede: sede.nombre } });
                            }}>
                                <Text style={{ fontSize:16 }}>{sede.nombre} - {sede.horarios}</Text>
                                <Text style={{ color:'#888', fontSize:13 }}>{sede.direccion}</Text>
                            </Pressable>
                        ))}
                        <Pressable style={{ marginTop:16, alignSelf:'flex-end' }} onPress={() => setModalVisible(false)}>
                            <Text style={{ color:'#FF7B6B', fontWeight:'bold' }}>Cancelar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
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