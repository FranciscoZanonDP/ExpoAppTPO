import { StyleSheet, View, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Image, Modal, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Picker } from '@react-native-picker/picker';
import BottomNavbar from '@/components/BottomNavbar';

const DEFAULT_IMAGE = "https://media.istockphoto.com/id/1409329028/es/vector/no-hay-imagen-disponible-marcador-de-posici%C3%B3n-miniatura-icono-dise%C3%B1o-de-ilustraci%C3%B3n.jpg?s=612x612&w=0&k=20&c=Bd89b8CBr-IXx9mBbTidc-wu_gtIj8Py_EMr3hGGaPw=";

export default function RecetasVerMasScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [searchText, setSearchText] = useState('');
    const [recetas, setRecetas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoria, setCategoria] = useState('');
    const [ingredienteIncluye, setIngredienteIncluye] = useState('');
    const [ingredienteExcluye, setIngredienteExcluye] = useState('');
    const [usuario, setUsuario] = useState('');
    const [sort, setSort] = useState('nombre');
    const [order, setOrder] = useState('asc');
    const [modalVisible, setModalVisible] = useState(false);
    
    // Determinar si viene desde "Recetas populares"
    const esRecetasPopulares = params.tipo === 'populares';
    const tituloHeader = esRecetasPopulares ? 'Recetas aprobadas' : 'Recetas';

    const fetchRecetas = async () => {
        setLoading(true);
        try {
            const urlParams = new URLSearchParams();
            if (searchText) {
                urlParams.append('nombre', searchText);
                urlParams.append('usuario_nombre', searchText);
            }
            if (categoria) urlParams.append('categoria', categoria);
            if (ingredienteIncluye) urlParams.append('ingrediente_incluye', ingredienteIncluye);
            if (ingredienteExcluye) urlParams.append('ingrediente_excluye', ingredienteExcluye);
            if (sort) urlParams.append('sort', sort);
            if (order) urlParams.append('order', order);
            
            // Si viene desde "Recetas populares", filtrar solo por estado aprobada
            if (esRecetasPopulares) {
                urlParams.append('estado', 'aprobada');
                console.log('🔍 Filtrando por recetas aprobadas');
            }
            
            const url = `https://expo-app-tpo.vercel.app/api/recetas?${urlParams.toString()}`;
            console.log('🌐 URL de consulta:', url);
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok && data.recetas) {
                setRecetas(data.recetas);
            } else {
                setRecetas([]);
            }
        } catch (err) {
            setRecetas([]);
        }
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            fetchRecetas();
            return () => { isActive = false; };
        }, [searchText, categoria, ingredienteIncluye, ingredienteExcluye, usuario, sort, order, esRecetasPopulares])
    );

    const handleSearch = (text: string) => setSearchText(text);
    const handleRecipePress = (receta: any) => {
        router.push({
            pathname: '/views/receta-detalle',
            params: { id: receta.id },
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>{tituloHeader}</ThemedText>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar por nombre o usuario"
                            placeholderTextColor="white"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>
                    <View style={[styles.filtroChipsRow, { justifyContent: 'center' }]}>
                        <TextInput
                            style={styles.filtroChip}
                            placeholder="Categoría"
                            placeholderTextColor="rgba(255,255,255,0.8)"
                            value={categoria}
                            onChangeText={setCategoria}
                        />
                        <TextInput
                            style={styles.filtroChip}
                            placeholder="Ingrediente IN"
                            placeholderTextColor="rgba(255,255,255,0.8)"
                            value={ingredienteIncluye}
                            onChangeText={setIngredienteIncluye}
                        />
                        <TextInput
                            style={styles.filtroChip}
                            placeholder="Ingrediente OUT"
                            placeholderTextColor="rgba(255,255,255,0.8)"
                            value={ingredienteExcluye}
                            onChangeText={setIngredienteExcluye}
                        />
                    </View>
                </View>
                {/* Contenido */}
                <ScrollView style={styles.content}>
                    <View style={styles.grid}>
                        {loading ? (
                            <ThemedText style={{ textAlign: 'center', color: '#999', marginVertical: 20 }}>Cargando recetas...</ThemedText>
                        ) : recetas.length === 0 ? (
                            <ThemedText style={{ textAlign: 'center', color: '#999', marginVertical: 20 }}>No hay recetas.</ThemedText>
                        ) : (
                            recetas.reduce((rows: any[][], receta: any, idx: number) => {
                                if (idx % 2 === 0) rows.push([receta]);
                                else rows[rows.length - 1].push(receta);
                                return rows;
                            }, []).map((row, rowIdx) => (
                                <View style={styles.row} key={rowIdx}>
                                    {row.map((receta: any) => (
                                        <TouchableOpacity
                                            style={styles.card}
                                            key={receta.id}
                                            onPress={() => handleRecipePress(receta)}
                                        >
                                            <Image
                                                source={receta.imagen_url ? { uri: receta.imagen_url } : { uri: DEFAULT_IMAGE }}
                                                style={styles.cardImage}
                                            />
                                            <ThemedText style={styles.cardTitle}>{receta.nombre}</ThemedText>
                                            <ThemedText style={styles.cardCategory}>{receta.categoria}</ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
                
                {/* Footer unificado */}
                <BottomNavbar currentScreen="search" />
            </View>
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setModalVisible(false)}>
                    <View style={{ position: 'absolute', top: 180, left: 20, right: 20, backgroundColor: 'white', borderRadius: 16, padding: 20, elevation: 8 }}>
                        <Picker
                            selectedValue={sort}
                            style={{ color: '#333', marginBottom: 10 }}
                            onValueChange={(itemValue: string) => setSort(itemValue)}
                        >
                            <Picker.Item label="Ordenar por nombre" value="nombre" />
                            <Picker.Item label="Más nuevas" value="fecha" />
                            <Picker.Item label="Por usuario" value="usuario" />
                        </Picker>
                        <Picker
                            selectedValue={order}
                            style={{ color: '#333' }}
                            onValueChange={(itemValue: string) => setOrder(itemValue)}
                        >
                            <Picker.Item label="Ascendente" value="asc" />
                            <Picker.Item label="Descendente" value="desc" />
                        </Picker>
                    </View>
                </Pressable>
            </Modal>
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
        height: 220,
    },
    headerTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 16,
        marginTop: 40,
        textAlign: 'center',
    },
    searchContainer: {
        backgroundColor: '#FF7B6B',
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 0,
        marginBottom: 5,
    },
    searchInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        padding: 0,
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
    cardCategory: {
        fontSize: 13,
        color: '#bbb',
        width: '90%',
        textAlign: 'left',
        marginTop: 2,
    },

    backButton: {
        position: 'absolute',
        left: 10,
        top: 20,
        zIndex: 10,
        padding: 8,
    },
    filtroChipsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 0,
        marginBottom: 0,
        flexWrap: 'wrap',
        gap: 0,
    },
    filtroChip: {
        backgroundColor: '#FF7B6B',
        borderRadius: 18,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
        color: 'white',
        fontSize: 13,
        minWidth: 70,
        flex: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 2,
        elevation: 1,
    },
    pickerRow: {
        flexDirection: 'row',
        marginTop: 10,
        alignItems: 'center',
        gap: 8,
    },
    pickerEstetico: {
        flex: 1,
        color: '#333',
        backgroundColor: '#FFD6D0',
        borderRadius: 20,
        marginHorizontal: 2,
        height: 40,
    },
}); 