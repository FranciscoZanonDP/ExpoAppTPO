import React, { useEffect } from 'react';
import { View, Image, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
    const router = useRouter();
    const fadeAnim = new Animated.Value(1);

    useEffect(() => {
        // Efecto de titilación
        const blinkAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );

        blinkAnimation.start();

        const timer = setTimeout(() => {
            router.replace('./views/initial-screen');
        }, 3000);

        return () => {
            clearTimeout(timer);
            blinkAnimation.stop();
    };
    }, [router, fadeAnim]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Animated.Image
                            source={require('../assets/images/logo (2).png')}
                    style={[styles.image, { opacity: fadeAnim }]}
                            resizeMode="contain"
                        />
                </View>
            </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF7B6B',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    image: {
        width: 200,
        height: 200,
        tintColor: 'rgba(255, 255, 255, 0.6)',
    },
}); 