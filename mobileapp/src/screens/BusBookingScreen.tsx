import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, SafeAreaView, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { Bus, Star, ExternalLink, ShieldCheck, Zap, ChevronRight, MapPin, Calendar, Users, AlertCircle } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import { useNavigation } from '@react-navigation/native';

const BusTicket = ({ bus, isDark }: any) => {
    // Parse extra info from search_keywords: Partner|Duration|Source|Dest|Time|Seats
    const parts = bus.search_keywords ? bus.search_keywords.split('|') : [];
    const partner = parts[0] || 'Partner';
    const duration = parts[1] || '00h 00m';
    const source = parts[2] || 'Source';
    const destination = parts[3] || 'Destination';
    const time = parts[4] || '00:00 - 00:00';
    const seats = parts[5] || 'Available';

    const [departure, arrival] = time.split(' - ');
    const savings = bus.old_price ? bus.old_price - bus.price : 0;

    const navigation = useNavigation<any>();
    const { user } = useAuthStore();

    const handlePress = () => {
        if (!user) {
            navigation.navigate('Login');
            return;
        }
        if (bus.amazon_link) {
            Linking.openURL(bus.amazon_link);
        }
    };

    return (
        <TouchableOpacity 
            style={[styles.ticketContainer, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            {/* Top Promo Banner */}
            <View style={styles.promoBanner}>
                <Text style={styles.promoText}>Upto ₹{savings || 40} off on {partner}</Text>
            </View>

            <View style={styles.ticketContent}>
                {/* Operator Info */}
                <View style={styles.operatorRow}>
                    <View>
                        <Text style={[styles.operatorName, { color: isDark ? '#fff' : '#1a1a1a' }]}>{bus.title}</Text>
                        <Text style={[styles.busType, { color: isDark ? '#aaa' : '#666' }]}>{bus.description}</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                        <Star size={10} color="#fff" fill="#fff" />
                        <Text style={styles.ratingText}>{bus.external_rating || '3.6'}</Text>
                        <Text style={styles.reviewText}>| {bus.external_review_count || '288'}</Text>
                    </View>
                </View>

                {/* Journey Details */}
                <View style={styles.journeyRow}>
                    <View style={styles.timeCol}>
                        <Text style={[styles.timeText, { color: isDark ? '#fff' : '#1a1a1a' }]}>{departure || '23:25'}</Text>
                        <Text style={styles.cityText} numberOfLines={1}>{source}</Text>
                    </View>

                    <View style={styles.durationCol}>
                        <Text style={styles.durationText}>{duration}</Text>
                        <View style={styles.line}>
                            <View style={styles.dot} />
                            <View style={[styles.connector, { backgroundColor: isDark ? '#444' : '#eee' }]} />
                            <View style={styles.dot} />
                        </View>
                    </View>

                    <View style={styles.timeCol}>
                        <Text style={[styles.timeText, { color: isDark ? '#fff' : '#1a1a1a' }, { textAlign: 'right' }]}>{arrival || '05:45'}</Text>
                        <Text style={[styles.cityText, { textAlign: 'right' }]} numberOfLines={1}>{destination}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.ticketFooter}>
                    <View>
                        {savings > 0 && <Text style={styles.savingsText}>Save ₹{savings}</Text>}
                        <View style={styles.priceRow}>
                            {bus.old_price && <Text style={styles.oldPrice}>₹{bus.old_price}</Text>}
                            <Text style={[styles.price, { color: isDark ? '#fff' : '#1a1a1a' }]}>₹{bus.price}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.actionBlock}>
                        <View style={styles.selectButton}>
                            <Text style={styles.selectText}>Select Seats</Text>
                        </View>
                        <Text style={styles.seatsLeft}>{seats}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function BusBookingScreen() {
    const { isDark } = useTheme();
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBuses = useCallback(async () => {
        try {
            const response = await api.get('/products');
            const busData = response.data.filter((p: any) => p.category === 'bus-booking');
            setBuses(busData);
        } catch (error) {
            console.error('Fetch buses failed', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchBuses();
    }, [fetchBuses]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchBuses();
    }, [fetchBuses]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.brand[600]]} />
                }
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerGradient}>
                        <View style={styles.badge}>
                            <Bus size={14} color="#fff" />
                            <Text style={styles.badgeText}>TRAVEL REWARDS</Text>
                        </View>
                        <Text style={styles.title}>Book Buses.{"\n"}Earn Coins.</Text>
                        <Text style={styles.subtitle}>Compare tickets from all major partners and earn coins for every trip.</Text>
                    </View>
                </View>

                {/* Listings */}
                <View style={styles.content}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>Available Buses</Text>
                        <TouchableOpacity onPress={onRefresh}>
                            <Text style={styles.refreshText}>Refresh</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.brand[600]} style={{ marginTop: 50 }} />
                    ) : buses.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconContainer}>
                                <Bus size={60} color={isDark ? '#333' : '#ddd'} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>Admin team will add soon</Text>
                            <Text style={styles.emptySubtitle}>We're currently preparing new bus routes for you. Check back soon!</Text>
                        </View>
                    ) : (
                        buses.map((bus: any) => (
                            <BusTicket key={bus.id} bus={bus} isDark={isDark} />
                        ))
                    )}

                    {/* How it works */}
                    <View style={[styles.infoCard, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
                        <Text style={[styles.infoTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>How to earn coins?</Text>
                        <View style={styles.step}>
                            <Text style={styles.stepNum}>01</Text>
                            <Text style={[styles.stepText, { color: isDark ? '#ccc' : '#555' }]}>Choose a journey and book your ticket.</Text>
                        </View>
                        <View style={styles.step}>
                            <Text style={styles.stepNum}>02</Text>
                            <Text style={[styles.stepText, { color: isDark ? '#ccc' : '#555' }]}>Finish your booking on the partner platform.</Text>
                        </View>
                        <View style={styles.step}>
                            <Text style={styles.stepNum}>03</Text>
                            <Text style={[styles.stepText, { color: isDark ? '#ccc' : '#555' }]}>Submit details and get coins credited!</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
    },
    headerGradient: {
        backgroundColor: '#f97316',
        borderRadius: 30,
        padding: 30,
        minHeight: 200,
        justifyContent: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 15,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        marginLeft: 6,
        letterSpacing: 1,
    },
    title: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '900',
        lineHeight: 38,
        marginBottom: 10,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    content: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
    },
    refreshText: {
        color: '#f97316',
        fontWeight: 'bold',
        fontSize: 14,
    },
    ticketContainer: {
        borderRadius: 24,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...SHADOWS.md,
    },
    promoBanner: {
        backgroundColor: '#fff7ed',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#ffedd5',
    },
    promoText: {
        color: '#f97316',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    ticketContent: {
        padding: 20,
    },
    operatorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    operatorName: {
        fontSize: 18,
        fontWeight: '900',
    },
    busType: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#059669',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    reviewText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
        marginLeft: 4,
    },
    journeyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    timeCol: {
        flex: 1,
    },
    timeText: {
        fontSize: 18,
        fontWeight: '900',
    },
    cityText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: 'bold',
        marginTop: 2,
    },
    durationCol: {
        flex: 1,
        alignItems: 'center',
    },
    durationText: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '900',
        marginBottom: 4,
    },
    line: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#cbd5e1',
    },
    connector: {
        flex: 1,
        height: 1,
        marginHorizontal: 4,
    },
    ticketFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    savingsText: {
        fontSize: 10,
        color: '#059669',
        fontWeight: '900',
        marginBottom: 2,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    oldPrice: {
        fontSize: 14,
        color: '#94a3b8',
        textDecorationLine: 'line-through',
    },
    price: {
        fontSize: 22,
        fontWeight: '900',
    },
    actionBlock: {
        alignItems: 'flex-end',
    },
    selectButton: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    selectText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
    },
    seatsLeft: {
        fontSize: 10,
        color: '#059669',
        fontWeight: 'bold',
        marginTop: 4,
    },
    infoCard: {
        borderRadius: 24,
        padding: 24,
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 20,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    stepNum: {
        fontSize: 24,
        fontWeight: '900',
        color: 'rgba(0,0,0,0.05)',
        marginRight: 15,
    },
    stepText: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 20,
    },
    emptyIconContainer: {
        backgroundColor: 'rgba(0,0,0,0.02)',
        padding: 25,
        borderRadius: 35,
        marginBottom: 15,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '900',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
        fontWeight: '500',
    }
});
