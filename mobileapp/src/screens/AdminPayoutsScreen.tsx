import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert, Image, SafeAreaView, Platform, StatusBar, Clipboard } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

import { Menu, Wallet, Copy, X, CheckCircle2 } from 'lucide-react-native';
import SideMenuModal from '../components/SideMenuModal';
import api from '../api/api';

const violetPrimary = '#6b38d4';
const background = '#f8f9fa';

export default function AdminPayoutsScreen({ navigation }: any) {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [utrInputs, setUtrInputs] = useState<Record<string, string>>({});

    const fetchPayouts = async () => {
        try {
            const response = await api.get('/admin/payouts');
            setPayouts(response.data || []);
        } catch (error) {
            console.error('Error fetching payouts:', error);
            Alert.alert('Error', 'Failed to load payouts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchPayouts();
        });
        return unsubscribe;
    }, [navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPayouts();
    };

    const handleApprove = async (id: string) => {
        const utr = utrInputs[id];
        if (!utr) {
            Alert.alert('Error', 'Please enter a UTR Number/Transaction ID to mark as paid.');
            return;
        }

        try {
            await api.post(`/admin/payouts/${id}/approve`, { utrNumber: utr });
            Alert.alert('Success', 'Payout marked as paid! User has been notified: "Your payment has been paid"');
            fetchPayouts();
        } catch (error) {
            console.error('Approve failed', error);
            Alert.alert('Error', 'Failed to approve payout');
        }
    };

    const handleReject = (id: string) => {
        Alert.alert(
            'Reject Payout',
            'Reject this payout and refund the user wallet?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Reject', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.post(`/admin/payouts/${id}/reject`);
                            Alert.alert('Success', 'Payout rejected and refunded.');
                            fetchPayouts();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reject payout');
                        }
                    }
                }
            ]
        );
    };

    const handleMenuPress = () => {
        setIsMenuVisible(true);
    };

    const copyToClipboard = (text: string) => {
        Clipboard.setString(text);
        // Alert.alert('Copied', 'UPI ID copied to clipboard');
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color={violetPrimary} />
            </SafeAreaView>
        );
    }

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
                    <TouchableOpacity style={styles.iconButton} onPress={handleMenuPress}>
                        <Menu size={24} color={violetPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Dropbest Admin</Text>
                </View>
                <View style={styles.headerRight}>
                    {/* Image removed as requested */}
                </View>
            </View>

            <ScrollView 
                style={styles.container} 
                contentContainerStyle={styles.contentPadding}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[violetPrimary]} />}
            >
                <View style={styles.pageHeader}>
                    <Text style={styles.title}>Payout Requests</Text>
                    <Text style={styles.subtitle}>Review and process user withdrawal requests.</Text>
                </View>

                {payouts.length === 0 ? (
                    <View style={[styles.emptyState, styles.shadow]}>
                        <View style={styles.emptyIconContainer}>
                            <Wallet size={40} color="#cbd5e1" />
                        </View>
                        <Text style={styles.emptyTitle}>No pending payouts</Text>
                        <Text style={styles.emptySubtitle}>All withdrawal requests have been processed.</Text>
                    </View>
                ) : (
                    <View style={styles.payoutsList}>
                        {payouts.map(payout => (
                            <View key={payout.id} style={[styles.payoutCard, styles.shadow]}>
                                <View style={styles.cardHeader}>
                                    <View style={[
                                        styles.statusBadge, 
                                        payout.status === 'PAID' ? styles.paidBadge : 
                                        payout.status === 'PENDING' ? styles.pendingBadge : 
                                        styles.rejectedBadge
                                    ]}>
                                        <Text style={[
                                            styles.statusText,
                                            payout.status === 'PAID' ? styles.paidText : 
                                            payout.status === 'PENDING' ? styles.pendingText : 
                                            styles.rejectedText
                                        ]}>{payout.status}</Text>
                                    </View>
                                    <Text style={styles.dateText}>{new Date(payout.created_at).toLocaleDateString()}</Text>
                                </View>

                                <View style={styles.amountRow}>
                                    <Text style={styles.amount}>₹{payout.amount}</Text>
                                    <View style={styles.coinBadge}>
                                        <Text style={styles.coinBadgeText}>{payout.coins_used || (payout.amount * 10)} Coins</Text>
                                    </View>
                                </View>
                                
                                <TouchableOpacity style={styles.upiRow} onPress={() => copyToClipboard(payout.upi_id)}>
                                    <Text style={styles.upiLabel}>UPI ID:</Text>
                                    <Text style={styles.upiText}>{payout.upi_id}</Text>
                                    <Copy size={12} color={violetPrimary} />
                                </TouchableOpacity>

                                <Text style={styles.userEmail}>{payout.users?.email}</Text>

                                {payout.status === 'PENDING' && (
                                    <View style={styles.adminAction}>
                                        <TextInput 
                                            style={styles.utrInput}
                                            placeholder="Enter UTR / Transaction ID"
                                            value={utrInputs[payout.id] || ''}
                                            onChangeText={(text) => setUtrInputs({ ...utrInputs, [payout.id]: text })}
                                        />
                                        <View style={styles.btnRow}>
                                            <TouchableOpacity 
                                                style={styles.approveBtn}
                                                onPress={() => handleApprove(payout.id)}
                                            >
                                                <CheckCircle2 size={16} color="#ffffff" style={{ marginRight: 6 }} />
                                                <Text style={styles.btnText}>Mark Paid</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                style={styles.rejectBtn}
                                                onPress={() => handleReject(payout.id)}
                                            >
                                                <X size={20} color="#ba1a1a" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                                {payout.status === 'PAID' && payout.utr_number && (
                                    <View style={styles.utrBadge}>
                                        <Text style={styles.utrText}>UTR: {payout.utr_number}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: background,
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
    pageHeader: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    emptyState: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        marginTop: 20,
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
    },
    payoutsList: {
        gap: 16,
    },
    payoutCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    pendingBadge: { backgroundColor: '#fff7ed' },
    paidBadge: { backgroundColor: '#f0fdf4' },
    rejectedBadge: { backgroundColor: '#fef2f2' },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    pendingText: { color: '#c2410c' },
    paidText: { color: '#15803d' },
    rejectedText: { color: '#b91c1c' },
    dateText: {
        fontSize: 12,
        color: '#7b7486',
        fontWeight: '500',
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    amount: {
        fontSize: 32,
        fontWeight: '800',
        color: '#191c1d',
        letterSpacing: -1,
    },
    coinBadge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#fcd34d',
    },
    coinBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#92400e',
    },
    utrInput: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        marginBottom: 12,
        fontSize: 14,
    },
    upiRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    upiLabel: {
        fontSize: 12,
        color: '#7b7486',
        fontWeight: '600',
    },
    upiText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#191c1d',
    },
    userEmail: {
        fontSize: 14,
        color: '#494454',
        marginBottom: 20,
    },
    adminAction: {
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 20,
        gap: 12,
    },
    input: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        borderWidth: 1,
        borderColor: '#cbc3d7',
        fontSize: 14,
        color: '#191c1d',
    },
    btnRow: {
        flexDirection: 'row',
        gap: 12,
    },
    approveBtn: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: violetPrimary,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        height: 48,
    },
    rejectBtn: {
        width: 48,
        height: 48,
        backgroundColor: '#fff1f2',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ffe4e6',
    },
    btnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.5,
    },
    utrBadge: {
        backgroundColor: '#f0fdf4',
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    utrText: {
        fontSize: 12,
        color: '#166534',
        fontWeight: '700',
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
