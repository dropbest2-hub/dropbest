import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import api from '../api/api';
import { ChevronLeft, Check, X, Package, Calendar, User } from 'lucide-react-native';

export default function AdminOrdersScreen({ navigation }: any) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [purchaseValues, setPurchaseValues] = useState<Record<string, string>>({});

    const fetchOrders = async () => {
        try {
            const response = await api.get('/admin/orders');
            setOrders(response.data || []);
        } catch (error) {
            console.error('Error fetching admin orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const handleConfirm = async (orderId: string) => {
        const val = parseFloat(purchaseValues[orderId]);
        if (isNaN(val)) {
            Alert.alert('Error', 'Please enter a valid purchase value.');
            return;
        }

        try {
            await api.post(`/admin/orders/${orderId}/confirm`, { purchaseValue: val });
            Alert.alert('Success', 'Order confirmed!');
            setOrders(prev => prev.filter(o => o.id !== orderId));
        } catch (error) {
            Alert.alert('Error', 'Failed to confirm order.');
        }
    };

    const handleReject = (orderId: string) => {
        Alert.alert(
            'Reject Order',
            'Are you sure you want to reject this order?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Reject', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.post(`/admin/orders/${orderId}/reject`);
                            setOrders(prev => prev.filter(o => o.id !== orderId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reject order.');
                        }
                    }
                }
            ]
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.brand[500]} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.gray[900]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Confirmations</Text>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {orders.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Package size={48} color={COLORS.gray[200]} />
                        <Text style={styles.emptyText}>No pending orders to confirm.</Text>
                    </View>
                ) : (
                    orders.map(order => (
                        <View key={order.id} style={styles.orderCard}>
                            <View style={styles.orderHeader}>
                                <Text style={styles.orderId}>ID: {order.id.split('-')[0].toUpperCase()}</Text>
                                <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</Text>
                            </View>
                            
                            <Text style={styles.productTitle}>{order.products?.title}</Text>
                            
                            <View style={styles.userInfo}>
                                <User size={14} color={COLORS.gray[400]} />
                                <Text style={styles.userText}>{order.users?.email}</Text>
                            </View>

                            <View style={styles.actionRow}>
                                <TextInput 
                                    placeholder="Value (₹)"
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={purchaseValues[order.id] || ''}
                                    onChangeText={(text) => setPurchaseValues(prev => ({ ...prev, [order.id]: text }))}
                                />
                                <TouchableOpacity 
                                    style={styles.confirmBtn}
                                    onPress={() => handleConfirm(order.id)}
                                >
                                    <Check size={20} color={COLORS.white} />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.rejectBtn}
                                    onPress={() => handleReject(order.id)}
                                >
                                    <X size={20} color={COLORS.accent.pink} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: COLORS.white,
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.gray[900],
        marginLeft: 10,
    },
    scroll: {
        padding: SPACING.md,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        color: COLORS.gray[400],
        marginTop: 10,
        fontWeight: 'bold',
    },
    orderCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        ...SHADOWS.sm,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    orderId: {
        fontSize: 12,
        fontWeight: '900',
        color: COLORS.brand[600],
    },
    orderDate: {
        fontSize: 12,
        color: COLORS.gray[400],
    },
    productTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.gray[900],
        marginBottom: 8,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
    },
    userText: {
        fontSize: 13,
        color: COLORS.gray[500],
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 44,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
        fontWeight: 'bold',
    },
    confirmBtn: {
        width: 44,
        height: 44,
        backgroundColor: COLORS.brand[600],
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectBtn: {
        width: 44,
        height: 44,
        backgroundColor: COLORS.accent.pink + '10',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
