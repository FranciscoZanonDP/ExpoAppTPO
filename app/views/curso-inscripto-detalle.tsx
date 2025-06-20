import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';

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
    const [loading, setLoading] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [usuario, setUsuario] = useState<any>(null);
    const curso = cursos[id as keyof typeof cursos];
    // Si no hay sede especificada, tomar la primera sede disponible
    const sedeInfo = sede 
        ? curso?.sedes?.find(s => s.nombre === sede)
        : curso?.sedes?.[0];

    // Función para extraer fecha de inicio del curso
    const getFechaInicio = () => {
        if (!curso.descripcion_completa) return null;
        const match = curso.descripcion_completa.match(/inicio:\s*(\d{2}-\d{2}-\d{2})/);
        if (match) {
            const [day, month, year] = match[1].split('-');
            return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        return null;
    };

    // Función para calcular políticas de reintegro
    const getPoliticaReintegro = () => {
        const fechaInicio = getFechaInicio();
        if (!fechaInicio) return { porcentaje: 0, descripcion: 'Sin información de fecha', opciones: [] };

        const hoy = new Date();
        const diffTime = fechaInicio.getTime() - hoy.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 10) {
            return { 
                porcentaje: 100, 
                descripcion: `${diffDays} días antes del inicio`,
                opciones: ['Reintegro a tarjeta', 'Crédito en cuenta corriente']
            };
        } else if (diffDays >= 1 && diffDays <= 9) {
            return { 
                porcentaje: 70, 
                descripcion: `${diffDays} días antes del inicio`,
                opciones: ['Reintegro a tarjeta', 'Crédito en cuenta corriente']
            };
        } else if (diffDays === 0) {
            return { 
                porcentaje: 50, 
                descripcion: 'Día de inicio',
                opciones: ['Reintegro a tarjeta', 'Crédito en cuenta corriente']
            };
        } else {
            return { 
                porcentaje: 0, 
                descripcion: 'Curso ya iniciado',
                opciones: []
            };
        }
    };

    const politicaReintegro = getPoliticaReintegro();

    // Obtener datos del usuario al cargar
    React.useEffect(() => {
        const getUsuario = async () => {
            const usuarioStr = await AsyncStorage.getItem('usuario');
            if (usuarioStr) {
                setUsuario(JSON.parse(usuarioStr));
            }
        };
        getUsuario();
    }, []);

    // Generar datos para el QR de asistencia
    const generarQRData = () => {
        const fechaHoy = new Date().toISOString().split('T')[0];
        const horaActual = new Date().toTimeString().split(' ')[0];
        
        return JSON.stringify({
            curso_id: id,
            usuario_email: usuario?.email || '',
            fecha: fechaHoy,
            hora: horaActual,
            sede: sedeInfo?.nombre || '',
            curso_titulo: curso.titulo,
            tipo: 'asistencia'
        });
    };

    const handleGenerarQR = () => {
        if (!usuario) {
            Alert.alert('Error', 'Usuario no encontrado');
            return;
        }
        setShowQR(true);
    };

    const handleDarseDeBaja = () => {
        const mensaje = politicaReintegro.porcentaje > 0 
            ? `¿Estás seguro que quieres darte de baja del curso "${curso.titulo}"?\n\nSegún las políticas de reintegro, te corresponde el ${politicaReintegro.porcentaje}% de reintegro (${politicaReintegro.descripcion}).`
            : `¿Estás seguro que quieres darte de baja del curso "${curso.titulo}"?\n\nAdvertencia: No corresponde reintegro (${politicaReintegro.descripcion}).`;

        Alert.alert(
            "Confirmar baja",
            mensaje,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Dar de baja",
                    style: "destructive",
                    onPress: () => {
                        if (politicaReintegro.porcentaje > 0 && politicaReintegro.opciones.length > 0) {
                            mostrarOpcionesReintegro();
                        } else {
                            procesarBaja('sin_reintegro');
                        }
                    }
                }
            ]
        );
    };

    const mostrarOpcionesReintegro = () => {
        Alert.alert(
            "Opciones de reintegro",
            `Tienes derecho al ${politicaReintegro.porcentaje}% de reintegro. ¿Cómo prefieres recibirlo?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Reintegro a tarjeta",
                    onPress: () => procesarBaja('tarjeta')
                },
                {
                    text: "Crédito en cuenta",
                    onPress: () => procesarBaja('credito')
                }
            ]
        );
    };

    const procesarBaja = async (tipoReintegro: string) => {
        setLoading(true);
        try {
            const usuarioStr = await AsyncStorage.getItem('usuario');
            if (!usuarioStr) {
                Alert.alert('Error', 'Usuario no encontrado');
                return;
            }
            const usuario = JSON.parse(usuarioStr);
            
            const response = await fetch('https://expo-app-tpo.vercel.app/api/inscripciones', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    usuario_email: usuario.email,
                    curso_id: id,
                    tipo_reintegro: tipoReintegro,
                    porcentaje_reintegro: politicaReintegro.porcentaje
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                Alert.alert(
                    'Baja exitosa',
                    'Te has dado de baja del curso exitosamente.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/views/mis-cursos')
                        }
                    ]
                );
            } else {
                Alert.alert('Error', data.error || 'Error al darse de baja');
            }
        } catch (error) {
            Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
            console.error('Error al darse de baja:', error);
        } finally {
            setLoading(false);
        }
    };

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
                    
                    {/* Políticas de Reintegro */}
                    <View style={styles.politicaContainer}>
                        <Text style={styles.politicaTitle}>Políticas de Reintegro</Text>
                        <View style={styles.politicaActual}>
                            <Ionicons 
                                name={politicaReintegro.porcentaje > 0 ? "checkmark-circle" : "close-circle"} 
                                size={20} 
                                color={politicaReintegro.porcentaje > 0 ? "#28a745" : "#dc3545"} 
                                style={styles.politicaIcon}
                            />
                            <View style={styles.politicaTexto}>
                                <Text style={[styles.politicaPorcentaje, 
                                    { color: politicaReintegro.porcentaje > 0 ? "#28a745" : "#dc3545" }
                                ]}>
                                    {politicaReintegro.porcentaje}% de reintegro
                                </Text>
                                <Text style={styles.politicaDescripcion}>{politicaReintegro.descripcion}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.politicaReglas}>
                            <Text style={styles.politicaReglasTitle}>Reglas generales:</Text>
                            <Text style={styles.politicaRegla}>• Hasta 10 días antes: 100% reintegro</Text>
                            <Text style={styles.politicaRegla}>• Entre 9 y 1 día antes: 70% reintegro</Text>
                            <Text style={styles.politicaRegla}>• El día de inicio: 50% reintegro</Text>
                            <Text style={styles.politicaRegla}>• Después del inicio: 0% reintegro</Text>
                        </View>
                    </View>
                    
                    {/* Botón de QR para asistencia (solo cursos presenciales) */}
                    {sedeInfo?.modalidad !== 'Virtual' && (
                        <TouchableOpacity 
                            style={styles.qrButton} 
                            onPress={handleGenerarQR}
                        >
                            <Ionicons name="qr-code-outline" size={20} color="#fff" style={styles.qrButtonIcon} />
                            <Text style={styles.qrButtonText}>Generar QR de Asistencia</Text>
                        </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity 
                        style={styles.bajaButton} 
                        onPress={handleDarseDeBaja}
                        disabled={loading}
                    >
                        <Ionicons name="exit-outline" size={20} color="#fff" style={styles.bajaButtonIcon} />
                        <Text style={styles.bajaButtonText}>
                            {loading ? 'Procesando...' : 'Darme de baja del curso'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            
            {/* Modal para mostrar QR */}
            <Modal
                visible={showQR}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowQR(false)}
            >
                <View style={styles.qrModalOverlay}>
                    <View style={styles.qrModalContainer}>
                        <View style={styles.qrModalHeader}>
                            <Text style={styles.qrModalTitle}>QR de Asistencia</Text>
                            <TouchableOpacity onPress={() => setShowQR(false)} style={styles.qrCloseButton}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.qrContainer}>
                            <QRCode
                                value={generarQRData()}
                                size={200}
                                color="#333"
                                backgroundColor="white"
                            />
                        </View>
                        
                        <View style={styles.qrInfo}>
                            <Text style={styles.qrInfoTitle}>{curso.titulo}</Text>
                            <Text style={styles.qrInfoText}>Sede: {sedeInfo?.nombre}</Text>
                            <Text style={styles.qrInfoText}>Fecha: {new Date().toLocaleDateString('es-AR')}</Text>
                            <Text style={styles.qrInfoText}>Hora: {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                        
                        <Text style={styles.qrInstructions}>
                            Muestra este código QR al docente para registrar tu asistencia
                        </Text>
                    </View>
                </View>
            </Modal>
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
    bajaButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    bajaButtonIcon: {
        marginRight: 8,
    },
    bajaButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    politicaContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    politicaTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    politicaActual: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    politicaIcon: {
        marginRight: 12,
    },
    politicaTexto: {
        flex: 1,
    },
    politicaPorcentaje: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    politicaDescripcion: {
        fontSize: 14,
        color: '#666',
    },
    politicaReglas: {
        paddingTop: 8,
    },
    politicaReglasTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 8,
    },
    politicaRegla: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    // Estilos para QR
    qrButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    qrButtonIcon: {
        marginRight: 8,
    },
    qrButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    qrModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrModalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        margin: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    qrModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    qrModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    qrCloseButton: {
        padding: 4,
    },
    qrContainer: {
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginBottom: 20,
    },
    qrInfo: {
        alignItems: 'center',
        marginBottom: 16,
    },
    qrInfoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    qrInfoText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    qrInstructions: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
        paddingHorizontal: 16,
    },
}); 