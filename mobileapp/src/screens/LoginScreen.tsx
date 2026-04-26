import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, StatusBar, Platform, Image } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen() {
    const signInWithGoogle = useAuthStore(state => state.signInWithGoogle);
    const loading = useAuthStore(state => state.loading);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Decorative Background Blobs */}
            <View style={styles.blob1} />
            <View style={styles.blob2} />
            <View style={styles.blob3} />

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image 
                            source={require('../../assets/dropbest_icon.png')} 
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.title}>DropBest!</Text>
                    <Text style={styles.subtitle}>Curated Picks. Smart Rewards.</Text>
                </View>

                <View style={styles.bottomSection}>
                    <View style={styles.loginCard}>
                        <Text style={styles.loginTitle}>Welcome Back</Text>
                        <Text style={styles.loginDesc}>
                            Sign in to continue to DropBest and start earning rewards on every purchase.
                        </Text>

                        <TouchableOpacity 
                            onPress={signInWithGoogle}
                            style={[styles.googleButton, loading && styles.googleButtonDisabled]}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <View style={styles.googleContent}>
                                    <View style={styles.googleIconPlaceholder}>
                                        <Text style={styles.googleG}>G</Text>
                                    </View>
                                    <Text style={styles.googleText}>Continue with Google</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.terms}>
                            By continuing, you agree to our Terms and Privacy Policy.
                        </Text>
                    </View>
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
    blob1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    blob2: {
        position: 'absolute',
        top: '40%',
        left: -80,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    blob3: {
        position: 'absolute',
        bottom: 250,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
        marginTop: 80,
    },
    logoContainer: {
        width: 100,
        height: 100,
        backgroundColor: COLORS.white,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        ...SHADOWS.lg,
        transform: [{ rotate: '-10deg' }],
    },
    logoImage: {
        width: 70,
        height: 70,
    },
    title: {
        fontSize: 40,
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: -1.5,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '600',
        marginTop: 8,
        letterSpacing: 0.5,
    },
    bottomSection: {
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 20 : 40,
    },
    loginCard: {
        backgroundColor: COLORS.white,
        borderRadius: 40,
        padding: 32,
        ...SHADOWS.lg,
    },
    loginTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.gray[900],
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    loginDesc: {
        fontSize: 15,
        color: COLORS.gray[500],
        fontWeight: '500',
        lineHeight: 22,
        marginBottom: 32,
    },
    googleButton: {
        backgroundColor: COLORS.brand[600],
        height: 65,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        ...SHADOWS.md,
    },
    googleButtonDisabled: {
        opacity: 0.7,
    },
    googleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    googleIconPlaceholder: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    googleG: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.brand[600],
    },
    googleText: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.white,
    },
    terms: {
        fontSize: 12,
        color: COLORS.gray[400],
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 20,
    }
});


