import { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavbar from '@/components/BottomNavbar';

export default function AlumnoInfoScreen() {
    const [usuario, setUsuario] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUsuario = async () => {
            const usuarioStr = await AsyncStorage.getItem('usuario');
            if (usuarioStr) setUsuario(JSON.parse(usuarioStr));
        };
        fetchUsuario();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('usuario');
        router.replace('/views/login');
    };

    if (!usuario) return null;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/views/home')}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerText}>Informacion del usuario</ThemedText>
                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.infoItemRow}>
                        <Ionicons name="mail" size={20} color="#FF7B6B" style={styles.infoIcon} />
                        <ThemedText style={styles.infoItem}>{usuario.email}</ThemedText>
                    </View>
                    <View style={styles.infoItemRow}>
                        <Ionicons name="school" size={20} color="#FF7B6B" style={styles.infoIcon} />
                        <ThemedText style={styles.infoItem}>Alumno</ThemedText>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/views/user-favoritos')} style={styles.infoItemRow}>
                        <Ionicons name="star" size={20} color="#FF7B6B" style={styles.infoIcon} />
                        <ThemedText style={styles.infoItem}>Recetas favoritas</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/views/mis-recetas')} style={styles.infoItemRow}>
                        <Ionicons name="restaurant" size={20} color="#FF7B6B" style={styles.infoIcon} />
                        <ThemedText style={styles.infoItem}>Mis Recetas</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/views/mis-cursos')} style={styles.infoItemRow}>
                        <Ionicons name="school-outline" size={20} color="#FF7B6B" style={styles.infoIcon} />
                        <ThemedText style={styles.infoItem}>Mis Cursos</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/views/historial-pagos')} style={styles.infoItemRow}>
                        <Ionicons name="receipt-outline" size={20} color="#FF7B6B" style={styles.infoIcon} />
                        <ThemedText style={styles.infoItem}>Historial de Pagos</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/views/cuenta-corriente')} style={styles.infoItemRow}>
                        <Ionicons name="card-outline" size={20} color="#FF7B6B" style={styles.infoIcon} />
                        <ThemedText style={styles.infoItem}>Cuenta Corriente</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout} style={styles.infoItemRow}>
                        <Ionicons name="exit-outline" size={20} color="#FF7B6B" style={styles.infoIcon} />
                        <ThemedText style={styles.logoutText}>Cerrar Sesion</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
            
            {/* Navbar inferior */}
            <BottomNavbar currentScreen="profile" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { backgroundColor: '#333', paddingHorizontal: 40, paddingTop: 80, paddingBottom: 80, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, position: 'relative' },
    headerText: { color: 'white', fontSize: 28, textAlign: 'center', fontWeight: 'bold' },
    backButton: { position: 'absolute', top: 50, left: 10, zIndex: 10 },
    infoContainer: { marginTop: 40, paddingHorizontal: 30 },
    infoItem: { color: '#FF7B6B', fontSize: 20, marginBottom: 30 },
    logoutButton: { marginTop: 40 },
    logoutText: { color: '#FF7B6B', fontSize: 20 },
    infoItemRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, paddingLeft: 0 },
    infoIcon: { marginRight: 10, marginTop: 2 },
    safeArea: { flex: 1 },
}); 