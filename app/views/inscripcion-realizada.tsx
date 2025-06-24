import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const cursos = {
    curso1: {
        titulo: 'Pastelería Básica',
        autor: 'Zanon',
        imagen: require('../../assets/images/curso_panaderia.jpeg'),
        inicio: '10-07-25',
        cierre: '11-09-25',
        clases: 'Mie - 22hs',
    },
    curso2: {
        titulo: 'Curso de Pastas',
        autor: 'Zanon',
        imagen: require('../../assets/images/helado.jpg'),
        inicio: '15-08-25',
        cierre: '15-10-25',
        clases: 'Jue - 20hs',
    },
    curso3: {
        titulo: 'Curso de Cocina Saludable',
        autor: 'Zanon',
        imagen: require('../../assets/images/curso_saludable.jpg'),
        inicio: '01-09-25',
        cierre: '01-11-25',
        clases: 'Vie - 18hs',
    },
};

export default function InscripcionRealizadaScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const curso = cursos[id as keyof typeof cursos];

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
            {/* Card de confirmación */}
            <View style={styles.confirmContainer}>
                <Text style={styles.confirmTitle}>Inscripción realizada!</Text>
                <View style={styles.infoRow}>
                    <View style={styles.infoCol}><Text style={styles.infoLabel}>Inicio</Text><Text style={styles.infoValue}>{curso?.inicio}</Text></View>
                    <View style={styles.infoCol}><Text style={styles.infoLabel}>Cierre</Text><Text style={styles.infoValue}>{curso?.cierre}</Text></View>
                    <View style={styles.infoCol}><Text style={styles.infoLabel}>Clases</Text><Text style={styles.infoValue}>{curso?.clases}</Text></View>
                </View>
                <TouchableOpacity style={styles.linkBtn} onPress={() => router.replace('/views/mis-cursos')}>
                    <Text style={styles.linkBtnText}>Ver "Mis cursos"</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.volverBtn} onPress={() => router.replace('/views/home')}>
                    <Text style={styles.volverBtnText}>Volver al inicio</Text>
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
    confirmContainer: {
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
        alignItems: 'center',
    },
    confirmTitle: {
        color: '#FF7B6B',
        fontWeight: 'bold',
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 24,
    },
    infoCol: {
        alignItems: 'center',
        flex: 1,
    },
    infoLabel: {
        backgroundColor: '#fff',
        color: '#222',
        fontWeight: 'bold',
        fontSize: 16,
        padding: 6,
        borderRadius: 10,
        marginBottom: 4,
        textAlign: 'center',
    },
    infoValue: {
        backgroundColor: '#fff',
        color: '#FF7B6B',
        fontWeight: 'bold',
        fontSize: 16,
        padding: 6,
        borderRadius: 10,
        textAlign: 'center',
    },
    linkBtn: {
        marginTop: 10,
        marginBottom: 18,
    },
    linkBtnText: {
        color: '#222',
        fontSize: 18,
        textDecorationLine: 'underline',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    volverBtn: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#222',
        borderRadius: 30,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
        width: '100%',
    },
    volverBtnText: {
        color: '#222',
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
    },
}); 