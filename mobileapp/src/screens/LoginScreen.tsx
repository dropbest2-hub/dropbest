import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen() {
    const login = useAuthStore(state => state.login);

    const handleAdminLogin = async () => {
        const mockAdminUser = {
            id: 'admin-123',
            email: 'admin@dropbest.com',
            name: 'Admin User',
            avatar_url: null,
            role: 'ADMIN',
            badge_count: 0,
            coin_count: 0,
            wallet_balance: 0,
            user_level: 'ADMIN'
        };
        await login('mock-admin-token', mockAdminUser);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logo}>D</Text>
                    </View>
                    <Text style={styles.title}>DropBest!</Text>
                    <Text style={styles.subtitle}>Admin Portal</Text>
                </View>

                <View style={styles.loginCard}>
                    <Text style={styles.loginTitle}>Development Mode</Text>
                    <Text style={styles.loginDesc}>Google Auth has been removed for now so we can focus entirely on building the new Admin UI.</Text>

                    <TouchableOpacity 
                        onPress={handleAdminLogin}
                        style={styles.googleButton}
                    >
                        <Text style={styles.googleText}>Enter Admin Dashboard</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.brand[600],
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 50,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        backgroundColor: COLORS.white,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        ...SHADOWS.lg,
    },
    logo: {
        fontSize: 40,
        fontWeight: '900',
        color: COLORS.brand[600],
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
        marginTop: 5,
    },
    loginCard: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 40,
        paddingBottom: 60,
        ...SHADOWS.lg,
    },
    loginTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.gray[900],
        marginBottom: 10,
    },
    loginDesc: {
        fontSize: 16,
        color: COLORS.gray[500],
        fontWeight: '500',
        lineHeight: 24,
        marginBottom: 35,
    },
    googleButton: {
        backgroundColor: COLORS.brand[600],
        height: 65,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm,
    },
    googleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    }
});


