import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavbar from '@/components/BottomNavbar';

export default function CargarRecetaExitoScreen() {
    const router = useRouter();

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Cargar receta</Text>
            </View>
            <View style={styles.bodyContainer}>
                <Text style={styles.successText}>Receta cargada{"\n"}con éxito</Text>
                <TouchableOpacity onPress={() => router.replace('/views/mis-recetas')}>
                    <Text style={styles.linkText}>Ir a mis recetas</Text>
                </TouchableOpacity>
            </View>
            {/* Footer unificado */}
            <BottomNavbar currentScreen="recipes" />
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#333',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
    },
    bodyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successText: {
        fontSize: 28,
        color: 'black',
        textAlign: 'center',
        marginBottom: 30,
        fontWeight: '400',
    },
    linkText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 20,
        textDecorationLine: 'underline',
    },

}); 