import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BottomNavbarProps {
  currentScreen?: string;
}

export default function BottomNavbar({ currentScreen = 'home' }: BottomNavbarProps) {
  const router = useRouter();

  const handleTabPress = async (tab: string) => {
    console.log('Navegando a:', tab);

    if (tab === 'profile') {
      // Verifica si hay usuario logueado
      const usuarioStr = await AsyncStorage.getItem('usuario');
      if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        if (usuario.userType === 'Alumno') {
          router.push('/views/alumno-info');
        } else {
          router.push('/views/user-info');
        }
      } else {
        router.push('/views/login');
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

    if (tab === 'home') {
      router.replace('/views/home');
      return;
    }
    
    // Para otros tabs, mantener la funcionalidad actual
    console.log('Tab no implementado:', tab);
  };

  const getIconColor = (tab: string) => {
    return currentScreen === tab ? '#FF7B6B' : '#FF7B6B';
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity onPress={() => handleTabPress('home')}>
        <Ionicons 
          name="home" 
          size={32} 
          color={getIconColor('home')} 
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleTabPress('search')}>
        <Ionicons 
          name="search-outline" 
          size={32} 
          color={getIconColor('search')} 
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleTabPress('recipes')}>
        <Ionicons 
          name="restaurant-outline" 
          size={32} 
          color={getIconColor('recipes')} 
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleTabPress('profile')}>
        <Ionicons 
          name="person" 
          size={32} 
          color={getIconColor('profile')} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
}); 