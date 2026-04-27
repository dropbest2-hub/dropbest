import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Image, TextInput, ScrollView, StatusBar } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import ProductCard from '../components/ProductCard';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import { CATEGORIES } from '../lib/categories';
import SideMenuModal from '../components/SideMenuModal';
import { Search, ShoppingBag, Zap, Award, Gift, Smartphone, Filter, IndianRupee, Menu, Laptop, Camera, Gamepad2, Cpu, Shirt, Briefcase, Watch, Home, Hammer, Flower2, Sparkles, Stethoscope, Baby, ShoppingCart, PawPrint, Book, Film, Music as MusicIcon, Car, Trophy as TrophyIcon, Printer, Factory } from 'lucide-react-native';

const STORES = [
    { id: 'amazon', name: 'Amazon', color: '#FF9900', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg' },
    { id: 'flipkart', name: 'Flipkart', color: '#2874F0', logo: 'https://seeklogo.com/images/F/flipkart-logo-3F33927DAA-seeklogo.com.png' },
    { id: 'myntra', name: 'Myntra', color: '#ff3f6c', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png' },
    { id: 'shopify', name: 'Shopify', color: '#95bf47', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Shopify_Logo.png' },
    { id: 'ajio', name: 'Ajio', color: '#2c4152', logo: 'https://assets.ajio.com/static/img/Ajio-Logo.svg' },
];

const getCategoryIcon = (id: string) => {
    switch(id) {
        case 'electronics': return Smartphone;
        case 'computers': return Laptop;
        case 'phones': return Smartphone;
        case 'camera': return Camera;
        case 'gaming': return Gamepad2;
        case 'software': return Cpu;
        case 'clothing': return Shirt;
        case 'bags': return Briefcase;
        case 'watches': return Watch;
        case 'home-kitchen': return Home;
        case 'furniture': return Home;
        case 'home-improvement': return Hammer;
        case 'tools': return Hammer;
        case 'garden': return Flower2;
        case 'beauty': return Sparkles;
        case 'health': return Stethoscope;
        case 'personal-care': return Sparkles;
        case 'baby': return Baby;
        case 'toys': return Gift;
        case 'grocery': return ShoppingCart;
        case 'pets': return PawPrint;
        case 'books': return Book;
        case 'movies': return Film;
        case 'music': return MusicIcon;
        case 'automotive': return Car;
        case 'sports': return TrophyIcon;
        case 'office': return Printer;
        case 'industrial': return Factory;
        default: return ShoppingBag;
    }
};

const getCategoryColor = (id: string) => {
    const colors = ['#4F46E5', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const HomeHeader = ({ 
    user, 
    searchQuery, 
    setSearchQuery, 
    isDark, 
    navigation, 
    setIsMenuVisible,
    selectedStore,
    setSelectedStore,
    selectedCategory,
    setSelectedCategory,
    filteredProductsCount
}: any) => (
    <View style={styles.headerContainer}>
        {/* Hero Section */}
        <View style={styles.hero}>
            <View style={styles.heroBlob1} />
            <View style={styles.heroBlob2} />

            <View style={styles.heroContent}>
                <View style={styles.greetingRow}>
                    <Text style={styles.greetingEmoji}>👋</Text>
                    <Text style={styles.greetingText}>HELLO, {user?.name?.toUpperCase() || 'GUEST'}</Text>
                </View>
                <Text style={styles.heroTitle}>Curated Picks.{"\n"}<Text style={styles.heroHighlight}>Smart Rewards.</Text></Text>
                <Text style={styles.heroSubtitle}>Earn coins for every purchase and redeem them for UPI cash.</Text>
            </View>

            <View style={styles.rightHeaderAction}>
                <TouchableOpacity 
                    style={styles.menuIconContainer}
                    onPress={() => setIsMenuVisible(true)}
                >
                    <Menu size={28} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>

                {/* Coin Badge */}
                <TouchableOpacity 
                    style={styles.coinCapsule}
                    onPress={() => navigation.navigate('RewardsTab')}
                >
                    <View style={styles.coinCircle}>
                        <Text style={styles.coinSymbol}>₹</Text>
                    </View>
                    <Text style={styles.coinText}>{user?.coin_count || 0}</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
            <View style={[styles.searchBar, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333', borderWidth: 1 }]}>
                <Search size={20} color={isDark ? COLORS.gray[500] : COLORS.gray[400]} />
                <TextInput 
                    placeholder="Search products..." 
                    placeholderTextColor={isDark ? COLORS.gray[600] : COLORS.gray[300]}
                    style={[styles.searchInput, isDark && { color: COLORS.white }]}
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
                style={[
                    styles.storeTab, 
                    isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' },
                    selectedStore === 'all' && styles.activeStoreTab
                ]}
                onPress={() => setSelectedStore('all')}
            >
                <Text style={[styles.storeTabText, isDark && { color: '#888' }, selectedStore === 'all' && styles.activeStoreTabText]}>All Stores</Text>
            </TouchableOpacity>
            {STORES.map(store => (
                <TouchableOpacity 
                    key={store.id} 
                    style={[
                        styles.storeTab, 
                        isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' },
                        selectedStore === store.id && { borderColor: store.color, backgroundColor: store.color + '15' }
                    ]}
                    onPress={() => setSelectedStore(store.id)}
                >
                    <Text style={[styles.storeTabText, isDark && { color: '#888' }, selectedStore === store.id && { color: store.color }]}>{store.name}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>

        <View style={styles.categorySection}>
            <Text style={[styles.miniSectionTitle, isDark && { color: '#e0e0e0' }]}>Explore Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                {CATEGORIES.map(cat => {
                    const Icon = getCategoryIcon(cat.id);
                    const color = getCategoryColor(cat.id);
                    const isSelected = selectedCategory === cat.id;
                    
                    return (
                        <TouchableOpacity 
                            key={cat.id} 
                            style={[styles.categoryItem, isSelected && styles.categoryItemActive]}
                            onPress={() => {
                                setSelectedCategory(isSelected ? 'all' : cat.id);
                            }}
                        >
                            <View style={[
                                styles.categoryIcon, 
                                { backgroundColor: color + (isSelected ? '30' : '15') },
                                isSelected && { borderColor: color, borderWidth: 2 }
                            ]}>
                                <Icon size={24} color={color} />
                            </View>
                            <Text style={[
                                styles.categoryName, 
                                isDark && { color: isSelected ? COLORS.white : '#888' },
                                isSelected && { color: color, fontWeight: '900' }
                            ]} numberOfLines={1}>{cat.name}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>

        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && { color: COLORS.white }]}>Trending Deals</Text>
            <Text style={styles.sectionSubtitle}>{filteredProductsCount} items found</Text>
        </View>
    </View>
);

export default function HomeScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const { user, refreshUser } = useAuthStore();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStore, setSelectedStore] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [products, setProducts] = useState<any[]>([]);

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
        const unsubscribe = navigation.addListener('focus', () => {
            fetchProducts();
            refreshUser();
        });
        return unsubscribe;
    }, [navigation, fetchProducts, refreshUser]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProducts();
    }, [fetchProducts]);

    const filteredProducts = products.filter((p: any) => {
        const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStore = selectedStore === 'all' || 
                            (selectedStore === 'amazon' && p.amazon_link) ||
                            (selectedStore === 'flipkart' && p.flipkart_link) ||
                            (selectedStore === 'myntra' && p.myntra_link) ||
                            (selectedStore === 'shopify' && p.shopify_link) ||
                            (selectedStore === 'ajio' && p.ajio_link);
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        return matchesSearch && matchesStore && matchesCategory;
    });

    const renderHeader = useMemo(() => (
        <HomeHeader 
            user={user}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isDark={isDark}
            navigation={navigation}
            setIsMenuVisible={setIsMenuVisible}
            selectedStore={selectedStore}
            setSelectedStore={setSelectedStore}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            filteredProductsCount={filteredProducts.length}
        />
    ), [user, searchQuery, isDark, selectedStore, selectedCategory, filteredProducts.length, navigation]);

    if (loading && !refreshing) {
        return (
            <View style={[styles.center, isDark && { backgroundColor: '#121212' }]}>
                <ActivityIndicator size="large" color={COLORS.brand[500]} />
            </View>
        );
    }

    return (
        <View style={[styles.container, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            
            <SideMenuModal 
                visible={isMenuVisible} 
                onClose={() => setIsMenuVisible(false)} 
                navigation={navigation} 
            />

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
                ListHeaderComponent={renderHeader}
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
        backgroundColor: COLORS.brand[600],
        padding: 28,
        paddingTop: 80,
        minHeight: 300,
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        marginBottom: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    heroContent: {
        zIndex: 2,
    },
    greetingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 8,
    },
    greetingEmoji: {
        fontSize: 16,
    },
    greetingText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    heroTitle: {
        color: COLORS.white,
        fontSize: 40,
        fontWeight: '900',
        lineHeight: 46,
        letterSpacing: -1.5,
    },
    heroHighlight: {
        color: COLORS.accent.yellow,
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        marginTop: 20,
        lineHeight: 24,
        maxWidth: '85%',
        fontWeight: '500',
    },
    heroBlob1: {
        position: 'absolute',
        right: -40,
        top: -40,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    heroBlob2: {
        position: 'absolute',
        right: 40,
        bottom: -30,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    rightHeaderAction: {
        position: 'absolute',
        top: 50,
        right: 10,
        alignItems: 'flex-end',
        gap: 25,
        zIndex: 10,
    },
    menuIconContainer: {
        padding: 5,
    },
    coinCapsule: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 30,
        gap: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    coinCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.accent.yellow,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.sm,
    },
    coinSymbol: {
        fontSize: 14,
        fontWeight: '900',
        color: '#854D0E',
    },
    coinText: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: '900',
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
    categorySection: {
        marginBottom: 25,
    },
    miniSectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.gray[800],
        paddingHorizontal: SPACING.lg,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    categoryRow: {
        paddingHorizontal: SPACING.lg,
        gap: 15,
    },
    categoryItem: {
        alignItems: 'center',
        width: 80,
    },
    categoryItemActive: {
        transform: [{ scale: 1.05 }],
    },
    categoryIcon: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.gray[600],
    },
    list: {
        paddingBottom: 20,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
    }
});
