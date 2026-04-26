import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Dimensions, Alert, TextInput, Modal, StatusBar } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import { Award, Zap, Gift, Trophy, ChevronRight, Wallet, Info, HelpCircle, AlertTriangle, Check, IndianRupee } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CoinIcon = ({ size = 24, color = "#B45309" }) => (
    <View style={{
        width: size + 10,
        height: size + 10,
        borderRadius: (size + 10) / 2,
        backgroundColor: '#FDE68A',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#F59E0B',
    }}>
        <IndianRupee size={size} color={color} strokeWidth={3} />
    </View>
);

export default function RewardsScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const { user, refreshUser } = useAuthStore();
    const [stats, setStats] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<any>(null);
    const [scratchCards, setScratchCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Withdrawal State
    const [upiId, setUpiId] = useState('');
    const [withdrawCoins, setWithdrawCoins] = useState('');
    const [withdrawing, setWithdrawing] = useState(false);
    const [converting, setConverting] = useState(false);
    const [showRedeemModal, setShowRedeemModal] = useState(false);

    const fetchData = async () => {
        try {
            const [statsRes, leaderboardRes, scratchRes] = await Promise.all([
                api.get('/users/profile'),
                api.get('/users/leaderboard'),
                api.get('/rewards/scratch-cards')
            ]);
            setStats(statsRes.data);
            setLeaderboard(leaderboardRes.data);
            setScratchCards(scratchRes.data.filter((c: any) => c.status === 'PENDING'));
        } catch (error) {
            console.error('Error fetching rewards data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchData();
            refreshUser();
        });
        return unsubscribe;
    }, [navigation, refreshUser]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleConvert = async (amount: number) => {
        try {
            setConverting(true);
            await api.post('/rewards/convert', { coinsToUse: amount });
            Alert.alert('Success', `Redeemed ${amount} coins! Balance added to wallet.`);
            fetchData();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to redeem coins');
        } finally {
            setConverting(false);
        }
    };

    const handleWithdraw = async () => {
        if (!upiId || !withdrawCoins) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const coins = parseInt(withdrawCoins);
        if (isNaN(coins) || coins < 100) {
            Alert.alert('Error', 'Minimum withdrawal is 100 coins');
            return;
        }

        if (coins > (stats?.coin_count || 0)) {
            Alert.alert('Error', 'Insufficient coins balance');
            return;
        }

        try {
            setWithdrawing(true);
            await api.post('/rewards/payout', { 
                upiId, 
                coins: coins,
                amount: coins / 10 // 100 coins = 10 rs
            });
            Alert.alert('Success', 'Payout request submitted successfully!');
            setWithdrawCoins('');
            setUpiId('');
            setShowRedeemModal(false);
            fetchData();
            refreshUser();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to submit payout request');
        } finally {
            setWithdrawing(false);
        }
    };

    const handleRedeem = () => {
        if ((stats?.coin_count || 0) < 100) {
            Alert.alert('Insufficient Balance', 'You need at least 100 coins to request a payout.');
            return;
        }
        setShowRedeemModal(true);
    };

    const handleClaimScratch = async (id: string) => {
        try {
            const response = await api.post(`/rewards/scratch-cards/${id}/claim`);
            Alert.alert('Boom! 💥', response.data.message);
            fetchData();
        } catch (error) {
            Alert.alert('Error', 'Failed to claim card reward.');
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.center, isDark && { backgroundColor: '#121212' }]}>
                <ActivityIndicator size="large" color={COLORS.brand[500]} />
            </View>
        );
    }

    return (
        <ScrollView 
            style={[styles.container, isDark && { backgroundColor: '#121212' }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.brand[500]]} />
            }
        >
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            
            {/* Header / Coin Card */}
            <View style={styles.header}>
                <View style={[styles.coinCard, isDark && { backgroundColor: COLORS.brand[900] }]}>
                    <View>
                        <Text style={styles.coinTitle}>Total Balance</Text>
                        <View style={styles.coinRow}>
                            <CoinIcon size={24} />
                            <Text style={styles.coinValue}>{stats?.coin_count || 0}</Text>
                        </View>
                        <Text style={styles.walletLabel}>
                            <Wallet size={12} color={COLORS.white} /> Wallet: ₹{stats?.wallet_balance || 0}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.redeemBtn} onPress={handleRedeem}>
                        <Text style={styles.redeemText}>Withdraw</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsRow}>
                <TouchableOpacity style={[styles.actionCard, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333', borderWidth: 1 }]} onPress={() => Alert.alert('How to Scratch', 'Tap on any mystery card to reveal your coins!')}>
                    <View style={[styles.actionIcon, { backgroundColor: '#F59E0B20' }]}>
                        <Gift size={24} color="#F59E0B" />
                    </View>
                    <Text style={[styles.actionText, isDark && { color: '#e0e0e0' }]}>Scratch</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionCard, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333', borderWidth: 1 }]} onPress={handleRedeem}>
                    <View style={[styles.actionIcon, { backgroundColor: '#10B98120' }]}>
                        <Wallet size={24} color="#10B981" />
                    </View>
                    <Text style={[styles.actionText, isDark && { color: '#e0e0e0' }]}>Withdraw</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionCard, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333', borderWidth: 1 }]} onPress={() => navigation.navigate('HowToTrack')}>
                    <View style={[styles.actionIcon, { backgroundColor: '#8B5CF620' }]}>
                        <HelpCircle size={24} color="#8B5CF6" />
                    </View>
                    <Text style={[styles.actionText, isDark && { color: '#e0e0e0' }]}>How to?</Text>
                </TouchableOpacity>
            </View>

            {/* Mystery Scratch Cards */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, isDark && { color: '#e0e0e0' }]}>Mystery Scratch Cards</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scratchRow}>
                    {scratchCards.length > 0 ? (
                        scratchCards.map((card: any) => (
                            <TouchableOpacity 
                                key={card.id} 
                                style={[styles.scratchCard, isDark && { backgroundColor: COLORS.brand[800] }]}
                                onPress={() => handleClaimScratch(card.id)}
                            >
                                <View style={styles.scratchInner}>
                                    <Gift size={32} color={COLORS.white} />
                                    <Text style={styles.scratchTitle}>TAP TO REVEAL</Text>
                                    <Text style={styles.scratchSubtitle}>Mystery Coins</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={[styles.lockedScratch, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }]}>
                            <Gift size={32} color={isDark ? '#333' : COLORS.gray[300]} />
                            <Text style={[styles.lockedText, isDark && { color: '#444' }]}>LOCKED</Text>
                            <Text style={[styles.lockedSub, isDark && { color: '#333' }]}>Purchase to unlock</Text>
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Convert Coins */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, isDark && { color: '#e0e0e0' }]}>Redeem Coins</Text>
                <View style={styles.redeemOptions}>
                    <View style={[styles.redeemOption, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333', borderWidth: 1 }]}>
                        <View style={styles.tierHeader}>
                            <Text style={[styles.tierTitle, isDark && { color: '#666' }]}>Basic Credit</Text>
                            <Text style={[styles.tierValue, isDark && { color: '#e0e0e0' }]}>₹10 INR</Text>
                        </View>
                        <TouchableOpacity 
                            style={[styles.tierBtn, isDark && { backgroundColor: '#2d2d2d' }, styles.disabledBtn]}
                            disabled={true}
                            onPress={() => {}}
                        >
                            <Text style={[styles.tierBtnText, isDark && { color: '#888' }]}>100 Coins</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.redeemOption, { backgroundColor: isDark ? '#1e1e1e' : COLORS.brand[50], borderColor: isDark ? COLORS.brand[900] : 'transparent', borderWidth: isDark ? 1 : 0 }]}>
                        <View style={styles.tierHeader}>
                            <Text style={[styles.tierTitle, isDark && { color: COLORS.brand[400] }]}>Elite Credit</Text>
                            <Text style={[styles.tierValue, isDark && { color: COLORS.white }]}>₹20 INR</Text>
                        </View>
                        <TouchableOpacity 
                            style={[styles.tierBtn, { backgroundColor: COLORS.brand[600] }, styles.disabledBtn]}
                            disabled={true}
                            onPress={() => {}}
                        >
                            <Text style={[styles.tierBtnText, { color: COLORS.white }]}>200 Coins</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>


            {/* How it works */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, isDark && { color: '#e0e0e0' }]}>How to Earn?</Text>
                <View style={[styles.infoCard, isDark && { backgroundColor: '#1a1a1a', borderColor: COLORS.brand[900], borderWidth: 1 }]}>
                    <View style={styles.infoItem}>
                        <View style={styles.infoDot} />
                        <Text style={[styles.infoText, isDark && { color: '#aaa' }]}>Shop through our links to earn coins.</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <View style={styles.infoDot} />
                        <Text style={[styles.infoText, isDark && { color: '#aaa' }]}>Minimum ₹300 purchased earn coins 30.</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <View style={styles.infoDot} />
                        <Text style={[styles.infoText, isDark && { color: '#aaa' }]}>100 Coins = ₹10 Wallet Balance.</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <View style={styles.infoDot} />
                        <Text style={[styles.infoText, isDark && { color: '#aaa' }]}>Withdraw wallet balance directly to UPI.</Text>
                    </View>
                </View>
            </View>

            <View style={{ height: 40 }} />
            
            {/* Withdrawal Modal */}
            <Modal
                visible={showRedeemModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowRedeemModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, isDark && { backgroundColor: '#1e1e1e' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, isDark && { color: COLORS.white }]}>Withdraw Cash 🏦</Text>
                            <TouchableOpacity onPress={() => setShowRedeemModal(false)}>
                                <Text style={styles.closeBtn}>Close</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.walletInfo, isDark && { backgroundColor: '#10B98110', borderColor: '#10B98130' }]}>
                            <Text style={[styles.walletInfoLabel, isDark && { color: '#10B981' }]}>Available for Withdrawal</Text>
                            <Text style={[styles.walletInfoValue, isDark && { color: '#10B981' }]}>{stats?.coin_count || 0} Coins</Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && { color: '#666' }]}>UPI ID (GPay / PhonePe / Paytm)</Text>
                            <TextInput 
                                style={[styles.input, isDark && { backgroundColor: '#2d2d2d', borderColor: '#333', color: COLORS.white }]}
                                placeholder="name@okhdfc"
                                placeholderTextColor="#444"
                                value={upiId}
                                onChangeText={setUpiId}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, isDark && { color: '#e0e0e0' }]}>Coins to Withdraw</Text>
                            <TextInput 
                                style={[styles.textInput, isDark && { backgroundColor: '#2d2d2d', borderColor: '#444', color: '#fff' }]}
                                placeholder="e.g. 500"
                                placeholderTextColor="#888"
                                keyboardType="numeric"
                                value={withdrawCoins}
                                onChangeText={setWithdrawCoins}
                            />
                            {withdrawCoins !== '' && parseInt(withdrawCoins) > (stats?.coin_count || 0) && (
                                <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, fontWeight: 'bold' }}>Insufficient coins!</Text>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, isDark && { color: '#e0e0e0' }]}>Estimated Value (₹)</Text>
                            <View style={[styles.textInput, isDark && { backgroundColor: '#1e1e1e', borderColor: '#444' }, { backgroundColor: '#f3f4f6', justifyContent: 'center' }]}>
                                <Text style={[isDark ? { color: '#aaa' } : { color: '#666' }]}>
                                    {withdrawCoins !== '' ? `₹${(parseInt(withdrawCoins) / 10).toFixed(2)}` : '₹0.00'}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 10, color: '#888', marginTop: 4 }}>Conversion: 100 Coins = ₹10</Text>
                        </View>

                        <TouchableOpacity 
                            style={[styles.submitBtn, (withdrawing || (stats?.coin_count || 0) < 100) && { opacity: 0.7 }]}
                            onPress={handleWithdraw}
                            disabled={withdrawing || (stats?.coin_count || 0) < 100}
                        >
                            {withdrawing ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.submitBtnText}>Request Payout</Text>
                            )}
                        </TouchableOpacity>
                        
                        <Text style={[styles.modalFootnote, isDark && { color: '#444' }]}>
                            Payments are processed within 48 hours to your UPI ID.
                        </Text>
                    </View>
                </View>
            </Modal>
        </ScrollView>
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
        padding: SPACING.lg,
        paddingTop: 20,
    },
    coinCard: {
        backgroundColor: COLORS.brand[600],
        borderRadius: 32,
        padding: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...SHADOWS.lg,
    },
    coinTitle: {
        color: COLORS.brand[100],
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    coinRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginVertical: 8,
    },
    coinValue: {
        color: COLORS.white,
        fontSize: 36,
        fontWeight: '900',
    },
    walletLabel: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    redeemBtn: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 18,
    },
    redeemText: {
        color: COLORS.brand[700],
        fontWeight: '900',
        fontSize: 14,
    },
    actionsRow: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        gap: 15,
        marginBottom: 30,
    },
    actionCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 15,
        alignItems: 'center',
        ...SHADOWS.sm,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    actionText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.gray[800],
    },
    section: {
        paddingHorizontal: SPACING.lg,
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.gray[900],
    },
    viewAll: {
        fontSize: 14,
        color: COLORS.brand[600],
        fontWeight: 'bold',
    },
    leaderboardCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 10,
        ...SHADOWS.sm,
    },
    leaderboardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    rankBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.gray[600],
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.brand[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPlaceholderText: {
        color: COLORS.brand[700],
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.gray[900],
    },
    userLevel: {
        fontSize: 11,
        color: COLORS.brand[600],
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    userScore: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.gray[50],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    scoreText: {
        fontSize: 13,
        fontWeight: '900',
        color: COLORS.gray[900],
    },
    currentUserItem: {
        marginTop: 5,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[50],
    },
    yourRankLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.gray[400],
        textTransform: 'uppercase',
        marginLeft: 12,
        marginTop: 5,
    },
    infoCard: {
        backgroundColor: COLORS.brand[50],
        borderRadius: 24,
        padding: 20,
        gap: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.brand[500],
    },
    infoText: {
        fontSize: 13,
        color: COLORS.brand[800],
        fontWeight: '600',
    },
    scratchRow: {
        paddingVertical: 10,
        gap: 15,
    },
    scratchCard: {
        width: 160,
        height: 120,
        backgroundColor: COLORS.brand[600],
        borderRadius: 20,
        padding: 4,
        ...SHADOWS.md,
    },
    scratchInner: {
        flex: 1,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
        borderStyle: 'dashed',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scratchTitle: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '900',
        marginTop: 10,
    },
    scratchSubtitle: {
        color: COLORS.brand[100],
        fontSize: 8,
        fontWeight: 'bold',
        marginTop: 2,
    },
    lockedScratch: {
        width: 160,
        height: 120,
        backgroundColor: COLORS.gray[100],
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    lockedText: {
        color: COLORS.gray[400],
        fontSize: 12,
        fontWeight: '900',
        marginTop: 10,
    },
    lockedSub: {
        color: COLORS.gray[300],
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 2,
    },
    redeemOptions: {
        flexDirection: 'row',
        gap: 15,
    },
    redeemOption: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 15,
        ...SHADOWS.sm,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    tierHeader: {
        marginBottom: 15,
    },
    tierTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.gray[400],
        textTransform: 'uppercase',
    },
    tierValue: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.gray[900],
        marginTop: 2,
    },
    tierBtn: {
        backgroundColor: COLORS.gray[100],
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tierBtnText: {
        fontSize: 12,
        fontWeight: '900',
        color: COLORS.gray[600],
    },
    disabledBtn: {
        opacity: 0.5,
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
    walletInfo: {
        backgroundColor: '#10B98110',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#10B98120',
    },
    walletInfoLabel: {
        fontSize: 12,
        color: '#059669',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    walletInfoValue: {
        fontSize: 32,
        fontWeight: '900',
        color: '#047857',
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
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.gray[500],
        marginBottom: 8,
        marginLeft: 4,
    },
    textInput: {
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
        backgroundColor: '#10B981',
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
