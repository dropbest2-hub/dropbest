import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import api from '../api/api';
import { Settings, Package, Heart, LogOut, ChevronRight, User, Mail, Shield, Smartphone, LayoutDashboard } from 'lucide-react-native';

export default function ProfileScreen({ navigation }: any) {
    const { user, logout } = useAuthStore();
    const [stats, setStats] = useState({ watchlistCount: 0, orderCount: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProfileData = async () => {
        try {
            const [watchlistRes, ordersRes] = await Promise.all([
                api.get('/users/watchlist'),
                api.get('/orders/my-orders')
            ]);
            setStats({
                watchlistCount: watchlistRes.data.length,
                orderCount: ordersRes.data.length
            });
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
            <View style={[styles.menuIcon, { backgroundColor: color + '10' }]}>
                <Icon size={20} color={color} />
            </View>
            <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            <ChevronRight size={18} color={COLORS.gray[300]} />
        </TouchableOpacity>
    );

    return (
        <ScrollView 
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.brand[500]]} />
            }
        >
            <View style={styles.header}>
                <View style={styles.profileInfo}>
                    <View style={styles.avatarContainer}>
                        {user?.avatar_url ? (
                            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.placeholderAvatar]}>
                                <Text style={styles.avatarText}>{user?.name?.[0] || user?.email?.[0]?.toUpperCase()}</Text>
                            </View>
                        )}
                        <TouchableOpacity style={styles.editBadge}>
                            <Settings size={14} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.name}>{user?.name || 'User'}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{user?.coin_count || 0}</Text>
                        <Text style={styles.statLabel}>Coins</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.watchlistCount}</Text>
                        <Text style={styles.statLabel}>Watchlist</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.orderCount}</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.menuCard}>
                    <MenuItem 
                        icon={Package} 
                        title="My Orders" 
                        subtitle="Track and manage your orders" 
                        color={COLORS.brand[500]}
                    />
                    <MenuItem 
                        icon={Heart} 
                        title="Watchlist" 
                        subtitle="Your favorite items" 
                        color={COLORS.accent.pink}
                    />
                    <MenuItem 
                        icon={Smartphone} 
                        title="Device Settings" 
                        subtitle="Push notifications & more" 
                        color={COLORS.accent.orange}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>General</Text>
                <View style={styles.menuCard}>
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
                        color={COLORS.gray[500]}
                    />
                    <MenuItem 
                        icon={Mail} 
                        title="Contact Support" 
                        color={COLORS.gray[500]}
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <LogOut size={20} color={COLORS.accent.pink} />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <Text style={styles.version}>DropBest v1.0.0</Text>
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
        marginBottom: 15,
        marginLeft: 4,
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
    }
});
