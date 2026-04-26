import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Image, TextInput, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import api from '../api/api';
import { ChevronLeft, Package, Clock, CheckCircle2, AlertCircle, ExternalLink, Send, Trash2 } from 'lucide-react-native';

export default function MyOrdersScreen({ navigation }: any) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Claim Modal State
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [externalOrderId, setExternalOrderId] = useState('');
    const [purchaseValue, setPurchaseValue] = useState('');
    const [claiming, setClaiming] = useState(false);

    const fetchOrders = useCallback(async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Fetch orders failed', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [fetchOrders])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const handleClaimOrder = async () => {
        if (!externalOrderId || !purchaseValue) {
            Alert.alert('Error', 'Please enter both Order ID and Purchase Amount.');
            return;
        }

        setClaiming(true);
        try {
            await api.put(`/orders/${selectedOrder.id}/claim`, {
                externalOrderId,
                purchaseValue: parseFloat(purchaseValue)
            });
            Alert.alert('Success', 'Order details submitted! Our team will verify it shortly.');
            setShowClaimModal(false);
            setExternalOrderId('');
            setPurchaseValue('');
            fetchOrders();
        } catch (error: any) {
            console.error('Claim order failed', error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to submit order details.');
        } finally {
            setClaiming(false);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        Alert.alert(
            'Cancel Tracking',
            'Are you sure you want to remove this tracking entry?',
            [
                { text: 'No', style: 'cancel' },
                { 
                    text: 'Yes, Cancel', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/orders/${orderId}`);
                            fetchOrders();
                        } catch (error) {
                            console.error('Delete order failed', error);
                        }
                    }
                }
            ]
        );
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return { bg: '#DCFCE7', text: '#15803D', label: 'Confirmed' };
            case 'REJECTED': return { bg: '#FEE2E2', text: '#B91C1C', label: 'Rejected' };
            default: return { bg: '#FEF3C7', text: '#B45309', label: 'Pending' };
        }
    };

    const renderOrderItem = ({ item }: any) => {
        const status = getStatusStyle(item.status);
        const isRedirectOnly = !item.external_order_id;
        
        // Timeline Logic
        const steps = [
            { id: 1, label: 'Clicked', completed: true, active: item.status === 'PENDING' && isRedirectOnly },
            { id: 2, label: 'Submitted', completed: !!item.external_order_id, active: item.status === 'PENDING' && !!item.external_order_id },
            { id: 3, label: 'Verified', completed: item.status === 'CONFIRMED', active: item.status === 'CONFIRMED', isError: item.status === 'REJECTED' }
        ];

        return (
            <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                    <View style={styles.productInfo}>
                        <Image source={{ uri: item.products.image_url }} style={styles.productImage} />
                        <View style={styles.titleArea}>
                            <Text style={styles.productTitle} numberOfLines={1}>{item.products.title}</Text>
                            <View style={styles.dateRow}>
                                <Clock size={10} color={COLORS.gray[400]} />
                                <Text style={styles.orderDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                    </View>
                </View>

                {/* Status Timeline */}
                <View style={styles.timelineContainer}>
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <View style={styles.stepItem}>
                                <View style={[
                                    styles.stepCircle, 
                                    step.completed && { backgroundColor: COLORS.brand[500] },
                                    step.active && { backgroundColor: COLORS.brand[500], borderWidth: 4, borderColor: COLORS.brand[100] },
                                    step.isError && { backgroundColor: '#ef4444' }
                                ]}>
                                    {step.completed && !step.isError && <CheckCircle2 size={12} color={COLORS.white} />}
                                    {step.isError && <AlertCircle size={12} color={COLORS.white} />}
                                </View>
                                <Text style={[styles.stepLabel, (step.completed || step.active) && { color: COLORS.gray[900] }]}>{step.label}</Text>
                            </View>
                            {index < steps.length - 1 && (
                                <View style={[styles.stepLine, steps[index + 1].completed && { backgroundColor: COLORS.brand[500] }]} />
                            )}
                        </React.Fragment>
                    ))}
                </View>

                {isRedirectOnly ? (
                    <View style={styles.claimSection}>
                        <Text style={styles.alertText}>Missing Order ID? Submit it now to earn rewards!</Text>
                        <View style={styles.btnRow}>
                            <TouchableOpacity 
                                style={styles.claimBtn}
                                onPress={() => {
                                    setSelectedOrder(item);
                                    setShowClaimModal(true);
                                }}
                            >
                                <Text style={styles.claimBtnText}>Submit Details</Text>
                                <Send size={14} color={COLORS.white} />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.deleteBtn}
                                onPress={() => handleDeleteOrder(item.id)}
                            >
                                <Trash2 size={18} color={COLORS.gray[400]} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.detailsSection}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>ORDER ID</Text>
                            <Text style={styles.detailValue} numberOfLines={1}>{item.external_order_id}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>VALUE</Text>
                            <Text style={[styles.detailValue, { color: COLORS.brand[600] }]}>₹{item.purchase_value}</Text>
                        </View>
                        {item.status === 'PENDING' && (
                            <TouchableOpacity style={styles.editBtn} onPress={() => {
                                setSelectedOrder(item);
                                setExternalOrderId(item.external_order_id);
                                setPurchaseValue(item.purchase_value?.toString() || '');
                                setShowClaimModal(true);
                            }}>
                                <Text style={styles.editBtnText}>Edit</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.gray[900]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Live Tracking</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList 
                data={orders}
                renderItem={renderOrderItem}
                keyExtractor={(item: any) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.brand[500]]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Package size={60} color={COLORS.gray[200]} />
                        <Text style={styles.emptyTitle}>No tracked orders yet</Text>
                        <Text style={styles.emptySubtitle}>Shop products through our links to start earning rewards.</Text>
                        <TouchableOpacity 
                            style={styles.browseBtn}
                            onPress={() => navigation.navigate('Main')}
                        >
                            <Text style={styles.browseBtnText}>Browse Products</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* Claim Modal */}
            <Modal
                visible={showClaimModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowClaimModal(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Order Details</Text>
                            <TouchableOpacity onPress={() => setShowClaimModal(false)}>
                                <Text style={styles.closeBtn}>Close</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>External Order ID / Transaction ID</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="Paste ID from Amazon/Flipkart"
                                value={externalOrderId}
                                onChangeText={setExternalOrderId}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Purchase Amount (₹)</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="Total bill amount"
                                keyboardType="numeric"
                                value={purchaseValue}
                                onChangeText={setPurchaseValue}
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.submitBtn, claiming && { opacity: 0.7 }]}
                            onPress={handleClaimOrder}
                            disabled={claiming}
                        >
                            {claiming ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.submitBtnText}>Start Tracking Rewards</Text>
                            )}
                        </TouchableOpacity>
                        
                        <Text style={styles.modalFootnote}>
                            Verification usually takes 24-48 hours after delivery.
                        </Text>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
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
        paddingHorizontal: SPACING.md,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: COLORS.white,
        ...SHADOWS.sm,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.gray[900],
    },
    list: {
        padding: SPACING.md,
        paddingBottom: 40,
    },
    orderCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.sm,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    productInfo: {
        flexDirection: 'row',
        flex: 1,
        gap: 12,
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: COLORS.gray[50],
    },
    titleArea: {
        flex: 1,
        justifyContent: 'center',
    },
    productTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.gray[900],
    },
    orderDate: {
        fontSize: 12,
        color: COLORS.gray[400],
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    claimSection: {
        backgroundColor: COLORS.gray[50],
        borderRadius: 16,
        padding: 12,
    },
    alertBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    alertText: {
        fontSize: 11,
        color: '#B45309',
        fontWeight: 'bold',
        flex: 1,
    },
    btnRow: {
        flexDirection: 'row',
        gap: 10,
    },
    claimBtn: {
        flex: 1,
        backgroundColor: COLORS.brand[600],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 44,
        borderRadius: 12,
    },
    claimBtnText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: 'bold',
    },
    deleteBtn: {
        width: 44,
        height: 44,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    detailsSection: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[50],
        paddingTop: 12,
        gap: 20,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 10,
        color: COLORS.gray[400],
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '900',
        color: COLORS.gray[900],
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    timelineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 5,
        marginBottom: 10,
    },
    stepItem: {
        alignItems: 'center',
        width: 60,
    },
    stepCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.gray[200],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    stepLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.gray[400],
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: COLORS.gray[100],
        marginBottom: 16, // Align with circles
    },
    editBtn: {
        justifyContent: 'center',
        paddingHorizontal: 12,
        backgroundColor: COLORS.gray[50],
        borderRadius: 8,
        height: 30,
    },
    editBtnText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.gray[500],
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.gray[800],
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.gray[400],
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
        lineHeight: 20,
    },
    browseBtn: {
        marginTop: 30,
        backgroundColor: COLORS.brand[50],
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 15,
    },
    browseBtnText: {
        color: COLORS.brand[600],
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.gray[900],
    },
    closeBtn: {
        color: COLORS.gray[400],
        fontWeight: 'bold',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.gray[500],
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: COLORS.gray[50],
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.gray[900],
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    submitBtn: {
        backgroundColor: COLORS.gray[900],
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        ...SHADOWS.md,
    },
    submitBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '900',
    },
    modalFootnote: {
        textAlign: 'center',
        fontSize: 11,
        color: COLORS.gray[400],
        marginTop: 15,
        fontWeight: '500',
    }
});
