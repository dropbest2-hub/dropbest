import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, TextInput, StatusBar, Platform, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Menu, Plus, Search, TrendingUp, AlertCircle, MoreVertical, Edit2, RefreshCw } from 'lucide-react-native';
import { CATEGORIES } from '../lib/categories';
import SideMenuModal from '../components/SideMenuModal';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';

const violetPrimary = '#6b38d4';
const background = '#f8f9fa';

// Stable Title and Search Section to prevent keyboard dismissal
const AdminTitleSection = ({ 
    isDark, 
    searchQuery, 
    setSearchQuery, 
    handleNewItem,
    isSyncing,
    handleSyncPrices
}: any) => (
    <View style={styles.titleSection}>
        <View style={styles.titleRow}>
            <Text style={[styles.pageTitle, isDark && { color: '#ffffff' }]}>Products</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleNewItem}>
                <Plus size={18} color="#ffffff" />
                <Text style={styles.addButtonText}>NEW ITEM</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.syncButton, isSyncing && { opacity: 0.7 }]} 
                onPress={handleSyncPrices}
                disabled={isSyncing}
            >
                <RefreshCw size={18} color={violetPrimary} style={isSyncing ? { transform: [{ rotate: '0deg' }] } : {}} />
                <Text style={styles.syncButtonText}>{isSyncing ? 'SYNCING...' : 'SYNC'}</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
            <Search size={20} color={isDark ? "#666" : "#7b7486"} style={styles.searchIcon} />
            <TextInput 
                style={[styles.searchInput, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333', color: '#ffffff' }]}
                placeholder="Search inventory..."
                placeholderTextColor={isDark ? "#444" : "#7b7486"}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>
    </View>
);

export default function AdminProductsScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const fetchProducts = useCallback(async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data || []);
        } catch (error) {
            console.error('Fetch products failed', error);
            Alert.alert("Error", "Failed to fetch products from database.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchProducts();
        });
        return unsubscribe;
    }, [navigation, fetchProducts]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const productTitle = product.title || '';
            const matchesSearch = productTitle.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    const handleNewItem = () => {
        navigation.navigate('AdminAddProductScreen');
    };

    const handleEditProduct = (product: any) => {
        navigation.navigate('AdminAddProductScreen', { product });
    };

    const handleDeleteProduct = (productId: string, title: string) => {
        Alert.alert(
            "Delete Product",
            `Are you sure you want to delete "${title}"? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.delete(`/products/${productId}`);
                            Alert.alert("Success", "Product deleted successfully.");
                            fetchProducts();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete product.");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleSyncPrices = async () => {
        Alert.alert(
            "Sync Prices",
            "This will scrape Amazon/Flipkart for all products. It might take a minute and will notify users of price drops. Continue?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Sync Now", 
                    onPress: async () => {
                        try {
                            setIsSyncing(true);
                            const response = await api.post('/products/sync');
                            Alert.alert("Success", `Sync completed! Updated ${response.data.updated.length} products.`);
                            fetchProducts();
                        } catch (error) {
                            Alert.alert("Error", "Failed to sync prices. Check server connection.");
                        } finally {
                            setIsSyncing(false);
                        }
                    }
                }
            ]
        );
    };

    const handleProductOptions = (product: any) => {
        Alert.alert(
            "Product Options",
            product.title,
            [
                { text: "Edit Details", onPress: () => handleEditProduct(product) },
                { text: "Delete Product", style: "destructive", onPress: () => handleDeleteProduct(product.id, product.title) },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const memoizedTitleSection = useMemo(() => (
        <AdminTitleSection 
            isDark={isDark}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleNewItem={handleNewItem}
            handleSyncPrices={handleSyncPrices}
            isSyncing={isSyncing}
        />
    ), [isDark, searchQuery, navigation, isSyncing, handleSyncPrices]);

    return (
        <SafeAreaView style={[styles.safeArea, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#121212" : "#ffffff"} />
            
            <SideMenuModal 
                visible={isMenuVisible} 
                onClose={() => setIsMenuVisible(false)} 
                navigation={navigation} 
            />

            <View style={[styles.header, isDark && { backgroundColor: '#121212', borderBottomColor: '#333' }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setIsMenuVisible(true)}>
                        <Menu size={24} color={violetPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, isDark && { color: '#ffffff' }]}>Dropbest Admin</Text>
                </View>
            </View>

            <ScrollView 
                style={[styles.container, isDark && { backgroundColor: '#121212' }]} 
                contentContainerStyle={styles.contentPadding}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[violetPrimary]} />}
            >
                {memoizedTitleSection}

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }, styles.shadow]}>
                        <Text style={[styles.statLabel, isDark && { color: '#666' }]}>ACTIVE INVENTORY</Text>
                        <Text style={styles.statValue}>{products.length}</Text>
                        <View style={styles.statTrendRow}>
                            <TrendingUp size={12} color="#8a5100" />
                            <Text style={styles.statTrendText}>+12%</Text>
                        </View>
                    </View>
                    <View style={[styles.statCard, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }, styles.shadow]}>
                        <Text style={[styles.statLabel, isDark && { color: '#666' }]}>PENDING ORDERS</Text>
                        <Text style={[styles.statValue, { color: '#8a5100' }]}>42</Text>
                        <View style={styles.statTrendRow}>
                            <AlertCircle size={12} color="#ba1a1a" />
                            <Text style={[styles.statTrendText, { color: '#ba1a1a' }]}>URGENT</Text>
                        </View>
                    </View>
                </View>

                {/* Category Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer} contentContainerStyle={styles.chipsContent}>
                    {CATEGORIES.map(category => (
                        <TouchableOpacity 
                            key={category.id}
                            style={[styles.chip, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }, selectedCategory === category.id && styles.chipActive]}
                            onPress={() => setSelectedCategory(category.id)}
                        >
                            <Text style={[styles.chipText, isDark && { color: '#888' }, selectedCategory === category.id && styles.chipTextActive]}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Product List */}
                <View style={styles.productList}>
                    {loading ? (
                        <ActivityIndicator size="large" color={violetPrimary} style={{ marginTop: 40 }} />
                    ) : filteredProducts.length === 0 ? (
                        <Text style={[styles.emptyText, isDark && { color: '#444' }]}>No products found.</Text>
                    ) : (
                        filteredProducts.map(product => (
                            <TouchableOpacity key={product.id} style={[styles.productItem, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }, styles.shadow]}>
                                <View style={[styles.productImageContainer, isDark && { backgroundColor: '#252525' }]}>
                                    <Image 
                                        source={{ uri: product.image_url || 'https://via.placeholder.com/150' }}
                                        style={styles.productImage}
                                    />
                                </View>
                                <View style={styles.productInfo}>
                                    <View style={styles.productHeaderRow}>
                                        <Text style={[styles.productName, isDark && { color: '#ffffff' }]} numberOfLines={1}>{product.title}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: isDark ? '#14532d' : '#dcfce7' }]}>
                                            <Text style={[styles.statusText, { color: isDark ? '#4ade80' : '#15803d' }]}>Active</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.productCategory, isDark && { color: '#666' }]}>Category: {product.category}</Text>
                                    <View style={styles.productFooterRow}>
                                        <Text style={styles.productPrice}>₹{product.price}</Text>
                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity style={styles.actionBtn} onPress={() => handleEditProduct(product)}>
                                                <Edit2 size={20} color={isDark ? "#888" : "#7b7486"} />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.actionBtn} onPress={() => handleProductOptions(product)}>
                                                <MoreVertical size={20} color={isDark ? "#888" : "#7b7486"} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        zIndex: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: violetPrimary,
        letterSpacing: -0.5,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#e2e8f0',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        backgroundColor: background,
    },
    contentPadding: {
        padding: 20,
    },
    titleSection: {
        marginBottom: 32,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#191c1d',
        letterSpacing: -0.5,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: violetPrimary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#111827',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: violetPrimary,
        gap: 8,
        marginLeft: 8,
    },
    syncButtonText: {
        color: violetPrimary,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    searchContainer: {
        position: 'relative',
        width: '100%',
    },
    searchIcon: {
        position: 'absolute',
        left: 16,
        top: '50%',
        marginTop: -10,
        zIndex: 2,
    },
    searchInput: {
        backgroundColor: '#ffffff',
        height: 48,
        borderRadius: 24,
        paddingLeft: 48,
        paddingRight: 16,
        fontSize: 14,
        color: '#191c1d',
        ...Platform.select({
            ios: {
                shadowColor: '#111827',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#7b7486',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '600',
        color: violetPrimary,
        marginBottom: 4,
    },
    statTrendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statTrendText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#8a5100',
    },
    chipsContainer: {
        marginHorizontal: -20,
        marginBottom: 20,
    },
    chipsContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cbc3d7',
    },
    chipActive: {
        backgroundColor: violetPrimary,
        borderColor: violetPrimary,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#494454',
    },
    chipTextActive: {
        fontSize: 12,
        fontWeight: '700',
        color: '#ffffff',
    },
    productList: {
        gap: 16,
    },
    productItem: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        alignItems: 'center',
        gap: 16,
    },
    productImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#edeeef',
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    grayscale: {
        tintColor: 'gray',
        opacity: 0.8,
    },
    productInfo: {
        flex: 1,
    },
    productHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#191c1d',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    productCategory: {
        fontSize: 12,
        color: '#7b7486',
        marginBottom: 8,
    },
    productFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 18,
        fontWeight: '600',
        color: violetPrimary,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        padding: 6,
    },
    emptyText: {
        textAlign: 'center',
        color: '#7b7486',
        marginTop: 20,
    },
    shadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#111827',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    }
});
