import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

const cursos = {
    curso1: {
        titulo: 'Pastelería Básica',
        autor: 'Zanon',
        imagen: require('../../assets/images/curso_panaderia.jpeg'),
        precio: '$35.000',
    },
    curso2: {
        titulo: 'Curso de Pastas',
        autor: 'Zanon',
        imagen: require('../../assets/images/curso_pastas.jpg'),
        precio: '$30.000',
    },
    curso3: {
        titulo: 'Curso de Cocina Saludable',
        autor: 'Zanon',
        imagen: require('../../assets/images/curso_saludable.jpg'),
        precio: '$28.000',
    },
};

export default function PagoCursoScreen() {
    const router = useRouter();
    const { id, sede } = useLocalSearchParams();
    const curso = cursos[id as keyof typeof cursos];
    const tarjeta = '******** 4512';
    const precio = curso?.precio || '$--';

    useEffect(() => {
        if (!sede) {
            alert('Debes seleccionar una sede.');
            router.replace({ pathname: '/views/curso-detalle', params: { id } });
        }
    }, [sede]);

    const handlePagar = async () => {
        try {
            const usuarioStr = await AsyncStorage.getItem('usuario');
            if (!usuarioStr) {
                alert('Debes estar logueado para inscribirte.');
                return;
            }
            const usuario = JSON.parse(usuarioStr);
            const res = await fetch('https://expo-app-tpo.vercel.app/api/inscripciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_email: usuario.email, curso_id: id, sede }),
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
                <TouchableOpacity style={styles.inscribiteBtn}>
                    <Text style={styles.inscribiteBtnText}>Inscribite</Text>
                </TouchableOpacity>
                <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
                    <Text style={styles.label}>Seleccionar tarjeta</Text>
                    <View style={styles.inputRow}>
                        <Text style={styles.inputText}>{tarjeta}</Text>
                        <Ionicons name="chevron-down" size={22} color="#FF7B6B" />
                    </View>
                    <View style={styles.inputRow}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.label}>CVV</Text>
                            <TextInput style={styles.input} placeholder="cvv" placeholderTextColor="#bbb" keyboardType="numeric" maxLength={4} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Vencimiento</Text>
                            <TextInput style={styles.input} placeholder="mm/yy" placeholderTextColor="#bbb" />
                        </View>
                    </View>
                    <Text style={styles.label}>Titular</Text>
                    <TextInput style={styles.input} placeholder="Nombre del titular" placeholderTextColor="#bbb" />
                    <Text style={styles.label}>Cantidad de pagos</Text>
                    <View style={styles.inputRow}>
                        <Text style={[styles.inputText, { color: '#bbb' }]}>1 pago de {precio}</Text>
                        <Ionicons name="chevron-down" size={22} color="#FF7B6B" />
                    </View>
                    <TouchableOpacity style={styles.efectivoBtn}>
                        <Text style={styles.efectivoBtnText}>Pagar en efectivo/qr</Text>
                    </TouchableOpacity>
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