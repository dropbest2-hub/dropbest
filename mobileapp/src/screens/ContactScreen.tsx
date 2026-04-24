import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { Mail, Phone, MessageSquare, Globe, ChevronLeft, MapPin } from 'lucide-react-native';

export default function ContactScreen({ navigation }: any) {
    const ContactItem = ({ icon: Icon, title, value, onPress, color = COLORS.brand[500] }: any) => (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                <Icon size={24} color={color} />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.gray[900]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Contact Us</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.hero}>
                    <View style={styles.heroIcon}>
                        <MessageSquare size={48} color={COLORS.white} />
                    </View>
                    <Text style={styles.heroTitle}>How can we help?</Text>
                    <Text style={styles.heroSubtitle}>We're here to assist you with any questions or concerns.</Text>
                </View>

                <View style={styles.section}>
                    <ContactItem 
                        icon={Mail} 
                        title="Email Us" 
                        value="support@dropbest.in" 
                        onPress={() => Linking.openURL('mailto:support@dropbest.in')}
                        color={COLORS.brand[500]}
                    />
                    <ContactItem 
                        icon={Phone} 
                        title="Call Us" 
                        value="+91 12345 67890" 
                        onPress={() => Linking.openURL('tel:+911234567890')}
                        color={COLORS.accent.orange}
                    />
                    <ContactItem 
                        icon={Globe} 
                        title="Website" 
                        value="www.dropbest.in" 
                        onPress={() => Linking.openURL('https://dropbest.in')}
                        color="#10B981"
                    />
                    <ContactItem 
                        icon={MapPin} 
                        title="Office" 
                        value="Chennai, Tamil Nadu, India" 
                        onPress={() => {}}
                        color={COLORS.accent.pink}
                    />
                </View>

                <View style={styles.faqCard}>
                    <Text style={styles.faqTitle}>Check our FAQs</Text>
                    <Text style={styles.faqText}>Most common questions are answered in our Help Center.</Text>
                    <TouchableOpacity style={styles.faqBtn}>
                        <Text style={styles.faqBtnText}>Open Help Center</Text>
                    </TouchableOpacity>
                </View>
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
        paddingHorizontal: SPACING.md,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: COLORS.white,
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.gray[900],
        marginLeft: 10,
    },
    scroll: {
        padding: SPACING.lg,
    },
    hero: {
        alignItems: 'center',
        marginBottom: 30,
        paddingVertical: 20,
    },
    heroIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.brand[600],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        ...SHADOWS.md,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.gray[900],
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: COLORS.gray[500],
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    section: {
        gap: 15,
        marginBottom: 30,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 24,
        ...SHADOWS.sm,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.gray[400],
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.gray[900],
        marginTop: 2,
    },
    faqCard: {
        backgroundColor: COLORS.brand[50],
        padding: 25,
        borderRadius: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.brand[100],
    },
    faqTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.brand[800],
        marginBottom: 8,
    },
    faqText: {
        fontSize: 13,
        color: COLORS.brand[600],
        textAlign: 'center',
        marginBottom: 20,
    },
    faqBtn: {
        backgroundColor: COLORS.brand[600],
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 15,
    },
    faqBtnText: {
        color: COLORS.white,
        fontWeight: 'bold',
    }
});
