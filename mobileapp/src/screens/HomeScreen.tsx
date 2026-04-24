import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import ProductCard from '../components/ProductCard';
import api from '../api/api';
import { Search, ShoppingBag, Zap, Award, Gift, Smartphone, Filter } from 'lucide-react-native';

const STORES = [
    { id: 'amazon', name: 'Amazon', color: '#FF9900', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg' },
    { id: 'flipkart', name: 'Flipkart', color: '#2874F0', logo: 'https://seeklogo.com/images/F/flipkart-logo-3F33927DAA-seeklogo.com.png' },
    { id: 'myntra', name: 'Myntra', color: '#ff3f6c', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png' },
];

export default function HomeScreen({ navigation }: any) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStore, setSelectedStore] = useState('all');

    const fetchProducts = useCallback(async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Fetch products failed', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const filteredProducts = products.filter((p: any) => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStore = selectedStore === 'all' || 
                            (selectedStore === 'amazon' && p.amazon_link) ||
                            (selectedStore === 'flipkart' && p.flipkart_link);
        return matchesSearch && matchesStore;
    });

    const Header = () => (
        <View style={styles.headerContainer}>
            {/* Hero Section */}
            <View style={styles.hero}>
                <View style={styles.heroContent}>
                    <Text style={styles.heroTag}>✨ Exclusive Deals</Text>
                    <Text style={styles.heroTitle}>Curated Picks.{"\n"}<Text style={styles.heroHighlight}>Smart Rewards.</Text></Text>
                    <Text style={styles.heroSubtitle}>Earn coins for every purchase and redeem them for UPI cash.</Text>
                </View>
                <View style={styles.heroIcons}>
                    <Award size={40} color="rgba(255,255,255,0.2)" style={styles.floatingIcon1} />
                    <Zap size={60} color="rgba(255,255,255,0.1)" style={styles.floatingIcon2} />
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search size={20} color={COLORS.gray[400]} />
                    <TextInput 
                        placeholder="Search products..." 
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                    <Filter size={20} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            {/* Store Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storesRow}>
                <TouchableOpacity 
                    style={[styles.storeTab, selectedStore === 'all' && styles.activeStoreTab]}
                    onPress={() => setSelectedStore('all')}
                >
                    <Text style={[styles.storeTabText, selectedStore === 'all' && styles.activeStoreTabText]}>All Stores</Text>
                </TouchableOpacity>
                {STORES.map(store => (
                    <TouchableOpacity 
                        key={store.id} 
                        style={[styles.storeTab, selectedStore === store.id && { borderColor: store.color, backgroundColor: store.color + '10' }]}
                        onPress={() => setSelectedStore(store.id)}
                    >
                        <Text style={[styles.storeTabText, selectedStore === store.id && { color: store.color }]}>{store.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trending Deals</Text>
                <Text style={styles.sectionSubtitle}>{filteredProducts.length} items found</Text>
            </View>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.brand[500]} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList 
                data={filteredProducts}
                renderItem={({ item }) => (
                    <ProductCard 
                        product={item} 
                        onPress={() => navigation.navigate('ProductDetails', { productId: item.id })} 
                    />
                )}
                keyExtractor={(item: any) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.list}
                ListHeaderComponent={Header}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.brand[500]]} />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        paddingBottom: 10,
    },
    hero: {
        backgroundColor: COLORS.brand[700],
        padding: 25,
        paddingTop: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        marginBottom: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    heroContent: {
        zIndex: 2,
    },
    heroTag: {
        color: COLORS.brand[200],
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    heroTitle: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: '900',
        lineHeight: 34,
    },
    heroHighlight: {
        color: COLORS.accent.yellow,
    },
    heroSubtitle: {
        color: COLORS.brand[100],
        fontSize: 14,
        marginTop: 10,
        lineHeight: 20,
        maxWidth: '80%',
    },
    heroIcons: {
        position: 'absolute',
        right: -20,
        top: -20,
        zIndex: 1,
    },
    floatingIcon1: {
        position: 'absolute',
        right: 40,
        top: 60,
        transform: [{ rotate: '15deg' }],
    },
    floatingIcon2: {
        position: 'absolute',
        right: 10,
        top: 100,
        transform: [{ rotate: '-15deg' }],
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        gap: 12,
        marginBottom: 20,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        paddingHorizontal: 15,
        height: 54,
        ...SHADOWS.sm,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: COLORS.gray[800],
        fontWeight: '500',
    },
    filterBtn: {
        width: 54,
        height: 54,
        backgroundColor: COLORS.brand[600],
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    storesRow: {
        paddingHorizontal: SPACING.lg,
        gap: 12,
        marginBottom: 25,
    },
    storeTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 15,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    activeStoreTab: {
        backgroundColor: COLORS.brand[600],
        borderColor: COLORS.brand[600],
    },
    storeTabText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.gray[500],
    },
    activeStoreTabText: {
        color: COLORS.white,
    },
    sectionHeader: {
        paddingHorizontal: SPACING.lg,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.gray[900],
    },
    sectionSubtitle: {
        fontSize: 12,
        color: COLORS.gray[400],
        fontWeight: 'bold',
        marginTop: 2,
    },
    list: {
        paddingBottom: 20,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
    }
});

