import { StyleSheet, View, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import BottomNavbar from '@/components/BottomNavbar';

export default function CursosVerMasScreen() {
    const router = useRouter();
    const [searchText, setSearchText] = useState('');

    const handleSearch = (text: string) => setSearchText(text);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Cursos</ThemedText>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar"
                            placeholderTextColor="white"
                            value={searchText}
                            onChangeText={handleSearch}
                        />
                    </View>
                </View>
                {/* Contenido */}
                <ScrollView style={styles.content}>
                    <View style={styles.grid}>
                        {/* Card ejemplo 1 */}
                        <View style={styles.row}>
                            <View style={styles.card}>
                                <Image source={require('../../assets/images/curso_panaderia.jpeg')} style={styles.cardImage} />
                                <ThemedText style={styles.cardTitle}>Pastelería básica</ThemedText>
                                <ThemedText style={styles.cardSubtitle}>Zanonin</ThemedText>
                            </View>
                            <View style={styles.card}>
                                <Image source={require('../../assets/images/helado.jpg')} style={styles.cardImage} />
                                <ThemedText style={styles.cardTitle}>Cómo hacer pastas..</ThemedText>
                                <ThemedText style={styles.cardSubtitle}>Duki CO</ThemedText>
                            </View>
                        </View>
                        {/* Card ejemplo 2 */}
                        <View style={styles.row}>
                            <View style={styles.card}>
                                <Image source={require('../../assets/images/curso_saludable.jpg')} style={styles.cardImage} />
                                <ThemedText style={styles.cardTitle}>Air fryer – guía ppc</ThemedText>
                                <ThemedText style={styles.cardSubtitle}>Tesla</ThemedText>
                            </View>
                            <View style={styles.card}>
                                <Image source={require('../../assets/images/curso_saludable.jpg')} style={styles.cardImage} />
                                <ThemedText style={styles.cardTitle}>Air fryer – guía ppc</ThemedText>
                                <ThemedText style={styles.cardSubtitle}>Tesla</ThemedText>
                            </View>
                        </View>
                        {/* Card ejemplo 3 */}
                        <View style={styles.row}>
                            <View style={styles.card}>
                                <Image source={require('../../assets/images/curso_saludable.jpg')} style={styles.cardImage} />
                                <ThemedText style={styles.cardTitle}>Air fryer – guía ppc</ThemedText>
                                <ThemedText style={styles.cardSubtitle}>Tesla</ThemedText>
                            </View>
                            <View style={styles.card}>
                                <Image source={require('../../assets/images/curso_saludable.jpg')} style={styles.cardImage} />
                                <ThemedText style={styles.cardTitle}>Air fryer – guía ppc</ThemedText>
                                <ThemedText style={styles.cardSubtitle}>Tesla</ThemedText>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                
                {/* Footer unificado */}
                <BottomNavbar currentScreen="home" />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#333',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        padding: 20,
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 30,
        textAlign: 'center',
    },
    searchContainer: {
        backgroundColor: '#FF7B6B',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        width: '100%',
        marginBottom: 10,
    },
    searchInput: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 15,
    },
    grid: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    card: {
        width: '48%',
        backgroundColor: 'white',
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardImage: {
        width: '100%',
        height: 120,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'left',
        width: '90%',
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#222',
        width: '90%',
        textAlign: 'left',
    },

    backButton: {
        position: 'absolute',
        left: 10,
        top: 20,
        zIndex: 10,
        padding: 8,
    },
}); 