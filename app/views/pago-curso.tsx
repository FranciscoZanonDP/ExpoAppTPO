import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

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

export default function PagoCursoScreen() {
    const router = useRouter();
    const { id, sede } = useLocalSearchParams();
    const curso = cursos[id as keyof typeof cursos];
    // Estados para los inputs
    const [tarjeta, setTarjeta] = useState('');
    const [cvv, setCvv] = useState('');
    const [vencimiento, setVencimiento] = useState('');
    const [titular, setTitular] = useState('');
    const [cuotas, setCuotas] = useState('1');
    const precio = curso?.precio || '$--';

    useEffect(() => {
        if (!sede) {
            alert('Debes seleccionar una sede.');
            router.replace({ pathname: '/views/curso-detalle', params: { id } });
        }
    }, [sede]);

    const handlePagar = async () => {
        // Validación simple
        if (!tarjeta || !cvv || !vencimiento || !titular || !cuotas) {
            alert('Por favor completá todos los campos.');
            return;
        }
        try {
            const usuarioStr = await AsyncStorage.getItem('usuario');
            if (!usuarioStr) {
                alert('Debes estar logueado para inscribirte.');
                return;
            }
            const usuario = JSON.parse(usuarioStr);
            const cursoData = cursos[id as keyof typeof cursos];
            const sedeInfo = (cursoData?.sedes?.find(s => s.nombre === sede) || {}) as {
                horarios?: string;
                arancel?: string;
                modalidad?: string;
                promociones?: string;
                direccion?: string;
                telefono?: string;
            };
            const body = {
                usuario_email: usuario.email,
                curso_id: id,
                sede,
                curso_titulo: cursoData.titulo,
                curso_horario: sedeInfo.horarios,
                curso_precio: sedeInfo.arancel,
                curso_requisitos: cursoData.requisitos,
                curso_modalidad: sedeInfo.modalidad,
                curso_promociones: sedeInfo.promociones,
                curso_direccion: sedeInfo.direccion,
                curso_telefono: sedeInfo.telefono
            };
            const res = await fetch('https://expo-app-tpo.vercel.app/api/inscripciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const data = await res.json();
                if (data?.error?.includes('vacantes')) {
                    alert('No hay vacantes disponibles en esta sede. Por favor, elegí otra sede.');
                    router.replace({ pathname: '/views/curso-detalle', params: { id } });
                } else {
                    alert('Error al inscribirse.');
                }
                return;
            }
            router.replace({ pathname: '/views/inscripcion-realizada', params: { id } });
        } catch (e) {
            alert('Error de red o inesperado.');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* Botón volver */}
            <TouchableOpacity style={{ position: 'absolute', top: 40, left: 18, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 20, padding: 6 }} onPress={() => router.replace({ pathname: '/views/curso-detalle', params: { id } })}>
                <Ionicons name="arrow-back" size={28} color="#FF7B6B" />
            </TouchableOpacity>
            {/* Header con imagen y overlay */}
            <View style={styles.headerImageContainer}>
                <Image source={curso?.imagen} style={styles.headerImage} />
                <View style={styles.headerOverlay} />
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>{curso?.titulo}</Text>
                    <Text style={styles.headerSubtitle}>Hecho por: {curso?.autor}</Text>
                </View>
            </View>
            {/* Card de pago */}
            <View style={styles.pagoContainer}>
                <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
                    <Text style={styles.label}>Número de tarjeta</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej: 1234 5678 9012 3456"
                        placeholderTextColor="#bbb"
                        keyboardType="numeric"
                        maxLength={19}
                        value={tarjeta}
                        onChangeText={setTarjeta}
                    />
                    <View style={styles.inputRow}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.label}>CVV</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="cvv"
                                placeholderTextColor="#bbb"
                                keyboardType="numeric"
                                maxLength={4}
                                value={cvv}
                                onChangeText={setCvv}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Vencimiento</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="mm/yy"
                                placeholderTextColor="#bbb"
                                value={vencimiento}
                                onChangeText={setVencimiento}
                            />
                        </View>
                    </View>
                    <Text style={styles.label}>Titular</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre del titular"
                        placeholderTextColor="#bbb"
                        value={titular}
                        onChangeText={setTitular}
                    />
                    <Text style={styles.label}>Cantidad de pagos</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej: 1"
                        placeholderTextColor="#bbb"
                        keyboardType="numeric"
                        value={cuotas}
                        onChangeText={setCuotas}
                    />
                    <Text style={[styles.label, { marginTop: 16 }]}>Total a pagar</Text>
                    <Text style={{ fontSize: 18, color: '#222', marginBottom: 16 }}>{precio}</Text>
                    <TouchableOpacity style={styles.pagarBtn} onPress={handlePagar}>
                        <Text style={styles.pagarBtnText}>Pagar</Text>
                    </TouchableOpacity>
                </ScrollView>
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
    pagoContainer: {
        position: 'absolute',
        top: 200,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    inscribiteBtn: {
        alignSelf: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 32,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    inscribiteBtnText: {
        color: '#FF7B6B',
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center',
    },
    label: {
        color: '#FF7B6B',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 2,
        marginTop: 10,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#bbb',
        fontSize: 16,
        color: '#222',
        paddingVertical: 4,
        marginBottom: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#bbb',
        marginBottom: 8,
        paddingVertical: 4,
    },
    inputText: {
        fontSize: 18,
        color: '#222',
        flex: 1,
    },
    efectivoBtn: {
        marginTop: 18,
        marginBottom: 10,
        alignSelf: 'center',
    },
    efectivoBtnText: {
        color: '#222',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
    pagarBtn: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#222',
        borderRadius: 30,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    pagarBtnText: {
        color: '#222',
        fontWeight: 'bold',
        fontSize: 18,
    },
}); 