import React from 'react';
import { StyleSheet, Image, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ClearStorageOnStart from './components/ClearStorageOnStart';
export default function InitialScreen() {
    const router = useRouter();

    const handleStart = () => {
        router.push('/views/home');
    };

    return (
        <>
            <ClearStorageOnStart />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <ThemedText style={styles.brand}>@Cookit</ThemedText>

                    <View style={styles.contentContainer}>
                        <ThemedText style={styles.title}>Con ganas de{'\n'}cocinar hoy?</ThemedText>

                        <ThemedText style={styles.subtitle}>
                            Aprende y comparte tus conocimientos sobre{'\n'}las mejores recetas de comidas
                        </ThemedText>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleStart}
                        >
                            <ThemedText style={styles.buttonText}>Empieza</ThemedText>
                        </TouchableOpacity>

                        <Image
                            source={require('../assets/images/logo (2).png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FF7B6B',
    },
    container: {
        flex: 1,
        backgroundColor: '#FF7B6B',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 30,
        paddingHorizontal: 25,
    },
    brand: {
        color: 'white',
        fontSize: 16,
        marginTop: 40,
        opacity: 0.9,
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
        paddingHorizontal: 0,
        backgroundColor: 'transparent',
        marginTop: 20,
    },
    title: {
        color: 'white',
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 15,
        lineHeight: 38,
    },
    subtitle: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 20,
        opacity: 0.9,
        fontWeight: '400',
    },
    button: {
        backgroundColor: 'white',
        paddingVertical: 14,
        paddingHorizontal: 50,
        borderRadius: 30,
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    buttonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    logo: {
        width: 200,
        height: 200,
        tintColor: 'rgba(255, 255, 255, 0.6)',
        marginTop: 20,
    },
}); 