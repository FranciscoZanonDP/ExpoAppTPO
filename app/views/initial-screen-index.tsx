import { StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function InitialScreen() {
    const router = useRouter();

    const handleStart = () => {
        router.replace('/views/home');
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText style={styles.brand}>@Cookit</ThemedText>

            <ThemedView style={styles.contentContainer}>
                <ThemedText style={styles.title}>Con ganas de cocinar hoy?</ThemedText>

                <ThemedText style={styles.subtitle}>
                    Aprende y comparte tus conocimientos sobre las mejores recetas de comidas
                </ThemedText>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleStart}
                >
                    <ThemedText style={styles.buttonText}>Empiezaa</ThemedText>
                </TouchableOpacity>
            </ThemedView>

            <Image
                source={require('../../assets/images/logo (2).png')}
                style={styles.logo}
                resizeMode="contain"
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF7B6B',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    brand: {
        color: 'white',
        fontSize: 16,
        marginTop: 40,
    },
    contentContainer: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
    },
    title: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    subtitle: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
    },
    button: {
        backgroundColor: 'white',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        marginTop: 10,
    },
    buttonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logo: {
        width: 80,
        height: 80,
        tintColor: 'rgba(255, 255, 255, 0.5)',
        marginBottom: 40,
    },
}); 