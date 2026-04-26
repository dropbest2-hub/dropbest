import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, SafeAreaView, Dimensions, TouchableWithoutFeedback, Image } from 'react-native';
import { User, MessageSquare, Shield, AlertCircle, X, ChevronRight, LogOut, Settings } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const violetPrimary = '#6b38d4';

interface SideMenuModalProps {
    visible: boolean;
    onClose: () => void;
    navigation: any;
}

export default function SideMenuModal({ visible, onClose, navigation }: SideMenuModalProps) {
    const { user, logout } = useAuthStore();
    const { isDark } = useTheme();
    
    const handleLogout = async () => {
        onClose();
        await logout();
    };

    const menuItems = [
        { icon: User, label: 'Profile', route: 'ProfileTab' },
        { icon: Settings, label: 'Settings', route: 'Settings' },
        { icon: MessageSquare, label: 'Contact Us', route: 'Contact' },
        { icon: Shield, label: 'Privacy Policy', route: 'Policy' },
        { icon: AlertCircle, label: 'Affiliate Disclaimer', route: 'Disclaimer' },
    ];

    const handleNavigate = (route: string) => {
        onClose();
        if (route) {
            try {
                if (['HomeTab', 'RewardsTab', 'ProfileTab'].includes(route)) {
                    navigation.navigate('Main', { screen: route });
                } else {
                    navigation.navigate(route);
                }
            } catch(e) {
                console.log("Navigation to route failed", e);
            }
        }
    };

    const themeStyles = {
        container: { backgroundColor: isDark ? '#121212' : '#ffffff' },
        header: { borderBottomColor: isDark ? '#333' : '#f1f5f9' },
        text: { color: isDark ? '#ffffff' : '#191c1d' },
        subText: { color: isDark ? '#888' : '#7b7486' },
        divider: { borderTopColor: isDark ? '#333' : '#f1f5f9' },
        icon: isDark ? '#888' : '#494454',
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>
                
                <View style={[styles.menuContainer, themeStyles.container]}>
                    <SafeAreaView style={styles.safeArea}>
                        {/* Header */}
                        <View style={[styles.header, themeStyles.header]}>
                            <View style={styles.userInfo}>
                                {user?.avatar_url ? (
                                    <Image 
                                        source={{ uri: user.avatar_url }}
                                        style={styles.avatar}
                                    />
                                ) : (
                                    <View style={[styles.avatar, { backgroundColor: isDark ? '#2d2d2d' : '#e9ddff', justifyContent: 'center', alignItems: 'center' }]}>
                                        <Text style={{ color: isDark ? COLORS.brand[400] : '#6b38d4', fontWeight: 'bold', fontSize: 18 }}>
                                            {user?.name?.[0] || user?.email?.[0]?.toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                                <View>
                                    <Text style={[styles.userName, themeStyles.text]}>{user?.name || 'User'}</Text>
                                    <Text style={[styles.userEmail, themeStyles.subText]} numberOfLines={1}>{user?.email}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <X size={24} color={isDark ? '#fff' : "#191c1d"} />
                            </TouchableOpacity>
                        </View>

                        {/* Menu Items */}
                        <View style={styles.menuItems}>
                            {menuItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <TouchableOpacity 
                                        key={index} 
                                        style={styles.menuItem}
                                        onPress={() => handleNavigate(item.route)}
                                    >
                                        <View style={styles.menuItemLeft}>
                                            <Icon size={22} color={themeStyles.icon} />
                                            <Text style={[styles.menuItemText, themeStyles.text]}>{item.label}</Text>
                                        </View>
                                        <ChevronRight size={20} color={isDark ? "#444" : "#cbc3d7"} />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Logout */}
                        <TouchableOpacity style={[styles.logoutBtn, themeStyles.divider]} onPress={handleLogout}>
                            <LogOut size={22} color="#ba1a1a" />
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    menuContainer: {
        width: width * 0.8,
        maxWidth: 320,
        backgroundColor: '#ffffff',
        height: '100%',
        elevation: 16,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e2e8f0',
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#191c1d',
    },
    userEmail: {
        fontSize: 12,
        color: '#7b7486',
        marginTop: 2,
    },
    closeBtn: {
        padding: 4,
    },
    menuItems: {
        flex: 1,
        paddingTop: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#191c1d',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ba1a1a',
    }
});
