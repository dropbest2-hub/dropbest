import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, Platform, StatusBar, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Menu, CheckCircle2, Package, Filter, XCircle } from 'lucide-react-native';
import SideMenuModal from '../components/SideMenuModal';
import api from '../api/api';

const violetPrimary = '#6b38d4';
const violetLight = '#e9ddff';
const background = '#f8f9fa';

export default function AdminDashboardScreen({ navigation }: any) {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = useCallback(async () => {
        try {
            const response = await api.get('/admin/orders');
            setOrders(response.data || []);
        } catch (error) {
            console.error('Fetch orders failed', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchOrders();
        });
        return unsubscribe;
    }, [navigation, fetchOrders]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            
            <SideMenuModal 
                visible={isMenuVisible} 
                onClose={() => setIsMenuVisible(false)} 
                navigation={navigation} 
            />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setIsMenuVisible(true)}>
                        <Menu size={24} color={violetPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Dropbest Admin</Text>
                </View>
                <View style={styles.headerRight}>
                    <View style={styles.avatarContainer}>
                        <Image 
                            source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150' }}
                            style={styles.avatar}
                        />
                    </View>
                </View>
            </View>

            <ScrollView 
                style={styles.container} 
                contentContainerStyle={styles.contentPadding}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[violetPrimary]} />}
            >
                
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>SYSTEM ADMIN</Text>
                    </View>
                    <Text style={styles.welcomeTitle}>Welcome back, DROPBEST!</Text>
                    <Text style={styles.welcomeSubtitle}>Manage your platform confirmations and activities.</Text>
                </View>

                {/* Quick Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, styles.shadow]}>
                        <Package size={24} color={violetPrimary} />
                        <View style={styles.statBottom}>
                            <Text style={styles.statLabel}>TOTAL PENDING</Text>
                            <Text style={[styles.statValue, { color: violetPrimary }]}>{orders.length}</Text>
                        </View>
                    </View>
                    <View style={[styles.statCard, styles.shadow]}>
                        <CheckCircle2 size={24} color="#8a5100" />
                        <View style={styles.statBottom}>
                            <Text style={styles.statLabel}>COMPLETED</Text>
                            <Text style={styles.statValue}>1,248</Text>
                        </View>
                    </View>
                </View>

                {/* Confirmations Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>40-Day Purchase Confirmations</Text>
                    <TouchableOpacity>
                        <Filter size={20} color="#494454" />
                    </TouchableOpacity>
                </View>

                {/* Orders List / Empty State */}
                {loading ? (
                    <ActivityIndicator size="large" color={violetPrimary} style={{ marginVertical: 40 }} />
                ) : orders.length === 0 ? (
                    <View style={[styles.emptyCard, styles.shadow]}>
                        <View style={styles.emptyIconContainer}>
                            <Package size={40} color="#cbd5e1" />
                        </View>
                        <Text style={styles.emptyTitle}>No pending orders to confirm</Text>
                        <Text style={styles.emptySubtitle}>Everything is up to date. New purchase confirmations will appear here.</Text>
                    </View>
                ) : (
                    <View style={styles.ordersList}>
                        {orders.map(order => (
                            <View key={order.id} style={[styles.orderCard, styles.shadow]}>
                                <View style={styles.orderHeader}>
                                    <Text style={styles.orderId}>Order #{order.id.split('-')[0]}</Text>
                                    <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</Text>
                                </View>
                                <Text style={styles.orderProductTitle}>{order.products?.title}</Text>
                                <Text style={styles.orderUserEmail}>{order.users?.email}</Text>
                                {order.external_order_id && (
                                    <View style={styles.externalIdBox}>
                                        <Text style={styles.externalIdLabel}>User Provided Order ID</Text>
                                        <Text style={styles.externalIdValue}>{order.external_order_id}</Text>
                                    </View>
                                )}
                                <View style={styles.orderActions}>
                                    <TouchableOpacity style={styles.confirmBtn} onPress={() => Alert.alert('Action Required', 'Order confirmation UI requires inputs for purchase value, to be implemented.')}>
                                        <Text style={styles.confirmBtnText}>Confirm</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.rejectBtn} onPress={() => Alert.alert('Action Required', 'Order rejection UI requires input for reason, to be implemented.')}>
                                        <XCircle size={20} color="#dc2626" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Activity Card */}
                <View style={[styles.activityCard, styles.shadow]}>
                    <Image 
                        source={{ uri: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800' }}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.gradientOverlay} />
                    <View style={styles.activityContent}>
                        <Text style={styles.activityLabel}>WEEKLY REPORT</Text>
                        <Text style={styles.activityTitle}>System is healthy</Text>
                    </View>
                </View>
                
                {/* Extra padding for bottom nav */}
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
    welcomeSection: {
        marginBottom: 32,
        marginTop: 10,
    },
    badgeContainer: {
        backgroundColor: '#8455ef',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 1,
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#191c1d',
        letterSpacing: -1,
        lineHeight: 40,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: '#494454',
        marginTop: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        height: 120,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    statBottom: {
        gap: 4,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#494454',
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#191c1d',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#191c1d',
    },
    emptyCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#191c1d',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#494454',
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 240,
    },
    primaryButton: {
        backgroundColor: violetPrimary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        marginTop: 32,
    },
    ordersList: {
        gap: 16,
        marginBottom: 24,
    },
    orderCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    orderId: {
        fontSize: 10,
        fontWeight: 'bold',
        color: violetPrimary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    orderDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    orderProductTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#191c1d',
        marginBottom: 4,
    },
    orderUserEmail: {
        fontSize: 14,
        color: '#494454',
        marginBottom: 12,
    },
    externalIdBox: {
        backgroundColor: '#f8fafc',
        padding: 8,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    externalIdLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    externalIdValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    orderActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    confirmBtn: {
        flex: 1,
        backgroundColor: violetPrimary,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmBtnText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    rejectBtn: {
        backgroundColor: '#fee2e2',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    activityCard: {
        height: 160,
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: 32,
        justifyContent: 'flex-end',
        padding: 20,
    },
    gradientOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(107, 56, 212, 0.7)',
    },
    activityContent: {
        zIndex: 10,
    },
    activityLabel: {
        color: violetLight,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    activityTitle: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '800',
    },
    shadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#111827',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
            },
            android: {
                elevation: 4,
            },
        }),
    }
});
