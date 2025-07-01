import { StyleSheet, View, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Image, Modal, Pressable, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import NetworkWarning from '@/components/NetworkWarning';
import SyncStatus from '@/components/SyncStatus';
import BottomNavbar from '@/components/BottomNavbar';

const DEFAULT_IMAGE = "https://media.istockphoto.com/id/1409329028/es/vector/no-hay-imagen-disponible-marcador-de-posici%C3%B3n-miniatura-icono-dise%C3%B1o-de-ilustraci%C3%B3n.jpg?s=612x612&w=0&k=20&c=Bd89b8CBr-IXx9mBbTidc-wu_gtIj8Py_EMr3hGGaPw=";

export default function HomeScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [recetasPopulares, setRecetasPopulares] = useState<any[]>([]);
  const [loadingRecetas, setLoadingRecetas] = useState(true);
  const [categoria, setCategoria] = useState('');
  const [ingredienteIncluye, setIngredienteIncluye] = useState('');
  const [ingredienteExcluye, setIngredienteExcluye] = useState('');
  const [usuario, setUsuario] = useState('');
  const [sort, setSort] = useState('nombre');
  const [order, setOrder] = useState('asc');
  const [modalVisible, setModalVisible] = useState(false);
  const [errorConexion, setErrorConexion] = useState(false);
  const [showNetworkWarning, setShowNetworkWarning] = useState(false);
  const [userPrefersWifi, setUserPrefersWifi] = useState(false);

  // Hook para gestión de red
  const { 
    networkStatus, 
    shouldShowDataWarning, 
    addPendingSync, 
    cacheData, 
    getCachedData, 
    isOffline,
    getPendingSyncCount,
    isSyncing,
    syncPendingData
  } = useNetworkStatus();

  const fetchRecetas = async () => {
    setLoadingRecetas(true);
    setErrorConexion(false);
    
    try {
      // Primero intentar obtener datos del cache
      const cachedRecetas = getCachedData('recetas_populares');
      if (cachedRecetas && !networkStatus.isConnected) {
        setRecetasPopulares(cachedRecetas);
        setLoadingRecetas(false);
        return;
      }

      const params = new URLSearchParams();
      if (searchText) params.append('nombre', searchText);
      if (categoria) params.append('categoria', categoria);
      if (ingredienteIncluye) params.append('ingrediente_incluye', ingredienteIncluye);
      if (ingredienteExcluye) params.append('ingrediente_excluye', ingredienteExcluye);
      if (usuario) params.append('usuario_nombre', usuario);
      params.append('limit', '3');
      params.append('estado', 'aprobada'); // Solo recetas aprobadas
      params.append('sort', 'fecha'); // Ordenar por fecha
      params.append('order', 'desc'); // Orden descendente (más recientes primero)
      
      const url = `https://expo-app-tpo.vercel.app/api/recetas?${params.toString()}`;
      console.log('🌐 Intentando cargar datos desde:', url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok && data.recetas) {
        setRecetasPopulares(data.recetas);
        // Guardar en cache para uso offline
        await cacheData('recetas_populares', data.recetas, 2); // Cache por 2 horas
        console.log('✅ Datos cargados exitosamente');
      } else {
        setRecetasPopulares([]);
        console.log('❌ No se pudieron cargar datos del servidor');
      }
    } catch (err) {
      console.log('🚨 Error al cargar datos:', err);
      // Si hay error de red, intentar usar cache
      const cachedRecetas = getCachedData('recetas_populares');
      if (cachedRecetas) {
        setRecetasPopulares(cachedRecetas);
        console.log('📱 Usando datos en cache debido a error de red');
      } else {
        setRecetasPopulares([]);
        setErrorConexion(true);
        console.log('❌ No hay datos en cache disponibles');
      }
      
      // Guardar la petición fallida para sincronizar después
      if (networkStatus.isConnected) {
        addPendingSync('fetch', 'https://expo-app-tpo.vercel.app/api/recetas', { 
          action: 'fetchRecetas', 
          params: { searchText, categoria, limit: 3, estado: 'aprobada' } 
        });
      }
    }
    setLoadingRecetas(false);
  };

  // Cargar preferencia del usuario sobre WiFi
  useEffect(() => {
    const loadUserPreference = async () => {
      try {
        const preference = await AsyncStorage.getItem('userPrefersWifi');
        setUserPrefersWifi(preference === 'true');
      } catch (error) {
        console.error('Error loading user preference:', error);
      }
    };
    loadUserPreference();
  }, []);

  // Verificar tipo de red y mostrar advertencia si es necesario
  useEffect(() => {
    console.log('🔍 Verificando estado de red:', {
      shouldShowDataWarning: shouldShowDataWarning(),
      isOffline: isOffline(),
      showNetworkWarning,
      userPrefersWifi,
      networkStatus
    });

    // Solo mostrar advertencia si:
    // 1. Hay datos móviles (no offline)
    // 2. El modal no está ya visible
    // 3. El usuario no ha elegido continuar previamente (userPrefersWifi !== false)
    // 4. La app ya está cargada (no bloquear carga inicial)
    if (shouldShowDataWarning() && !isOffline() && !showNetworkWarning && userPrefersWifi !== false) {
      console.log('⚠️ Mostrando modal de advertencia de red');
      // Pequeño delay para asegurar que la app esté cargada
      setTimeout(() => {
        setShowNetworkWarning(true);
      }, 1000);
    }
  }, [networkStatus, shouldShowDataWarning, showNetworkWarning, userPrefersWifi, isOffline]);

  // Efecto adicional para detectar cambios de red en tiempo real
  useEffect(() => {
    console.log('📡 Estado de red actualizado:', {
      isConnected: networkStatus.isConnected,
      isWifi: networkStatus.isWifi,
      isMobileData: networkStatus.isMobileData,
      type: networkStatus.type
    });
  }, [networkStatus]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      fetchRecetas();
      return () => { isActive = false; };
    }, [searchText, categoria, ingredienteIncluye, ingredienteExcluye, usuario, sort, order])
  );

  const handleSearch = (text: string) => {
    setSearchText(text);
    console.log('Buscando:', text);
  };

  const handleRecipePress = (receta: any) => {
    router.push({
      pathname: '/views/receta-detalle',
      params: { id: receta.id },
    });
  };

  const handleTabPress = async (tab: string) => {
    console.log('Navegando a:', tab);

    if (tab === 'profile') {
      // Verifica si hay usuario logueado
      const usuarioStr = await AsyncStorage.getItem('usuario');
      if (!usuarioStr) {
        console.log('❌ [Home] No hay usuario, redirigiendo a login');
        router.push('/views/login');
        return;
      }
      
      const usuario = JSON.parse(usuarioStr);
      if (usuario.userType === 'Alumno') {
        router.push('/views/alumno-info');
      } else {
        router.push('/views/user-info');
      }
      return;
    }
    
    if (tab === 'search') {
      // Navegar a la pantalla de búsqueda de recetas
      router.push('/views/recetas-ver-mas');
      return;
    }
    
    if (tab === 'recipes') {
      // Navegar a la pantalla de recetas
      router.push('/views/recetas-ver-mas');
      return;
    }
    
    // Para otros tabs, mantener la funcionalidad actual
    console.log('Tab no implementado:', tab);
  };

  const handleContinueWithMobileData = async () => {
    setShowNetworkWarning(false);
    // Guardar preferencia del usuario
    try {
      await AsyncStorage.setItem('userPrefersWifi', 'false');
      setUserPrefersWifi(false);
    } catch (error) {
      console.error('Error saving user preference:', error);
    }
    // Continuar con la carga de datos
    fetchRecetas();
  };

  const handleWaitForWifi = async () => {
    setShowNetworkWarning(false);
    // Guardar preferencia del usuario
    try {
      await AsyncStorage.setItem('userPrefersWifi', 'true');
      setUserPrefersWifi(true);
    } catch (error) {
      console.error('Error saving user preference:', error);
    }
    // No cargar datos, esperar a WiFi
  };

  // Función para resetear preferencias cuando cambie la red
  const resetNetworkPreferences = async () => {
    try {
      await AsyncStorage.removeItem('userPrefersWifi');
      setUserPrefersWifi(false);
      console.log('🔄 Preferencias de red reseteadas');
    } catch (error) {
      console.error('Error resetting network preferences:', error);
    }
  };

  // Efecto para resetear preferencias cuando cambie el tipo de red
  useEffect(() => {
    const resetPreferences = async () => {
      // Solo resetear si ya hay datos cargados y cambia a datos móviles
      if (networkStatus.isMobileData && networkStatus.isConnected && recetasPopulares.length > 0) {
        await resetNetworkPreferences();
      }
    };
    
    resetPreferences();
  }, [networkStatus.isMobileData, networkStatus.isConnected, recetasPopulares.length]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header con fondo oscuro */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>
              Recetas, clases{'\n'}de cocina y más!
            </ThemedText>

            {/* Barra de búsqueda y filtros */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre"
                placeholderTextColor="white"
                value={searchText}
                onChangeText={setSearchText}
              />
              <Ionicons name="search" size={20} color="white" />
            </View>
          </View>
        </View>

        {/* Contenido principal */}
        <ScrollView style={styles.content}>
          {/* Sección de recetas populares */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recetas populares</ThemedText>
            <TouchableOpacity onPress={() => router.push({ pathname: '/views/recetas-ver-mas', params: { tipo: 'populares' } })}>
              <ThemedText style={styles.seeMoreText}>Ver Más</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Grid de recetas */}
          <View style={styles.recipesGrid}>
            {errorConexion ? (
              <ThemedText style={{ textAlign: 'center', color: 'red', marginVertical: 20, fontWeight: 'bold' }}>
                No se puede usar la aplicación
              </ThemedText>
            ) : loadingRecetas ? (
              <ThemedText style={{ textAlign: 'center', color: '#999', marginVertical: 20 }}>Cargando recetas...</ThemedText>
            ) : recetasPopulares.length === 0 ? (
              <ThemedText style={{ textAlign: 'center', color: '#999', marginVertical: 20 }}>No hay recetas populares.</ThemedText>
            ) : (
              recetasPopulares.reduce((rows: any[][], receta: any, idx: number) => {
                if (idx % 2 === 0) rows.push([receta]);
                else rows[rows.length - 1].push(receta);
                return rows;
              }, []).map((row, rowIdx) => (
                <View style={styles.row} key={rowIdx}>
                  {row.map((receta: any) => (
                    <TouchableOpacity
                      style={styles.recipeCard}
                      key={receta.id}
                      onPress={() => handleRecipePress(receta)}
                    >
                      <Image
                        source={receta.imagen_url ? { uri: receta.imagen_url } : { uri: DEFAULT_IMAGE }}
                        style={styles.recipeImage}
                      />
                      <View style={styles.recipeInfo}>
                        <ThemedText style={styles.recipeTitle}>{receta.nombre}</ThemedText>
                        <ThemedText style={styles.recipeCategory}>{receta.categoria}</ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))
            )}
          </View>

          {/* Sección de cursos populares */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Cursos populares</ThemedText>
            <TouchableOpacity onPress={() => router.push('/views/cursos-ver-mas')}>
              <ThemedText style={styles.seeMoreText}>Ver Más</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Grid de cursos */}
          <View style={styles.recipesGrid}>
            <View style={styles.row}>
              {/* Curso 1 */}
              <TouchableOpacity style={styles.recipeCard} onPress={() => router.push({ pathname: '/views/curso-detalle', params: { id: 'curso1' } })}>
                <Image
                  source={require('../../assets/images/curso_panaderia.jpeg')}
                  style={styles.recipeImage}
                />
                <View style={styles.recipeInfo}>
                  <ThemedText style={styles.recipeTitle}>Curso de Panadería</ThemedText>
                  <ThemedText style={styles.recipeCategory}>Panadería</ThemedText>
                </View>
              </TouchableOpacity>
              {/* Curso 2 */}
              <TouchableOpacity style={styles.recipeCard} onPress={() => router.push({ pathname: '/views/curso-detalle', params: { id: 'curso2' } })}>
                <Image
                  source={require('../../assets/images/helado.jpg')}
                  style={styles.recipeImage}
                />
                <View style={styles.recipeInfo}>
                  <ThemedText style={styles.recipeTitle}>Curso de Pastas</ThemedText>
                  <ThemedText style={styles.recipeCategory}>Pastas</ThemedText>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              {/* Curso 3 */}
              <TouchableOpacity style={styles.recipeCard} onPress={() => router.push({ pathname: '/views/curso-detalle', params: { id: 'curso3' } })}>
                <Image
                  source={require('../../assets/images/curso_saludable.jpg')}
                  style={styles.recipeImage}
                />
                <View style={styles.recipeInfo}>
                  <ThemedText style={styles.recipeTitle}>Curso de Cocina Saludable</ThemedText>
                  <ThemedText style={styles.recipeCategory}>Saludable</ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Indicador de estado de sincronización */}
        <SyncStatus
          pendingSyncCount={getPendingSyncCount()}
          isSyncing={isSyncing}
          isOffline={isOffline()}
          onSyncPress={syncPendingData}
        />

        {/* Navegación inferior */}
        <BottomNavbar currentScreen="home" />

        {/* Modal de advertencia de red */}
        <NetworkWarning
          visible={showNetworkWarning}
          onContinue={handleContinueWithMobileData}
          onWaitForWifi={handleWaitForWifi}
          pendingSyncCount={getPendingSyncCount()}
          isOffline={isOffline()}
        />
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
    paddingTop: 0,
    paddingBottom: 0,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    height: 220,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 18,
  },
  searchContainer: {
    backgroundColor: '#FF7B6B',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 0,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeMoreText: {
    color: '#FF7B6B',
    fontSize: 14,
  },
  recipesGrid: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  recipeCard: {
    width: '48%',
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },

  recipeInfo: {
    padding: 10,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recipeCategory: {
    fontSize: 12,
    color: '#999',
  },
  footer: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  footerTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
});
