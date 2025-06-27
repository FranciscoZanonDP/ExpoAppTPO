import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useReceta, PasoMedio } from '../RecetaContext';
import { PasoMediaManager } from '../components/PasoMediaManager';

export default function CargarRecetaPasosScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { receta, setReceta } = useReceta();
    const [pasos, setPasos] = useState(receta.pasos.length > 0 ? receta.pasos.map(p => ({ descripcion: p.descripcion, medios: p.medios || [] })) : []);
    const [nuevoPaso, setNuevoPaso] = useState('');
    const [editIndex, setEditIndex] = useState(-1);
    const [editText, setEditText] = useState('');
    const [expandedStep, setExpandedStep] = useState<number | null>(null);

    useEffect(() => {
        if (params.reset) {
            setPasos([]);
        }
    }, [params.reset]);

    const handleAddPaso = () => {
        if (nuevoPaso.trim() !== '') {
            setPasos([...pasos, { descripcion: nuevoPaso.trim(), medios: [] }]);
            setNuevoPaso('');
        }
    };

    const handleRemovePaso = (index: number) => {
        const nuevosPasos = [...pasos];
        nuevosPasos.splice(index, 1);
        setPasos(nuevosPasos);
        if (expandedStep === index) {
            setExpandedStep(null);
        } else if (expandedStep !== null && expandedStep > index) {
            setExpandedStep(expandedStep - 1);
        }
    };

    const handleStartEdit = (index: number) => {
        setEditIndex(index);
        setEditText(pasos[index].descripcion);
    };

    const handleEndEdit = () => {
        if (editText.trim() !== '') {
            const nuevosPasos = [...pasos];
            nuevosPasos[editIndex] = { ...nuevosPasos[editIndex], descripcion: editText.trim() };
            setPasos(nuevosPasos);
        }
        setEditIndex(-1);
        setEditText('');
    };

    const handleMediosChange = (index: number, medios: PasoMedio[]) => {
        const nuevosPasos = [...pasos];
        nuevosPasos[index] = { ...nuevosPasos[index], medios };
        setPasos(nuevosPasos);
    };

    const toggleExpandStep = (index: number) => {
        setExpandedStep(expandedStep === index ? null : index);
    };

    const handleSiguiente = () => {
        const pasosFinales = pasos.map(p => ({ 
            descripcion: p.descripcion, 
            imagen: null, 
            video: null,
            medios: p.medios 
        }));
        setReceta(prev => ({
            ...prev,
            pasos: pasosFinales,
        }));
        router.push({ pathname: '/views/cargar-receta-resumen' });
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'white' }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Cargar receta</Text>
            </View>
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/views/cargar-receta-2')}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Pasos de la Receta</Text>
                <Text style={styles.subtitle}>Agrega y organiza los pasos de tu receta</Text>

                <View style={styles.addStepContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Describe el siguiente paso de tu receta..."
                        value={nuevoPaso}
                        onChangeText={setNuevoPaso}
                        onSubmitEditing={handleAddPaso}
                        returnKeyType="done"
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleAddPaso}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                {pasos.map((paso, index) => (
                    <View key={index} style={styles.stepContainer}>
                        {editIndex === index ? (
                            <View style={styles.editView}>
                                <TextInput
                                    style={styles.editInput}
                                    value={editText}
                                    onChangeText={setEditText}
                                    autoFocus
                                    onBlur={handleEndEdit}
                                    onSubmitEditing={handleEndEdit}
                                />
                                <TouchableOpacity onPress={handleEndEdit}>
                                    <Ionicons name="checkmark" size={24} color="green" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <View style={styles.stepHeader}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                                </View>
                                    <Text style={styles.stepText}>{paso.descripcion}</Text>
                                <View style={styles.stepActions}>
                                    <TouchableOpacity onPress={() => handleStartEdit(index)}>
                                        <Ionicons name="pencil" size={18} color="#007BFF" />
                                    </TouchableOpacity>
                                        <TouchableOpacity onPress={() => toggleExpandStep(index)}>
                                            <Ionicons 
                                                name={expandedStep === index ? "chevron-up" : "chevron-down"} 
                                                size={20} 
                                                color="#FF7B6B" 
                                            />
                                        </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleRemovePaso(index)}>
                                        <Ionicons name="close" size={22} color="#FF3B30" />
                                    </TouchableOpacity>
                                    </View>
                                </View>
                                
                                {/* Sección expandible para medios */}
                                {expandedStep === index && (
                                    <View style={styles.mediaSection}>
                                        <Text style={styles.mediaSectionTitle}>📸 Fotos y videos del paso</Text>
                                        <PasoMediaManager
                                            medios={paso.medios}
                                            onMediosChange={(medios) => handleMediosChange(index, medios)}
                                            maxMedios={5}
                                        />
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                ))}

                {pasos.length > 0 && (
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryText}>📝 Tu receta tiene {pasos.length} pasos</Text>
                    </View>
                )}
                 <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.outlineButton} onPress={() => router.replace('/views/cargar-receta-2')}>
                        <Text style={styles.outlineButtonText}>Atrás</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.outlineButton, { opacity: pasos.length < 2 ? 0.5 : 1 }]} onPress={handleSiguiente} disabled={pasos.length < 2}>
                        <Text style={styles.outlineButtonText}>Siguiente</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
        paddingBottom: 100,
    },
    headerContainer: {
        backgroundColor: '#333',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingTop: 60,
        paddingBottom: 20,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: -60,
        left: 20,
        backgroundColor: '#222',
        borderRadius: 24,
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    addStepContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#007BFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: 'white',
    },
    addButton: {
        backgroundColor: '#FF7B6B',
        borderRadius: 12,
        padding: 12,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    stepContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'column',
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        width: '100%',
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    stepNumber: {
        backgroundColor: '#FF7B6B',
        borderRadius: 20,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    stepNumberText: {
        color: 'white',
        fontWeight: 'bold',
    },
    stepText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    stepActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    editView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    editInput: {
        flex: 1,
        borderBottomWidth: 1,
        borderColor: '#007BFF',
        fontSize: 16,
    },
    summaryContainer: {
        marginTop: 20,
        backgroundColor: '#FFF8E1',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
    },
    summaryText: {
        color: '#F57C00',
        fontSize: 16,
        fontWeight: '500',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 30,
    },
    outlineButton: {
        backgroundColor: 'white',
        borderColor: '#222',
        borderWidth: 2,
        borderRadius: 30,
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 40,
        marginHorizontal: 5,
    },
    outlineButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 18,
    },
    mediaSection: {
        marginTop: 10,
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        width: '100%',
        alignSelf: 'stretch',
    },
    mediaSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
}); 