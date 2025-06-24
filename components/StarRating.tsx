import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';

interface StarRatingProps {
    rating: number;
    onRating?: (rating: number) => void;
    readonly?: boolean;
    size?: number;
    showText?: boolean;
    totalReviews?: number;
    style?: any;
}

export default function StarRating({ 
    rating, 
    onRating, 
    readonly = false, 
    size = 24, 
    showText = false,
    totalReviews,
    style 
}: StarRatingProps) {
    const handleStarPress = (selectedRating: number) => {
        if (!readonly && onRating) {
            onRating(selectedRating);
        }
    };

    const renderStar = (index: number) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= rating;
        const isHalfFilled = starNumber - 0.5 <= rating && starNumber > rating;

        if (readonly) {
            // Modo solo lectura - mostrar estrellas con decimales
            return (
                <View key={index} style={styles.starContainer}>
                    <Ionicons 
                        name="star" 
                        size={size} 
                        color="#E0E0E0" 
                    />
                    {(isFilled || isHalfFilled) && (
                        <View style={[styles.filledStar, { width: isFilled ? '100%' : '50%' }]}>
                            <Ionicons 
                                name="star" 
                                size={size} 
                                color="#FFD700" 
                            />
                        </View>
                    )}
                </View>
            );
        } else {
            // Modo interactivo - estrellas enteras
            return (
                <TouchableOpacity 
                    key={index}
                    onPress={() => handleStarPress(starNumber)}
                    activeOpacity={0.7}
                >
                    <Ionicons 
                        name={isFilled ? "star" : "star-outline"} 
                        size={size} 
                        color={isFilled ? "#FFD700" : "#E0E0E0"} 
                    />
                </TouchableOpacity>
            );
        }
    };

    return (
        <View style={[styles.container, style]}>
            <View style={styles.starsContainer}>
                {[0, 1, 2, 3, 4].map(renderStar)}
            </View>
            {showText && (
                <View style={styles.textContainer}>
                    <ThemedText style={styles.ratingText}>
                        {rating.toFixed(1)}
                    </ThemedText>
                    {totalReviews !== undefined && (
                        <ThemedText style={styles.reviewsText}>
                            ({totalReviews} {totalReviews === 1 ? 'valoración' : 'valoraciones'})
                        </ThemedText>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starContainer: {
        position: 'relative',
        marginHorizontal: 1,
    },
    filledStar: {
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
    },
    textContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 8,
    },
    reviewsText: {
        fontSize: 14,
        color: '#666',
    },
}); 