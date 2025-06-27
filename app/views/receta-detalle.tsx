import { StyleSheet, View, TouchableOpacity, Image, SafeAreaView, ScrollView, TextInput, Alert, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StarRating from '@/components/StarRating';
import BottomNavbar from '@/components/BottomNavbar';

export default function RecetaDetalleScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [receta, setReceta] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [esFavorito, setEsFavorito] = useState(false);
    const [usuarioId, setUsuarioId] = useState<string | null>(null);
    const [comentarios, setComentarios] = useState<any[]>([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [comentLoading, setComentLoading] = useState(false);
    const [porciones, setPorciones] = useState(1);
    const [ingredientesBase, setIngredientesBase] = useState<any[]>([]);
    const [ingredientes, setIngredientes] = useState<any[]>([]);
    const [porcionesInput, setPorcionesInput] = useState('1');
    const [ingredientesInput, setIngredientesInput] = useState<string[]>([]);
    const [valoraciones, setValoraciones] = useState<any>({ promedio: 0, total_valoraciones: 0 });
    const [valoracionesLoaded, setValoracionesLoaded] = useState(false);

    useEffect(() => {
        // Resetear estados de valoraciones cuando cambia la receta
        setValoraciones({ promedio: 0, total_valoraciones: 0 });
        setValoracionesLoaded(false);
        
        const fetchReceta = async () => {
            if (params.id) {
                setLoading(true);
                const res = await fetch(`https://expo-app-tpo.vercel.app/api/recetas?id=${params.id}`);
                const data = await res.json();
                setReceta(data);
                setPorciones(1);
                setPorcionesInput('1');
                let ings = Array.isArray(data.ingredientes) ? data.ingredientes : [];
                setIngredientesBase(ings);
                setIngredientes(ings);
                setLoading(false);
            } else {
                setReceta(params);
                setPorciones(1);
                setPorcionesInput('1');
                let ings: any[] = [];
                if (Array.isArray(params.ingredientes)) ings = params.ingredientes as any[];
                else if (typeof params.ingredientes === 'string') {
                    try { ings = JSON.parse(params.ingredientes); } catch { ings = []; }
                }
                setIngredientesBase(ings);
                setIngredientes(ings);
                setLoading(false);
            }
        };
        const fetchUsuario = async () => {
            const usuarioStr = await AsyncStorage.getItem('usuario');
            if (usuarioStr) {
                const usuario = JSON.parse(usuarioStr);
                setUsuarioId(usuario.id);
            }
        };
        fetchReceta();
        fetchUsuario();
    }, [params.id]);

    useEffect(() => {
        // Ver si la receta es favorita
        const checkFavorito = async () => {
            if (!usuarioId || !receta?.id) return;
            const res = await fetch(`https://expo-app-tpo.vercel.app/api/favoritos?usuario_id=${usuarioId}`);
            const data = await res.json();
            if (data.favoritos?.some((f: any) => f.id === receta.id)) setEsFavorito(true);
            else setEsFavorito(false);
        };
        checkFavorito();
    }, [usuarioId, receta?.id]);

    useEffect(() => {
        // Traer comentarios solo al montar el componente
        const fetchComentarios = async () => {
            if (!params.id) return;
            const res = await fetch(`https://expo-app-tpo.vercel.app/api/comentarios?receta_id=${params.id}`);
            const data = await res.json();
            setComentarios(data.comentarios || []);
        };
        
        fetchComentarios();
    }, [params.id]);

    // Usar useFocusEffect para actualizar valoraciones cada vez que se enfoque la pantalla
    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            
            const fetchValoraciones = async () => {
                if (!params.id) return;
                try {
                    const res = await fetch(`https://expo-app-tpo.vercel.app/api/recetas?action=valoraciones&receta_id=${params.id}`);
                    const data = await res.json();
                    console.log('Valoraciones data (focus):', data); // Debug log
                    if (isActive) {
                        setValoraciones(data);
                        setValoracionesLoaded(true);
                    }
                } catch (error) {
                    console.error('Error fetching valoraciones:', error);
                }
            };
            
            fetchValoraciones();
            
            return () => {
                isActive = false;
            };
        }, [params.id])
    );

    useEffect(() => {
        setIngredientesInput(ingredientes.map(ing => ing.cantidad?.toString() || ''));
    }, [ingredientesBase, ingredientes.length]);

    const handleToggleFavorito = async () => {
        if (!usuarioId || !receta?.id) return;
        if (esFavorito) {
            await fetch('https://expo-app-tpo.vercel.app/api/favoritos', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id: usuarioId, receta_id: receta.id })
            });
            setEsFavorito(false);
        } else {
            await fetch('https://expo-app-tpo.vercel.app/api/favoritos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id: usuarioId, receta_id: receta.id })
            });
            setEsFavorito(true);
        }
    };

    const handleComentar = async () => {
        if (!usuarioId || !nuevoComentario.trim() || !receta?.id) return;
        setComentLoading(true);
        await fetch('https://expo-app-tpo.vercel.app/api/comentarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receta_id: receta.id, usuario_id: usuarioId, texto: nuevoComentario })
        });
        setNuevoComentario('');
        // Refrescar comentarios
        const res = await fetch(`https://expo-app-tpo.vercel.app/api/comentarios?receta_id=${receta.id}`);
        const data = await res.json();
        setComentarios(data.comentarios || []);
        setComentLoading(false);
    };

    const handleVerComentarios = () => {
        router.push({ pathname: '/views/receta-comentarios', params: { id: receta.id } });
    };

    // Mejor experiencia de input para porciones
    const handlePorcionesInputChange = (value: string) => {
        setPorcionesInput(value.replace(/[^0-9]/g, ''));
    };
    const handlePorcionesInputEnd = () => {
        let n = parseInt(porcionesInput);
        if (isNaN(n) || n < 1) n = 1;
        setPorciones(n);
        setPorcionesInput(n.toString());
        const nuevosIngredientes = ingredientesBase.map(ing => ({ ...ing, cantidad: (parseFloat(ing.cantidad) * n).toFixed(2) }));
        setIngredientes(nuevosIngredientes);
        setIngredientesInput(nuevosIngredientes.map(ing => ing.cantidad?.toString() || ''));
    };

    // Mejor experiencia de input para ingredientes
    const handleIngredienteInputChange = (idx: number, value: string) => {
        setIngredientesInput(inputs => {
            const arr = [...inputs];
            arr[idx] = value.replace(/[^0-9.,]/g, '');
            return arr;
        });
    };
    const handleIngredienteInputEnd = (idx: number) => {
        let cantidadNueva = parseFloat((ingredientesInput[idx] || '').replace(',', '.'));
        if (isNaN(cantidadNueva) || cantidadNueva < 0) cantidadNueva = 0;
        const cantidadBase = parseFloat(ingredientesBase[idx].cantidad);
        if (cantidadBase === 0) return;
        const factor = cantidadNueva / cantidadBase;
        setPorciones(factor);
        setPorcionesInput(factor.toString());
        const nuevosIngredientes = ingredientesBase.map(ing => ({ ...ing, cantidad: (parseFloat(ing.cantidad) * factor).toFixed(2) }));
        setIngredientes(nuevosIngredientes);
        setIngredientesInput(nuevosIngredientes.map(ing => ing.cantidad?.toString() || ''));
    };

    // Función para guardar receta ajustada localmente (máximo 10)
    const guardarRecetaAjustada = async () => {
        try {
            const recetaAjustada = {
                id: receta.id,
                nombre: receta.nombre,
                usuario_nombre: receta.usuario_nombre,
                categoria: receta.categoria,
                descripcion: receta.descripcion,
                imagen_url: receta.imagen_url,
                ingredientes: ingredientes,
                porciones: porciones,
                fecha: Date.now(),
            };
            const key = 'recetasAjustadas';
            const guardadasStr = await AsyncStorage.getItem(key);
            let guardadas = [];
            if (guardadasStr) guardadas = JSON.parse(guardadasStr);
            // Si ya existe una receta con el mismo id y porciones, reemplazarla
            guardadas = guardadas.filter((r: any) => !(r.id === recetaAjustada.id && r.porciones === recetaAjustada.porciones));
            // Si hay más de 9, eliminar la más antigua
            if (guardadas.length >= 10) {
                guardadas.sort((a: any, b: any) => a.fecha - b.fecha);
                guardadas.shift();
            }
            guardadas.push(recetaAjustada);
            await AsyncStorage.setItem(key, JSON.stringify(guardadas));
            Alert.alert('¡Listo!', 'Receta ajustada guardada localmente.');
        } catch (e) {
            Alert.alert('Error', 'No se pudo guardar la receta ajustada.');
        }
    };

    if (loading || !receta) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}><ThemedText>Cargando...</ThemedText></View>;
    }

    const imagenes = Array.isArray(receta.imagenes) && receta.imagenes.length > 0 ? receta.imagenes : [receta.imagen_url];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
            <View style={{ flex: 1 }}>
                <ScrollView style={{ flex: 1, backgroundColor: 'transparent' }} contentContainerStyle={{ paddingBottom: 0, flexGrow: 1 }}>
                    {/* Imagen principal */}
                    <View style={{ alignItems: 'center', position: 'relative' }}>
                        <FlatList
                            data={imagenes}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, idx) => item + idx}
                            renderItem={({ item }) => (
                                <Image source={item ? { uri: item } : require('../../assets/images/tortadebanana.jpg')} style={styles.mainImage} />
                            )}
                            style={{ maxHeight: 320 }}
                        />
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={32} color="white" />
                        </TouchableOpacity>
                        {/* Favorito y comentarios */}
                        <View style={styles.topRightIcons}>
                            <TouchableOpacity style={styles.iconCircle} onPress={handleToggleFavorito}>
                                <Ionicons name={esFavorito ? 'heart' : 'heart-outline'} size={28} color="#FF7B6B" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconCircle} onPress={handleVerComentarios}>
                                <Ionicons name="chatbubble" size={28} color="#FF7B6B" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* Card blanca con info */}
                    <View style={[styles.infoCard, { flex: 1, minHeight: undefined }]}>
                        <ThemedText style={styles.authorText}>By {receta.usuario_nombre}</ThemedText>
                        <ThemedText style={styles.titleText}>{receta.nombre}</ThemedText>
                        <ThemedText style={styles.categoryText}>{receta.categoria}</ThemedText>
                        
                        {/* Valoraciones */}
                        {valoracionesLoaded && (
                            <View style={styles.valoracionesContainer}>
                                <StarRating 
                                    rating={parseFloat(valoraciones.promedio) || 0}
                                    readonly={true}
                                    size={20}
                                    showText={true}
                                    totalReviews={valoraciones.total_valoraciones || 0}
                                    style={{ marginBottom: 10 }}
                                />
                            </View>
                        )}
                        
                        {receta.descripcion ? (
                            <ThemedText style={styles.descripcionText}>{receta.descripcion}</ThemedText>
                        ) : null}
                        <View style={styles.ingredientesHeaderRow}>
                            <ThemedText style={styles.ingredientesTitle}>Ingredientes ({ingredientes?.length || 0})</ThemedText>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TextInput
                                    style={styles.porcionInput}
                                    value={porcionesInput}
                                    onChangeText={handlePorcionesInputChange}
                                    onBlur={handlePorcionesInputEnd}
                                    onSubmitEditing={handlePorcionesInputEnd}
                                    keyboardType="numeric"
                                    editable={!!usuarioId}
                                />
                                <ThemedText style={styles.porcionText}>porciones</ThemedText>
                            </View>
                        </View>
                        {/* Ingredientes */}
                        <View style={{ marginBottom: 30 }}>
                            {ingredientes.map((ing: any, idx: number) => (
                                <View key={idx} style={styles.ingredienteRow}>
                                    <View style={styles.bulletPoint} />
                                    <ThemedText style={styles.ingredienteNombre}>{ing?.nombre || ''}</ThemedText>
                                    <View style={styles.ingredienteCantidadBox}>
                                        <TextInput
                                            style={styles.ingredienteCantidadInput}
                                            value={ingredientesInput[idx] || ''}
                                            onChangeText={value => handleIngredienteInputChange(idx, value)}
                                            onBlur={() => handleIngredienteInputEnd(idx)}
                                            onSubmitEditing={() => handleIngredienteInputEnd(idx)}
                                            keyboardType="numeric"
                                            editable={!!usuarioId}
                                        />
                                        <ThemedText style={styles.ingredienteCantidad}> {ing?.unidad || ''}</ThemedText>
                                    </View>
                                </View>
                            ))}
                        </View>
                        {/* Botón para guardar receta ajustada localmente */}
                        <TouchableOpacity style={[styles.empezarBtn, { backgroundColor: '#FF7B6B', marginBottom: 10 }]} onPress={guardarRecetaAjustada}>
                            <ThemedText style={styles.empezarBtnText}>Guardar receta ajustada</ThemedText>
                        </TouchableOpacity>
                        {/* Fin botón guardar */}
                        <TouchableOpacity style={styles.empezarBtn} onPress={() => router.push({ pathname: '/views/receta-pasos', params: { id: receta.id } })}>
                            <ThemedText style={styles.empezarBtnText}>Empezar</ThemedText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
            {/* Footer unificado */}
            <BottomNavbar currentScreen="home" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainImage: {
        width: '100%',
        height: 320,
        resizeMode: 'cover',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 20,
        padding: 6,
        zIndex: 10,
    },
    topRightIcons: {
        position: 'absolute',
        top: 40,
        right: 20,
        flexDirection: 'column',
        gap: 12,
    },
    iconCircle: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 6,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoCard: {
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: -40,
        padding: 30,
        flex: 1,
    },
    authorText: {
        color: '#FF7B6B',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    titleText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 2,
    },
    categoryText: {
        color: '#FF7B6B',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 18,
    },
    ingredientesHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    ingredientesTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
    },
    porcionText: {
        color: '#FF7B6B',
        fontWeight: 'bold',
        fontSize: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    ingredienteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        marginLeft: 4,
    },
    bulletPoint: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF7B6B',
        marginRight: 16,
    },
    ingredienteNombre: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        flex: 1,
    },
    ingredienteCantidadBox: {
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginLeft: 10,
    },
    ingredienteCantidad: {
        color: '#999',
        fontWeight: 'bold',
        fontSize: 16,
    },
    empezarBtn: {
        backgroundColor: '#FF7B6B',
        borderRadius: 30,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 10,
    },
    empezarBtnText: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },

    porcionInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 6,
        fontWeight: 'bold',
        fontSize: 16,
        color: '#FF7B6B',
        minWidth: 40,
        textAlign: 'center',
    },
    ingredienteCantidadInput: {
        color: '#999',
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 40,
        textAlign: 'center',
        marginRight: 2,
    },
    descripcionText: {
        color: '#444',
        fontSize: 16,
        marginBottom: 16,
        marginTop: 4,
    },
    valoracionesContainer: {
        alignItems: 'center',
        marginVertical: 8,
    },
}); 