import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { ChevronLeft, MousePointer2, Package, CheckCircle2, Award, Zap, HelpCircle } from 'lucide-react-native';

export default function HowToTrackScreen({ navigation }: any) {
    const steps = [
        {
            icon: MousePointer2,
            title: "1. Click Store Link",
            description: "On any product page, click 'BUY ON AMAZON' or 'BUY ON FLIPKART'. This creates a unique tracking ID for you.",
            color: '#FF9900'
        },
        {
            icon: Package,
            title: "2. Complete Purchase",
            description: "Finish your purchase as usual on the store app/website. Make sure to complete it in the same session.",
            color: '#2874F0'
        },
        {
            icon: CheckCircle2,
            title: "3. Mark as Ordered",
            description: "Return to DropBest and tap 'YES, I ORDERED'. Enter your Order ID and Amount to start verification.",
            color: '#10B981'
        },
        {
            icon: Award,
            title: "4. Earn Coins",
            description: "Once the merchant confirms your purchase (usually after delivery), coins are automatically added to your wallet!",
            color: '#F59E0B'
        }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.gray[900]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>How to Track?</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.hero}>
                    <HelpCircle size={60} color={COLORS.brand[600]} />
                    <Text style={styles.heroTitle}>Earn rewards every time you shop! 🛍️</Text>
                    <Text style={styles.heroSubtitle}>Follow these simple steps to ensure your cashback is tracked correctly.</Text>
                </View>

                {steps.map((step, index) => (
                    <View key={index} style={styles.stepCard}>
                        <View style={[styles.stepIcon, { backgroundColor: step.color + '20' }]}>
                            <step.icon size={28} color={step.color} />
                        </View>
                        <View style={styles.stepInfo}>
                            <Text style={styles.stepTitle}>{step.title}</Text>
                            <Text style={styles.stepDescription}>{step.description}</Text>
                        </View>
                    </View>
                ))}

                <View style={styles.tipsSection}>
                    <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
                    <View style={styles.tipItem}>
                        <Zap size={16} color={COLORS.brand[600]} />
                        <Text style={styles.tipText}>Don't use any other coupon codes found outside DropBest.</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Zap size={16} color={COLORS.brand[600]} />
                        <Text style={styles.tipText}>Ensure your cart is empty before clicking our link.</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Zap size={16} color={COLORS.brand[600]} />
                        <Text style={styles.tipText}>Complete the purchase within 24 hours of clicking.</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.startBtn}
                    onPress={() => navigation.navigate('Main')}
                >
                    <Text style={styles.startBtnText}>Start Shopping Now</Text>
                </TouchableOpacity>
                
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: COLORS.white,
        ...SHADOWS.sm,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.gray[900],
    },
    content: {
        padding: SPACING.lg,
    },
    hero: {
        alignItems: 'center',
        paddingVertical: 30,
        marginBottom: 20,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.gray[900],
        textAlign: 'center',
        marginTop: 15,
    },
    heroSubtitle: {
        fontSize: 14,
        color: COLORS.gray[500],
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    stepCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        ...SHADOWS.sm,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    stepIcon: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    stepInfo: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.gray[900],
        marginBottom: 4,
    },
    stepDescription: {
        fontSize: 13,
        color: COLORS.gray[500],
        lineHeight: 20,
    },
    tipsSection: {
        backgroundColor: COLORS.brand[50],
        borderRadius: 24,
        padding: 20,
        marginTop: 20,
        marginBottom: 30,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: COLORS.brand[800],
        marginBottom: 15,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 12,
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.brand[700],
        fontWeight: '600',
        lineHeight: 20,
    },
    startBtn: {
        backgroundColor: COLORS.brand[600],
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    startBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '900',
    }
});
