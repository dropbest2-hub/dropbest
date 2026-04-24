import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import api from '../api/api';
import { Award, Zap, Gift, Trophy, ChevronRight, Wallet, Info } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function RewardsScreen() {
    const [stats, setStats] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [statsRes, leaderboardRes] = await Promise.all([
                api.get('/users/profile'),
                api.get('/users/leaderboard')
            ]);
            setStats(statsRes.data);
            setLeaderboard(leaderboardRes.data);
        } catch (error) {
            console.error('Error fetching rewards data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.brand[500]} />
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.brand[500]]} />
            }
        >
            {/* Header / Coin Card */}
            <View style={styles.header}>
                <View style={styles.coinCard}>
                    <View>
                        <Text style={styles.coinTitle}>Total Balance</Text>
                        <View style={styles.coinRow}>
                            <Award size={32} color={COLORS.accent.yellow} />
                            <Text style={styles.coinValue}>{stats?.coin_count || 0}</Text>
                        </View>
                        <Text style={styles.walletLabel}>
                            <Wallet size={12} color={COLORS.white} /> Wallet: ₹{stats?.wallet_balance || 0}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.redeemBtn}>
                        <Text style={styles.redeemText}>Redeem</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionCard}>
                    <View style={[styles.actionIcon, { backgroundColor: '#F59E0B20' }]}>
                        <Gift size={24} color="#F59E0B" />
                    </View>
                    <Text style={styles.actionText}>Scratch Cards</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                    <View style={[styles.actionIcon, { backgroundColor: '#8B5CF620' }]}>
                        <Zap size={24} color="#8B5CF6" />
                    </View>
                    <Text style={styles.actionText}>Earn More</Text>
                </TouchableOpacity>
            </View>

            {/* Leaderboard Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Leaderboard</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.leaderboardCard}>
                    {leaderboard?.top3?.map((user: any, index: number) => (
                        <View key={user.id} style={styles.leaderboardItem}>
                            <View style={styles.rankBadge}>
                                <Text style={styles.rankText}>{index + 1}</Text>
                            </View>
                            <View style={styles.userAvatar}>
                                {user.avatar_url ? (
                                    <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarPlaceholderText}>{user.name[0]}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{user.name}</Text>
                                <Text style={styles.userLevel}>{user.user_level}</Text>
                            </View>
                            <View style={styles.userScore}>
                                <Award size={14} color={COLORS.accent.yellow} />
                                <Text style={styles.scoreText}>{user.badge_count}</Text>
                            </View>
                        </View>
                    ))}
                    
                    {leaderboard?.currentUser && (
                        <View style={styles.currentUserItem}>
                            <Text style={styles.yourRankLabel}>Your Rank</Text>
                            <View style={styles.leaderboardItem}>
                                <View style={[styles.rankBadge, { backgroundColor: COLORS.brand[500] }]}>
                                    <Text style={[styles.rankText, { color: COLORS.white }]}>{leaderboard.currentUser.rank}</Text>
                                </View>
                                <View style={styles.userInfo}>
                                    <Text style={styles.userName}>You</Text>
                                    <Text style={styles.userLevel}>{leaderboard.currentUser.user_level}</Text>
                                </View>
                                <View style={styles.userScore}>
                                    <Award size={14} color={COLORS.accent.yellow} />
                                    <Text style={styles.scoreText}>{leaderboard.currentUser.badge_count}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </View>

            {/* How it works */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>How to Earn?</Text>
                <View style={styles.infoCard}>
                    <View style={styles.infoItem}>
                        <View style={styles.infoDot} />
                        <Text style={styles.infoText}>Shop through our links to earn coins.</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <View style={styles.infoDot} />
                        <Text style={styles.infoText}>110 Coins = ₹10 Wallet Balance.</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <View style={styles.infoDot} />
                        <Text style={styles.infoText}>Withdraw wallet balance directly to UPI.</Text>
                    </View>
                </View>
            </View>

            <View style={{ height: 40 }} />
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
});
