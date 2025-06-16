import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const sedesMock = [
  {
    nombre: 'Sede Centro',
    direccion: 'Av. Principal 123',
    telefono: '011-1234-5678',
    cursos: [
      {
        titulo: 'Pastelería Básica',
        fecha_inicio: '2024-07-10',
        fecha_fin: '2024-09-11',
        horario: 'Miércoles 22hs',
        modalidad: 'Presencial',
        arancel: '$35.000',
        promociones: '10% de descuento pagando en efectivo',
      },
      {
        titulo: 'Curso de Pastas',
        fecha_inicio: '2024-08-15',
        fecha_fin: '2024-10-15',
        horario: 'Jueves 20hs',
        modalidad: 'Presencial',
        arancel: '$30.000',
        promociones: '10% de descuento pagando en efectivo',
      },
    ],
  },
  {
    nombre: 'Sede Norte',
    direccion: 'Calle Falsa 456',
    telefono: '011-8765-4321',
    cursos: [
      {
        titulo: 'Curso de Cocina Saludable',
        fecha_inicio: '2024-09-01',
        fecha_fin: '2024-11-01',
        horario: 'Viernes 18hs',
        modalidad: 'Virtual',
        arancel: '$28.000',
        promociones: 'Descuento 15% para grupos',
      },
      {
        titulo: 'Curso de Pastas',
        fecha_inicio: '2024-08-15',
        fecha_fin: '2024-10-15',
        horario: 'Jueves 20hs',
        modalidad: 'Virtual',
        arancel: '$32.000',
        promociones: '2x1 para alumnos nuevos',
      },
    ],
  },
];

export default function SedesScreen() {
  const [sedeSeleccionada, setSedeSeleccionada] = useState<number | null>(null);
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#FF7B6B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sedes</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {sedeSeleccionada === null ? (
          sedesMock.map((sede, idx) => (
            <TouchableOpacity key={idx} style={styles.sedeCard} onPress={() => setSedeSeleccionada(idx)}>
              <Text style={styles.sedeNombre}>{sede.nombre}</Text>
              <Text style={styles.sedeDireccion}>{sede.direccion}</Text>
              <Text style={styles.sedeTelefono}>Tel: {sede.telefono}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View>
            <TouchableOpacity onPress={() => setSedeSeleccionada(null)} style={{ marginBottom: 16 }}>
              <Ionicons name="arrow-back" size={22} color="#FF7B6B" />
              <Text style={{ color: '#FF7B6B', fontWeight: 'bold', marginLeft: 4 }}>Volver a sedes</Text>
            </TouchableOpacity>
            <Text style={styles.sedeNombre}>{sedesMock[sedeSeleccionada].nombre}</Text>
            <Text style={styles.sedeDireccion}>{sedesMock[sedeSeleccionada].direccion}</Text>
            <Text style={styles.sedeTelefono}>Tel: {sedesMock[sedeSeleccionada].telefono}</Text>
            <Text style={styles.cursosTitle}>Cursos próximos 6 meses:</Text>
            {sedesMock[sedeSeleccionada].cursos.map((curso, idx) => (
              <View key={idx} style={styles.cursoCard}>
                <Text style={styles.cursoTitulo}>{curso.titulo}</Text>
                <Text style={styles.cursoDato}>Inicio: {curso.fecha_inicio} | Fin: {curso.fecha_fin}</Text>
                <Text style={styles.cursoDato}>Horario: {curso.horario}</Text>
                <Text style={styles.cursoDato}>Modalidad: {curso.modalidad}</Text>
                <Text style={styles.cursoDato}>Arancel: {curso.arancel}</Text>
                <Text style={styles.cursoPromo}>Promociones: {curso.promociones}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#FFF6F0',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backButton: {
    marginRight: 10,
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF7B6B',
  },
  sedeCard: {
    backgroundColor: '#FFF6F0',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    elevation: 2,
  },
  sedeNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D14B4B',
    marginBottom: 2,
  },
  sedeDireccion: {
    color: '#222',
    marginBottom: 2,
  },
  sedeTelefono: {
    color: '#666',
    marginBottom: 6,
  },
  cursosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 18,
    marginBottom: 8,
  },
  cursoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#FFD6D0',
  },
  cursoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF7B6B',
    marginBottom: 2,
  },
  cursoDato: {
    color: '#222',
    fontSize: 14,
    marginBottom: 1,
  },
  cursoPromo: {
    color: '#D14B4B',
    fontSize: 13,
    marginTop: 2,
  },
}); 