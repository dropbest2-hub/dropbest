import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, Platform, StatusBar, ActivityIndicator, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { Menu, CheckCircle2, Package, Filter, XCircle } from 'lucide-react-native';
import SideMenuModal from '../components/SideMenuModal';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';

const violetPrimary = '#6b38d4';
const violetLight = '#e9ddff';
const background = '#f8f9fa';

export default function AdminDashboardScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Action State
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    
    // Form State
    const [purchaseValue, setPurchaseValue] = useState('');
    const [coinsOverride, setCoinsOverride] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

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

    const handleConfirmOrder = async () => {
        if (!purchaseValue) {
            Alert.alert('Error', 'Please enter the purchase value.');
            return;
        }

        setActionLoading(true);
        try {
            const response = await api.post(`/admin/orders/${selectedOrder.id}/confirm`, {
                purchaseValue: parseFloat(purchaseValue),
                coins: coinsOverride ? parseInt(coinsOverride) : null
            });
            const awarded = response.data?.badges || response.data?.coins || 'N/A';
            Alert.alert('Success', `Order confirmed! Coins Awarded: ${awarded}`);
            setShowConfirmModal(false);
            setPurchaseValue('');
            setCoinsOverride('');
            fetchOrders();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to confirm order.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectOrder = async () => {
        setActionLoading(true);
        try {
            await api.put(`/admin/orders/${selectedOrder.id}/reject`, {
                message: rejectReason || null
            });
            Alert.alert('Success', 'Order rejected.');
            setShowRejectModal(false);
            setRejectReason('');
            fetchOrders();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to reject order.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#121212" : "#ffffff"} />
            
            <SideMenuModal 
                visible={isMenuVisible} 
                onClose={() => setIsMenuVisible(false)} 
                navigation={navigation} 
            />
 
            {/* Header */}
            <View style={[styles.header, isDark && { backgroundColor: '#121212', borderBottomColor: '#333' }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setIsMenuVisible(true)}>
                        <Menu size={24} color={violetPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, isDark && { color: '#ffffff' }]}>Dropbest Admin</Text>
                </View>
                <View style={styles.headerRight}>
                    {/* Image removed as requested */}
                </View>
            </View>
 
            <ScrollView 
                style={[styles.container, isDark && { backgroundColor: '#121212' }]} 
                contentContainerStyle={styles.contentPadding}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[violetPrimary]} />}
            >
                
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>SYSTEM ADMIN</Text>
                    </View>
                    <Text style={[styles.welcomeTitle, isDark && { color: '#ffffff' }]}>Welcome back, DROPBEST!</Text>
                    <Text style={[styles.welcomeSubtitle, isDark && { color: '#888' }]}>Manage your platform confirmations and activities.</Text>
                </View>
 
                {/* Quick Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }, styles.shadow]}>
                        <Package size={24} color={violetPrimary} />
                        <View style={styles.statBottom}>
                            <Text style={[styles.statLabel, isDark && { color: '#666' }]}>TOTAL PENDING</Text>
                            <Text style={[styles.statValue, { color: violetPrimary }]}>{orders.length}</Text>
                        </View>
                    </View>
                    <View style={[styles.statCard, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }, styles.shadow]}>
                        <CheckCircle2 size={24} color="#8a5100" />
                        <View style={styles.statBottom}>
                            <Text style={[styles.statLabel, isDark && { color: '#666' }]}>COMPLETED</Text>
                            <Text style={[styles.statValue, isDark && { color: '#ffffff' }]}>1,248</Text>
                        </View>
                    </View>
                </View>
 
                {/* Confirmations Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, isDark && { color: '#ffffff' }]}>40-Day Purchase Confirmations</Text>
                    <TouchableOpacity>
                        <Filter size={20} color={isDark ? "#888" : "#494454"} />
                    </TouchableOpacity>
                </View>
 
                {/* Orders List / Empty State */}
                {loading ? (
                    <ActivityIndicator size="large" color={violetPrimary} style={{ marginVertical: 40 }} />
                ) : orders.length === 0 ? (
                    <View style={[styles.emptyCard, isDark && { backgroundColor: '#1a1a1a', borderColor: '#333' }, styles.shadow]}>
                        <View style={styles.emptyIconContainer}>
                            <Package size={40} color="#cbd5e1" />
                        </View>
                        <Text style={[styles.emptyTitle, isDark && { color: '#ffffff' }]}>No pending orders to confirm</Text>
                        <Text style={[styles.emptySubtitle, isDark && { color: '#666' }]}>Everything is up to date. New purchase confirmations will appear here.</Text>
                    </View>
                ) : (
                    <View style={styles.ordersList}>
                        {orders.map(order => (
                            <View key={order.id} style={[styles.orderCard, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }, styles.shadow]}>
                                <View style={styles.orderHeader}>
                                    <Text style={styles.orderId}>Order #{order.id.split('-')[0]}</Text>
                                    <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</Text>
                                </View>
                                <Text style={[styles.orderProductTitle, isDark && { color: '#ffffff' }]}>{order.products?.title}</Text>
                                <Text style={[styles.orderUserEmail, isDark && { color: '#888' }]}>{order.users?.email}</Text>
                                {order.external_order_id && (
                                    <View style={[styles.externalIdBox, isDark && { backgroundColor: '#252525', borderColor: '#333' }]}>
                                        <Text style={styles.externalIdLabel}>User Provided Order ID</Text>
                                        <Text style={[styles.externalIdValue, isDark && { color: '#ffffff' }]}>{order.external_order_id}</Text>
                                    </View>
                                )}
                                <View style={styles.orderActions}>
                                    <TouchableOpacity 
                                        style={styles.confirmBtn} 
                                        onPress={() => {
                                            setSelectedOrder(order);
                                            setPurchaseValue(order.purchase_value?.toString() || '');
                                            setShowConfirmModal(true);
                                        }}
                                    >
                                        <Text style={styles.confirmBtnText}>Confirm</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.rejectBtn, isDark && { backgroundColor: '#421d1d' }]} 
                                        onPress={() => {
                                            setSelectedOrder(order);
                                            setShowRejectModal(true);
                                        }}
                                    >
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

            {/* Confirm Modal */}
            {showConfirmModal && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, isDark && { backgroundColor: '#1e1e1e' }, styles.shadow]}>
                        <Text style={[styles.modalTitle, isDark && { color: '#ffffff' }]}>Confirm Order</Text>
                        <Text style={styles.modalSubtitle}>Order #{selectedOrder?.id.split('-')[0]}</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, isDark && { color: '#888' }]}>Purchase Value (₹)</Text>
                            <TextInput 
                                style={[styles.textInput, isDark && { backgroundColor: '#252525', borderColor: '#333', color: '#ffffff' }]}
                                placeholder="Enter actual order value"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                value={purchaseValue}
                                onChangeText={setPurchaseValue}
                            />
                        </View>
 
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, isDark && { color: '#888' }]}>Coins (Optional Override)</Text>
                            <TextInput 
                                style={[styles.textInput, isDark && { backgroundColor: '#252525', borderColor: '#333', color: '#ffffff' }]}
                                placeholder="Auto-calculated if empty"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                value={coinsOverride}
                                onChangeText={setCoinsOverride}
                            />
                        </View>
 
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.cancelBtn, isDark && { borderColor: '#333' }]} onPress={() => setShowConfirmModal(false)}>
                                <Text style={[styles.cancelBtnText, isDark && { color: '#888' }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmActionBtn} onPress={handleConfirmOrder} disabled={actionLoading}>
                                {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmActionBtnText}>Confirm & Award</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, styles.shadow]}>
                        <Text style={styles.modalTitle}>Reject Order</Text>
                        <Text style={styles.modalSubtitle}>Order #{selectedOrder?.id.split('-')[0]}</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Reason (Sent to user)</Text>
                            <TextInput 
                                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                                placeholder="e.g. Order ID not found / Canceled by store"
                                multiline
                                value={rejectReason}
                                onChangeText={setRejectReason}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRejectModal(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.confirmActionBtn, { backgroundColor: '#dc2626' }]} onPress={handleRejectOrder} disabled={actionLoading}>
                                {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmActionBtnText}>Reject Order</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
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
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#191c1d',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: 'bold',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#494454',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#1e293b',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#64748b',
        fontWeight: 'bold',
    },
    confirmActionBtn: {
        flex: 2,
        backgroundColor: violetPrimary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmActionBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});
