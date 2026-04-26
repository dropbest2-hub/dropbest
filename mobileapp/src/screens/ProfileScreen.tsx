import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Alert, TextInput, StatusBar, Clipboard } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';
import { Settings, Package, Heart, LogOut, ChevronRight, User, Mail, Shield, Smartphone, LayoutDashboard, Award, Gift, ExternalLink } from 'lucide-react-native';

export default function ProfileScreen({ navigation }: any) {
    const { user, logout } = useAuthStore();
    const { isDark } = useTheme();
    const [stats, setStats] = useState({ watchlistCount: 0, orderCount: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [referralCodeInput, setReferralCodeInput] = useState('');
    const [applyingReferral, setApplyingReferral] = useState(false);
    const [referrals, setReferrals] = useState([]);

    const fetchProfileData = async () => {
        try {
            const [watchlistRes, ordersRes, referralsRes] = await Promise.all([
                api.get('/users/watchlist'),
                api.get('/orders'),
                api.get('/users/referrals')
            ]);
            setStats({
                watchlistCount: watchlistRes.data.length,
                orderCount: ordersRes.data.length
            });
            setRecentOrders(ordersRes.data.slice(0, 3));
            setReferrals(referralsRes.data || []);
        } catch (error) {
            console.warn('Backend not ready for profile stats. Defaulting to 0.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfileData();
    };

    const MenuItem = ({ icon: Icon, title, subtitle, onPress, color = COLORS.gray[700] }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={[styles.menuIcon, { backgroundColor: color + '15' }]}>
                <Icon size={20} color={color} />
            </View>
            <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, isDark && { color: '#e0e0e0' }]}>{title}</Text>
                {subtitle && <Text style={[styles.menuSubtitle, isDark && { color: '#888' }]}>{subtitle}</Text>}
            </View>
            <ChevronRight size={18} color={isDark ? '#444' : COLORS.gray[300]} />
        </TouchableOpacity>
    );

    return (
        <ScrollView 
            style={[styles.container, isDark && { backgroundColor: '#121212' }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.brand[500]]} />
            }
        >
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            
            <View style={[styles.header, isDark && { backgroundColor: '#1e1e1e', borderBottomColor: '#333' }]}>
                <View style={styles.profileInfo}>
                    <View style={styles.avatarContainer}>
                        {user?.avatar_url ? (
                            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.placeholderAvatar]}>
                                <Text style={styles.avatarText}>{user?.name?.[0] || user?.email?.[0]?.toUpperCase()}</Text>
                            </View>
                        )}
                        <TouchableOpacity style={styles.editBadge} onPress={() => navigation.navigate('Settings')}>
                            <Settings size={14} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.name, isDark && { color: COLORS.white }]}>{user?.name || 'User'}</Text>
                    <Text style={[styles.email, isDark && { color: '#888' }]}>{user?.email}</Text>
                    
                    <View style={styles.levelBadge}>
                        <Award size={14} color={COLORS.white} />
                        <Text style={styles.levelText}>{user?.user_level || 'BRONZE'} STATUS</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, isDark && { color: COLORS.white }]}>{user?.coin_count || 0}</Text>
                        <Text style={[styles.statLabel, isDark && { color: '#888' }]}>Coins</Text>
                    </View>
                    <View style={[styles.statDivider, isDark && { backgroundColor: '#333' }]} />
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, isDark && { color: COLORS.white }]}>{stats.watchlistCount}</Text>
                        <Text style={[styles.statLabel, isDark && { color: '#888' }]}>Watchlist</Text>
                    </View>
                    <View style={[styles.statDivider, isDark && { backgroundColor: '#333' }]} />
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, isDark && { color: COLORS.white }]}>{stats.orderCount}</Text>
                        <Text style={[styles.statLabel, isDark && { color: '#888' }]}>Orders</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, isDark && { color: '#666' }]}>Recent Tracking</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('MyOrders')}>
                        <Text style={styles.viewAllBtn}>View All</Text>
                    </TouchableOpacity>
                </View>
                
                {recentOrders.length > 0 ? (
                    <View style={[styles.ordersList, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333', borderWidth: 1 }]}>
                        {recentOrders.map((order: any) => (
                            <TouchableOpacity 
                                key={order.id} 
                                style={[styles.orderItem, isDark && { borderBottomColor: '#333' }]}
                                onPress={() => navigation.navigate('MyOrders')}
                            >
                                <View style={[styles.orderIcon, isDark && { backgroundColor: '#2d2d2d' }]}>
                                    <Package size={20} color={COLORS.brand[400]} />
                                </View>
                                <View style={styles.orderInfo}>
                                    <Text style={[styles.orderProduct, isDark && { color: '#e0e0e0' }]} numberOfLines={1}>
                                        {order.products?.title || 'Tracked Product'}
                                    </Text>
                                    <Text style={styles.orderStatus}>
                                        {order.status === 'CONFIRMED' ? '✅ Confirmed' : 
                                         order.status === 'REJECTED' ? '❌ Rejected' : '🕒 Pending'}
                                    </Text>
                                </View>
                                <ChevronRight size={16} color={isDark ? '#444' : COLORS.gray[300]} />
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={[styles.emptyOrders, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333', borderWidth: 1 }]}>
                        <Package size={32} color={isDark ? '#333' : COLORS.gray[200]} />
                        <Text style={[styles.emptyOrdersText, isDark && { color: '#555' }]}>No tracked orders yet</Text>
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, isDark && { color: '#666' }]}>Account</Text>
                <View style={[styles.menuCard, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333', borderWidth: 1 }]}>
                    {user?.role !== 'ADMIN' && (
                        <MenuItem 
                            icon={Package} 
                            title="My Orders" 
                            subtitle="Track and manage your orders" 
                            onPress={() => navigation.navigate('MyOrders')}
                            color={COLORS.brand[500]}
                        />
                    )}
                    <MenuItem 
                        icon={Heart} 
                        title="Watchlist" 
                        subtitle="Your favorite items" 
                        onPress={() => navigation.navigate('Watchlist')}
                        color={COLORS.accent.pink}
                    />
                    <MenuItem 
                        icon={Smartphone} 
                        title="Device Settings" 
                        subtitle="Push notifications & more" 
                        onPress={() => navigation.navigate('Settings')}
                        color={COLORS.accent.orange}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <View style={[styles.referralCard, isDark && { backgroundColor: COLORS.brand[900] }]}>
                    <View style={styles.referralHeader}>
                        <Gift size={24} color={COLORS.white} />
                        <Text style={styles.referralTitle}>Refer & Earn! 🎁</Text>
                    </View>
                    <Text style={styles.referralSubtitle}>Refer 1 friend who completes 1 purchase to get 25 coins!</Text>
                    
                    <View style={[styles.codeContainer, isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                        <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
                        <View style={styles.codeRow}>
                            <Text style={styles.codeValue}>{user?.referral_code || '---'}</Text>
                            <TouchableOpacity 
                                style={styles.copyBtn}
                                onPress={() => {
                                    if (user?.referral_code) {
                                        Clipboard.setString(user.referral_code);
                                        Alert.alert('Copied! 📋', 'Referral code copied to clipboard.');
                                    }
                                }}
                            >
                                <ExternalLink size={16} color={COLORS.brand[600]} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {user?.referred_by_id ? (
                        <View style={[styles.appliedBadge, isDark && { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                            <Text style={styles.appliedText}>
                                {user.referred_by?.name ? `You were referred by ${user.referred_by.name} ✅` : 'Referral Applied ✅'}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.applyContainer}>
                            <TextInput 
                                style={[styles.referralInput, isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                                placeholder="Enter Friend's Code"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={referralCodeInput}
                                onChangeText={setReferralCodeInput}
                                autoCapitalize="characters"
                            />
                            <TouchableOpacity 
                                style={[styles.applyBtn, applyingReferral && { opacity: 0.7 }]}
                                onPress={async () => {
                                    if (!referralCodeInput) return;
                                    setApplyingReferral(true);
                                    try {
                                        await api.post('/users/referral/apply', { referralCode: referralCodeInput });
                                        Alert.alert('Success', 'Referral code applied!');
                                        
                                        // Refresh user data in store
                                        const { refreshUser } = useAuthStore.getState();
                                        await refreshUser();
                                    } catch (error: any) {
                                        Alert.alert('Error', error.response?.data?.error || 'Failed to apply code');
                                    } finally {
                                        setApplyingReferral(false);
                                    }
                                }}
                                disabled={applyingReferral}
                            >
                                <Text style={styles.applyBtnText}>{applyingReferral ? '...' : 'Apply'}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            {referrals.length > 0 && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isDark && { color: '#666' }]}>My Referrals</Text>
                    <View style={[styles.menuCard, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333', borderWidth: 1 }]}>
                        {referrals.map((ref: any) => (
                            <View key={ref.id} style={[styles.orderItem, isDark && { borderBottomColor: '#333' }]}>
                                <View style={[styles.orderIcon, isDark && { backgroundColor: '#2d2d2d' }]}>
                                    <User size={20} color={COLORS.brand[400]} />
                                </View>
                                <View style={styles.orderInfo}>
                                    <Text style={[styles.orderProduct, isDark && { color: '#e0e0e0' }]} numberOfLines={1}>
                                        {ref.name || 'Friend'}
                                    </Text>
                                    <Text style={styles.orderStatus}>Joined {new Date(ref.created_at).toLocaleDateString()}</Text>
                                </View>
                                <View style={[
                                    styles.statusBadge, 
                                    { backgroundColor: ref.has_completed_order ? '#dcfce7' : '#fef3c7' },
                                    isDark && { backgroundColor: ref.has_completed_order ? '#064e3b' : '#451a03' }
                                ]}>
                                    <Text style={[
                                        styles.statusText, 
                                        { color: ref.has_completed_order ? '#166534' : '#92400e' },
                                        isDark && { color: ref.has_completed_order ? '#4ade80' : '#fbbf24' }
                                    ]}>
                                        {ref.has_completed_order ? 'Order Done ✅' : 'Order Pending 🕒'}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, isDark && { color: '#666' }]}>General</Text>
                <View style={[styles.menuCard, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333', borderWidth: 1 }]}>
                    {user?.role === 'ADMIN' && (
                        <MenuItem 
                            icon={LayoutDashboard} 
                            title="Admin Panel" 
                            subtitle="Manage products and orders"
                            onPress={() => navigation.navigate('AdminMain')}
                            color={COLORS.brand[600]}
                        />
                    )}
                    <MenuItem 
                        icon={Shield} 
                        title="Privacy Policy" 
                        onPress={() => navigation.navigate('Policy')}
                        color={isDark ? '#888' : COLORS.gray[500]}
                    />
                    <MenuItem 
                        icon={Mail} 
                        title="Contact Support" 
                        onPress={() => navigation.navigate('Contact')}
                        color={isDark ? '#888' : COLORS.gray[500]}
                    />
                </View>
            </View>

            <TouchableOpacity style={[styles.logoutButton, isDark && { backgroundColor: '#ba1a1a20' }]} onPress={logout}>
                <LogOut size={20} color={isDark ? '#ff4d4d' : COLORS.accent.pink} />
                <Text style={[styles.logoutText, isDark && { color: '#ff4d4d' }]}>Logout</Text>
            </TouchableOpacity>

            <Text style={[styles.version, isDark && { color: '#444' }]}>DropBest v1.0.0</Text>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    header: {
        backgroundColor: COLORS.white,
        paddingTop: 40,
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        ...SHADOWS.md,
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 25,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: COLORS.brand[50],
    },
    placeholderAvatar: {
        backgroundColor: COLORS.brand[500],
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '900',
        color: COLORS.white,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.brand[600],
        padding: 8,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    name: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.gray[900],
    },
    email: {
        fontSize: 14,
        color: COLORS.gray[400],
        marginTop: 4,
        fontWeight: '500',
    },
    levelBadge: {
        backgroundColor: COLORS.brand[600],
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 12,
    },
    levelText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.xl,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.gray[900],
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.gray[400],
        fontWeight: 'bold',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: '60%',
        backgroundColor: COLORS.gray[100],
        alignSelf: 'center',
    },
    section: {
        padding: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: COLORS.gray[400],
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        marginLeft: 4,
    },
    viewAllBtn: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.brand[600],
    },
    ordersList: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 8,
        ...SHADOWS.sm,
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[50],
    },
    orderIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.brand[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    orderInfo: {
        flex: 1,
    },
    orderProduct: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.gray[800],
    },
    orderStatus: {
        fontSize: 11,
        color: COLORS.gray[400],
        marginTop: 2,
        fontWeight: '600',
    },
    emptyOrders: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm,
    },
    emptyOrdersText: {
        fontSize: 13,
        color: COLORS.gray[300],
        marginTop: 10,
        fontWeight: 'bold',
    },
    menuCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 8,
        ...SHADOWS.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    menuIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.gray[900],
    },
    menuSubtitle: {
        fontSize: 12,
        color: COLORS.gray[400],
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginHorizontal: SPACING.lg,
        backgroundColor: COLORS.accent.pink + '10',
        borderRadius: 20,
        marginBottom: 10,
    },
    referralCard: {
        backgroundColor: COLORS.brand[600],
        borderRadius: 30,
        padding: 20,
        ...SHADOWS.md,
    },
    referralHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    referralTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '900',
    },
    referralSubtitle: {
        color: COLORS.brand[100],
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 18,
        marginBottom: 20,
    },
    codeContainer: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        marginBottom: 15,
    },
    codeLabel: {
        color: COLORS.brand[100],
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 8,
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    codeValue: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 4,
    },
    copyBtn: {
        backgroundColor: COLORS.white,
        padding: 6,
        borderRadius: 8,
    },
    applyContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    referralInput: {
        flex: 1,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        paddingHorizontal: 15,
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    applyBtn: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyBtnText: {
        color: COLORS.brand[600],
        fontWeight: '900',
        fontSize: 14,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.accent.pink,
        marginLeft: 10,
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: COLORS.gray[300],
        marginBottom: 40,
        fontWeight: 'bold',
    },
    appliedBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    appliedText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    }
});
