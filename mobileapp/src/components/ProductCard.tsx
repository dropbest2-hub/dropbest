import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { ExternalLink } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 2 - SPACING.md) / 2;

interface Product {
    id: string;
    title: string;
    price: number;
    image_url: string;
    amazon_link?: string;
    flipkart_link?: string;
    myntra_link?: string;
    shopify_link?: string;
    ajio_link?: string;
    description?: string;
}

export default function ProductCard({ product, onPress }: { product: Product, onPress?: () => void }) {
    const { isDark } = useTheme();

    return (
        <TouchableOpacity 
            style={[
                styles.container, 
                isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }
            ]} 
            onPress={onPress} 
            activeOpacity={0.8}
        >
            <View style={[styles.imageContainer, isDark && { backgroundColor: '#2d2d2d' }]}>
                <Image 
                    source={{ uri: product.image_url }} 
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={[styles.priceTag, isDark && { backgroundColor: 'rgba(30, 30, 30, 0.95)' }]}>
                    <Text style={[styles.priceText, isDark && { color: COLORS.brand[400] }]}>₹{product.price.toLocaleString()}</Text>
                </View>
            </View>

            <View style={styles.details}>
                <Text style={[styles.title, isDark && { color: '#e0e0e0' }]} numberOfLines={2}>{product.title}</Text>
                
                <View style={styles.footer}>
                    <View style={styles.storeIcons}>
                        {product.amazon_link && (
                            <View style={[styles.storeDot, { backgroundColor: '#FF9900' }]} />
                        )}
                        {product.flipkart_link && (
                            <View style={[styles.storeDot, { backgroundColor: '#2874F0' }]} />
                        )}
                        {product.myntra_link && (
                            <View style={[styles.storeDot, { backgroundColor: '#ff3f6c' }]} />
                        )}
                        {product.shopify_link && (
                            <View style={[styles.storeDot, { backgroundColor: '#95bf47' }]} />
                        )}
                        {product.ajio_link && (
                            <View style={[styles.storeDot, { backgroundColor: '#2c4152' }]} />
                        )}
                    </View>
                    <View style={[
                        styles.viewBadge, 
                        { 
                            backgroundColor: product.amazon_link ? '#FF990020' : 
                                            product.flipkart_link ? '#2874F020' :
                                            product.myntra_link ? '#ff3f6c20' :
                                            product.shopify_link ? '#95bf4720' : (isDark ? '#2d2d2d' : COLORS.brand[50]) 
                        }
                    ]}>
                        <ExternalLink 
                            size={10} 
                            color={
                                product.amazon_link ? '#FF9900' : 
                                product.flipkart_link ? '#2874F0' :
                                product.myntra_link ? '#ff3f6c' :
                                product.shopify_link ? '#95bf47' : COLORS.brand[600]
                            } 
                        />
                        <Text style={[
                            styles.viewText, 
                            { 
                                color: product.amazon_link ? '#FF9900' : 
                                       product.flipkart_link ? '#2874F0' :
                                       product.myntra_link ? '#ff3f6c' :
                                       product.shopify_link ? '#95bf47' : (isDark ? '#aaa' : COLORS.brand[600]) 
                            }
                        ]}>
                            {product.amazon_link ? 'AMAZON' : 
                             product.flipkart_link ? 'FLIPKART' :
                             product.myntra_link ? 'MYNTRA' :
                             product.shopify_link ? 'SHOPIFY' : 
                             product.ajio_link ? 'AJIO' : 'VIEW'}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        backgroundColor: COLORS.white,
        borderRadius: 24,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
        overflow: 'hidden',
    },
    imageContainer: {
        height: 160,
        width: '100%',
        backgroundColor: COLORS.gray[50],
    },
    image: {
        width: '100%',
        height: '100%',
    },
    priceTag: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        ...SHADOWS.sm,
    },
    priceText: {
        fontSize: 12,
        fontWeight: '900',
        color: COLORS.brand[700],
    },
    details: {
        padding: 12,
    },
    title: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.gray[800],
        height: 40,
        marginBottom: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    storeIcons: {
        flexDirection: 'row',
        gap: 4,
    },
    storeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    viewBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.brand[50],
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    viewText: {
        fontSize: 8,
        fontWeight: '900',
        color: COLORS.brand[600],
    }
});
