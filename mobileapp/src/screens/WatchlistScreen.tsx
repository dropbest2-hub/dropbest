import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import ProductCard from '../components/ProductCard';
import api from '../api/api';
import { ChevronLeft, Heart, PackageOpen } from 'lucide-react-native';

export default function WatchlistScreen({ navigation }: any) {
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchWatchlist = useCallback(async () => {
        try {
            const response = await api.get('/users/watchlist');
            // Backend returns {id, user_id, product_id, products: {...}}
            // Extract the product objects for the ProductCard
            const products = response.data.map((item: any) => item.products);
            setWatchlist(products);
        } catch (error) {
            console.error('Fetch watchlist failed', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchWatchlist();
        });
        return unsubscribe;
    }, [navigation, fetchWatchlist]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchWatchlist();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.gray[900]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Watchlist</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.brand[500]} />
                </View>
            ) : watchlist.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <Heart size={40} color={COLORS.gray[300]} fill="none" />
                    </View>
                    <Text style={styles.emptyTitle}>Watchlist is empty</Text>
                    <Text style={styles.emptySubtitle}>Save products you're interested in to track price drops and earn rewards.</Text>
                    <TouchableOpacity 
                        style={styles.browseBtn}
                        onPress={() => navigation.navigate('Main')}
                    >
                        <Text style={styles.browseBtnText}>Explore Products</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList 
                    data={watchlist}
                    renderItem={({ item }) => (
                        <ProductCard 
                            product={item} 
                            onPress={() => navigation.navigate('ProductDetails', { productId: item.id })} 
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.brand[500]]} />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 60,
        backgroundColor: COLORS.white,
        ...SHADOWS.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.gray[900],
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
        paddingBottom: 40,
    },
    row: {
        justifyContent: 'space-between',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.gray[800],
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.gray[400],
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
    },
    browseBtn: {
        backgroundColor: COLORS.brand[600],
        paddingHorizontal: 25,
        paddingVertical: 14,
        borderRadius: 15,
        ...SHADOWS.md,
    },
    browseBtnText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 15,
    }
});
