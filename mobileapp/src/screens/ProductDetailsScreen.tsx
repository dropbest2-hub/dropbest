import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, Share } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import api from '../api/api';
import { ExternalLink, ChevronLeft, Heart, Share2, ShoppingCart, Star, ShieldCheck } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen({ route, navigation }: any) {
    const { productId } = route.params;
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${productId}`);
                setProduct(response.data);
                
                // Check if in watchlist
                const watchlistRes = await api.get('/users/watchlist');
                const inWatchlist = watchlistRes.data.some((w: any) => w.product_id === productId);
                setIsFavorite(inWatchlist);
            } catch (error) {
                console.error('Error fetching product details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    const handleToggleWatchlist = async () => {
        try {
            if (isFavorite) {
                await api.delete(`/users/watchlist/${productId}`);
                setIsFavorite(false);
            } else {
                await api.post('/users/watchlist', { product_id: productId });
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Error toggling watchlist:', error);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this amazing deal on DropBest: ${product.title}\n\nDownload the app to see more!`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.brand[500]} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.center}>
                <Text>Product not found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <ChevronLeft size={24} color={COLORS.gray[900]} />
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
                        <Share2 size={20} color={COLORS.gray[900]} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleToggleWatchlist} style={styles.headerBtn}>
                        <Heart size={20} color={isFavorite ? COLORS.accent.pink : COLORS.gray[900]} fill={isFavorite ? COLORS.accent.pink : 'none'} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="contain" />
                </View>

                <View style={styles.content}>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
                        <View style={styles.badge}>
                            <Star size={12} color={COLORS.white} fill={COLORS.white} />
                            <Text style={styles.badgeText}>Top Choice</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{product.title}</Text>
                    
                    <View style={styles.divider} />

                    <Text style={styles.descriptionTitle}>Product Description</Text>
                    <Text style={styles.description}>{product.description}</Text>

                    <View style={styles.trustCard}>
                        <ShieldCheck size={24} color={COLORS.brand[600]} />
                        <View>
                            <Text style={styles.trustTitle}>Verified Link</Text>
                            <Text style={styles.trustSubtitle}>Safe and secure purchase guaranteed.</Text>
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.storeLinks}>
                    {product.amazon_link && (
                        <TouchableOpacity 
                            style={[styles.buyBtn, { backgroundColor: '#FF9900' }]}
                            onPress={() => {}} // Handle redirect
                        >
                            <Text style={styles.buyBtnText}>Amazon</Text>
                            <ExternalLink size={16} color={COLORS.white} />
                        </TouchableOpacity>
                    )}
                    {product.flipkart_link && (
                        <TouchableOpacity 
                            style={[styles.buyBtn, { backgroundColor: '#2874F0' }]}
                            onPress={() => {}} // Handle redirect
                        >
                            <Text style={styles.buyBtnText}>Flipkart</Text>
                            <ExternalLink size={16} color={COLORS.white} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingTop: 50,
        paddingBottom: 15,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    headerRight: {
        flexDirection: 'row',
        gap: 15,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.sm,
    },
    imageContainer: {
        width: width,
        height: width,
        backgroundColor: COLORS.gray[50],
        marginTop: 100,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    content: {
        padding: SPACING.lg,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    price: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.brand[700],
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: COLORS.accent.orange,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.gray[900],
        lineHeight: 30,
        marginBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.gray[100],
        marginBottom: 20,
    },
    descriptionTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: COLORS.gray[900],
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    description: {
        fontSize: 15,
        color: COLORS.gray[600],
        lineHeight: 24,
        marginBottom: 30,
    },
    trustCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        backgroundColor: COLORS.brand[50],
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.brand[100],
    },
    trustTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.brand[800],
    },
    trustSubtitle: {
        fontSize: 12,
        color: COLORS.brand[600],
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        paddingBottom: 35,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[100],
        ...SHADOWS.md,
    },
    storeLinks: {
        flexDirection: 'row',
        gap: 12,
    },
    buyBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 56,
        borderRadius: 18,
    },
    buyBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
