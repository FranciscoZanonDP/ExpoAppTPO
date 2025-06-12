import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CambiarAlumnoPagoScreen() {
    const router = useRouter();
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [cardholder, setCardholder] = useState('');

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={styles.header}>
                <ThemedText style={styles.headerText}>Cambiar a alumno</ThemedText>
            </View>
            <View style={styles.formContainer}>
                <ThemedText style={styles.label}>Card number</ThemedText>
                <View style={styles.inputRow}>
                    <Ionicons name="card-outline" size={22} color="#AAA" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.input}
                        placeholder="0000 0000 0000 0000"
                        keyboardType="numeric"
                        value={cardNumber}
                        onChangeText={setCardNumber}
                        maxLength={19}
                    />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <ThemedText style={styles.label}>Expires</ThemedText>
                        <View style={styles.inputRow}>
                            <Ionicons name="calendar-outline" size={22} color="#AAA" style={{ marginRight: 8 }} />
                            <TextInput
                                style={styles.input}
                                placeholder="MM / YY"
                                value={expiry}
                                onChangeText={setExpiry}
                                maxLength={7}
                            />
                        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <ThemedText style={styles.label}>Security code</ThemedText>
                        <View style={styles.inputRow}>
                            <Ionicons name="lock-closed-outline" size={22} color="#AAA" style={{ marginRight: 8 }} />
                            <TextInput
                                style={styles.input}
                                placeholder="CVC"
                                value={cvc}
                                onChangeText={setCvc}
                                maxLength={4}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>
                <ThemedText style={styles.label}>Cardholder name</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="Amy Schumer"
                    value={cardholder}
                    onChangeText={setCardholder}
                />
                <TouchableOpacity style={styles.button} onPress={() => router.push('/views/cambiar-a-alumno-datos')}>
                    <ThemedText style={styles.buttonText}>Siguiente</ThemedText>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { backgroundColor: '#333', paddingHorizontal: 40, paddingTop: 80, paddingBottom: 80, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, alignItems: 'center' },
    headerText: { color: 'white', fontSize: 28, textAlign: 'center', fontWeight: 'bold' },
    formContainer: { marginTop: 40, paddingHorizontal: 20, backgroundColor: 'white', borderRadius: 16, margin: 20, padding: 20 },
    label: { color: '#444', fontSize: 16, marginBottom: 6, marginTop: 10 },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#EEE', borderRadius: 10, marginBottom: 12, paddingHorizontal: 10, backgroundColor: '#FAFAFA' },
    input: { flex: 1, fontSize: 16, color: '#333', paddingVertical: 12 },
    button: { backgroundColor: '#444348', borderRadius: 30, paddingVertical: 16, alignItems: 'center', marginTop: 30 },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
}); 