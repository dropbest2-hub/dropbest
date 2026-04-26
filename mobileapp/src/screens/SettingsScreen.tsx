import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, SafeAreaView, StatusBar, Alert, Modal } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';
import { ChevronLeft, Bell, Shield, Info, LogOut, User as UserIcon, Moon, Globe, Check } from 'lucide-react-native';

export default function SettingsScreen({ navigation }: any) {
    const { user, logout } = useAuthStore();
    const { theme, isDark, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState(user?.notifications_enabled ?? true);
    const [loading, setLoading] = useState(false);

    const toggleNotifications = async (value: boolean) => {
        setNotifications(value);
        try {
            await api.put('/users/profile', { notifications_enabled: value });
        } catch (error) {
            console.error('Failed to update notification settings', error);
            setNotifications(!value); // Rollback
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: () => logout() }
            ]
        );
    };

    const dynamicStyles = {
        container: { backgroundColor: isDark ? '#121212' : COLORS.gray[50] },
        header: { backgroundColor: isDark ? '#1e1e1e' : COLORS.white, borderBottomColor: isDark ? '#333' : COLORS.gray[100] },
        headerTitle: { color: isDark ? COLORS.white : COLORS.gray[900] },
        card: { backgroundColor: isDark ? '#1e1e1e' : COLORS.white, borderColor: isDark ? '#333' : COLORS.gray[100] },
        itemLabel: { color: isDark ? '#e0e0e0' : COLORS.gray[800] },
        iconBox: { backgroundColor: isDark ? '#2d2d2d' : COLORS.gray[50] },
        divider: { backgroundColor: isDark ? '#333' : COLORS.gray[50] },
        sectionTitle: { color: isDark ? '#888' : COLORS.gray[400] },
    };

    const SettingItem = ({ icon: Icon, label, value, onValueChange, type = 'toggle', onPress, rightText }: any) => (
        <TouchableOpacity 
            style={styles.item} 
            onPress={onPress}
            disabled={type === 'toggle'}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.iconBox, dynamicStyles.iconBox]}>
                    <Icon size={20} color={isDark ? COLORS.brand[400] : COLORS.gray[700]} />
                </View>
                <Text style={[styles.itemLabel, dynamicStyles.itemLabel]}>{label}</Text>
            </View>
            <View style={styles.itemRight}>
                {rightText && <Text style={styles.rightText}>{rightText}</Text>}
                {type === 'toggle' ? (
                    <Switch 
                        value={value} 
                        onValueChange={onValueChange}
                        trackColor={{ false: isDark ? '#444' : COLORS.gray[200], true: COLORS.brand[200] }}
                        thumbColor={value ? COLORS.brand[600] : (isDark ? '#888' : COLORS.white)}
                    />
                ) : (
                    <ChevronLeft size={20} color={COLORS.gray[300]} style={{ transform: [{ rotate: '180deg' }] }} />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, dynamicStyles.container]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            
            {/* Header */}
            <View style={[styles.header, dynamicStyles.header]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={isDark ? COLORS.white : COLORS.gray[900]} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Preferences</Text>
                    <View style={[styles.card, dynamicStyles.card]}>
                        <SettingItem 
                            icon={Bell} 
                            label="Push Notifications" 
                            value={notifications} 
                            onValueChange={toggleNotifications}
                        />
                        <View style={[styles.divider, dynamicStyles.divider]} />
                        <SettingItem 
                            icon={Moon} 
                            label="Dark Mode" 
                            value={isDark} 
                            onValueChange={toggleTheme}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Account & Security</Text>
                    <View style={[styles.card, dynamicStyles.card]}>
                        <SettingItem 
                            icon={UserIcon} 
                            label="Profile Information" 
                            type="link"
                            onPress={() => navigation.navigate('EditProfile')}
                        />
                        <View style={[styles.divider, dynamicStyles.divider]} />
                        <SettingItem 
                            icon={Shield} 
                            label="Privacy Policy" 
                            type="link"
                            onPress={() => navigation.navigate('Policy')}
                        />
                        <View style={[styles.divider, dynamicStyles.divider]} />
                        <SettingItem 
                            icon={Info} 
                            label="About Dropbest" 
                            type="link"
                            onPress={() => navigation.navigate('Disclaimer')}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <LogOut size={20} color={COLORS.error} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.4 (Build 12)</Text>
                
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 60,
        ...SHADOWS.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
        marginLeft: 4,
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        ...SHADOWS.sm,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rightText: {
        fontSize: 14,
        color: COLORS.gray[400],
        fontWeight: '500',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#fee2e2',
        padding: 16,
        borderRadius: 20,
        marginTop: 10,
    },
    logoutText: {
        color: '#ef4444',
        fontWeight: 'bold',
        fontSize: 16,
    },
    versionText: {
        textAlign: 'center',
        color: COLORS.gray[400],
        fontSize: 12,
        marginTop: 30,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        paddingBottom: 50,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    langItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    langText: {
        fontSize: 16,
        fontWeight: '500',
    }
});
