import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, TextInput, StatusBar, Platform, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Menu, Search, Filter, Coins, Medal, User } from 'lucide-react-native';
import SideMenuModal from '../components/SideMenuModal';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';

const violetPrimary = '#6b38d4';
const background = '#f8f9fa';

// Stable Search Row to prevent keyboard dismissal
const AdminUsersSearchRow = ({ 
    isDark, 
    searchQuery, 
    setSearchQuery, 
    handleFilterPress 
}: any) => (
    <View style={styles.searchFilterRow}>
        <View style={styles.searchContainer}>
            <Search size={20} color={isDark ? "#666" : "#7b7486"} style={styles.searchIcon} />
            <TextInput 
                style={[styles.searchInput, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333', color: '#ffffff' }]}
                placeholder="Search users..."
                placeholderTextColor={isDark ? "#444" : "#7b7486"}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>
        <TouchableOpacity style={[styles.filterButton, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }]} onPress={handleFilterPress}>
            <Filter size={20} color={isDark ? "#888" : "#494454"} />
        </TouchableOpacity>
    </View>
);

export default function AdminUsersScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data || []);
        } catch (error) {
            console.error('Fetch users failed', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchUsers();
        });
        return unsubscribe;
    }, [navigation, fetchUsers]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const name = user.name || user.email || '';
            return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   user.email?.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [users, searchQuery]);

    const memoizedSearchRow = useMemo(() => (
        <AdminUsersSearchRow 
            isDark={isDark}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleFilterPress={() => Alert.alert("Filters", "Filter users by Role, Level, etc.")}
        />
    ), [isDark, searchQuery]);

    return (
        <SafeAreaView style={[styles.safeArea, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#121212" : "#ffffff"} />
            
            <SideMenuModal 
                visible={isMenuVisible} 
                onClose={() => setIsMenuVisible(false)} 
                navigation={navigation} 
            />
            
            <View style={[styles.header, isDark && { backgroundColor: '#121212', borderBottomColor: '#333' }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setIsMenuVisible(true)}>
                        <Menu size={24} color={violetPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, isDark && { color: '#ffffff' }]}>Dropbest Admin</Text>
                </View>
            </View>

            <ScrollView 
                style={[styles.container, isDark && { backgroundColor: '#121212' }]} 
                contentContainerStyle={styles.contentPadding}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[violetPrimary]} />}
            >
                
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={[styles.pageTitle, isDark && { color: '#ffffff' }]}>Welcome back</Text>
                    <Text style={[styles.pageSubtitle, isDark && { color: '#888' }]}>Manage your registered users and system health.</Text>
                </View>

                {memoizedSearchRow}

                {/* Registered Users Header */}
                <View style={styles.listHeader}>
                    <Text style={[styles.listTitle, isDark && { color: '#ffffff' }]}>Registered Users</Text>
                    <View style={[styles.activeBadge, isDark && { backgroundColor: '#422006' }]}>
                        <Text style={[styles.activeBadgeText, isDark && { color: '#fb923c' }]}>Active Now</Text>
                    </View>
                </View>

                {/* Users List */}
                <View style={styles.usersList}>
                    {loading ? (
                        <ActivityIndicator size="large" color={violetPrimary} style={{ marginVertical: 40 }} />
                    ) : filteredUsers.length === 0 ? (
                        <Text style={styles.emptyText}>No users found.</Text>
                    ) : (
                        filteredUsers.map(user => (
                            <TouchableOpacity key={user.id} style={[styles.userCard, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }, styles.shadow]}>
                                <View style={styles.cardTop}>
                                    <View style={styles.userInfo}>
                                        <Image 
                                            source={{ uri: user.avatar_url || 'https://via.placeholder.com/150' }} 
                                            style={styles.userAvatar} 
                                        />
                                        <View>
                                            <Text style={[styles.userName, isDark && { color: '#ffffff' }]}>{user.name || user.email.split('@')[0]}</Text>
                                            <Text style={[styles.userEmail, isDark && { color: '#888' }]}>{user.email}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.roleBadge, { backgroundColor: user.role === 'ADMIN' ? (isDark ? '#2e1065' : '#e9ddff') : (isDark ? '#262626' : '#f1f5f9') }]}>
                                        <Text style={[styles.roleText, { color: user.role === 'ADMIN' ? (isDark ? '#a78bfa' : '#6b38d4') : (isDark ? '#a3a3a3' : '#494454') }]}>{user.role || 'USER'}</Text>
                                    </View>
                                </View>
 
                                <View style={[styles.cardBottom, isDark && { borderTopColor: '#333' }]}>
                                    <View style={styles.statsItem}>
                                        <Medal size={18} color="#8a5100" />
                                        <View>
                                            <Text style={[styles.statsLabel, isDark && { color: '#666' }]}>LEVEL</Text>
                                            <Text style={styles.statsValueBronze}>{user.user_level || 'Bronze'}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.statsItem}>
                                        <Coins size={18} color={violetPrimary} />
                                        <View>
                                            <Text style={[styles.statsLabel, isDark && { color: '#666' }]}>COINS</Text>
                                            <Text style={[styles.statsValueDark, isDark && { color: '#ffffff' }]}>{user.coin_count || 0}</Text>
                                        </View>
                                    </View>
                                    {user.referred_by?.name && (
                                        <View style={styles.statsItem}>
                                            <User size={18} color="#10b981" />
                                            <View>
                                                <Text style={[styles.statsLabel, isDark && { color: '#666' }]}>REFERRED BY</Text>
                                                <Text style={[styles.statsValueDark, { color: '#059669' }, isDark && { color: '#10b981' }]}>{user.referred_by.name}</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

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
        marginTop: 16,
        marginBottom: 32,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#191c1d',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    pageSubtitle: {
        fontSize: 14,
        color: '#494454',
    },
    searchFilterRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    searchContainer: {
        flex: 1,
        position: 'relative',
    },
    searchIcon: {
        position: 'absolute',
        left: 12,
        top: '50%',
        marginTop: -10,
        zIndex: 2,
    },
    searchInput: {
        backgroundColor: '#ffffff',
        height: 48,
        borderRadius: 24,
        paddingLeft: 40,
        paddingRight: 16,
        fontSize: 14,
        color: '#191c1d',
        borderWidth: 1,
        borderColor: '#cbc3d7',
    },
    filterButton: {
        width: 48,
        height: 48,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#cbc3d7',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#191c1d',
    },
    activeBadge: {
        backgroundColor: '#fff7ed',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activeBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#c2410c',
        textTransform: 'uppercase',
    },
    usersList: {
        gap: 16,
    },
    userCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#191c1d',
    },
    userEmail: {
        fontSize: 12,
        color: '#7b7486',
        marginTop: 2,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    roleText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    cardBottom: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 16,
        gap: 16,
    },
    statsItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statsLabel: {
        fontSize: 8,
        fontWeight: '700',
        color: '#7b7486',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statsValueBronze: {
        fontSize: 14,
        fontWeight: '700',
        color: '#8a5100',
    },
    statsValueDark: {
        fontSize: 14,
        fontWeight: '700',
        color: '#191c1d',
    },
    emptyText: {
        textAlign: 'center',
        color: '#7b7486',
        marginTop: 20,
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
