import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, TextInput, ActivityIndicator, Alert } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { Mail, Phone, MessageSquare, Globe, ChevronLeft, MapPin, Send } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import api from '../api/api';

export default function ContactScreen({ navigation, route }: any) {
    const { initialSubject } = route.params || {};
    const { user } = useAuthStore();
    const [subject, setSubject] = useState(initialSubject || '');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSendMessage = async () => {
        if (!subject.trim() || !message.trim()) {
            Alert.alert('Error', 'Please fill in both subject and message.');
            return;
        }

        setSending(true);
        try {
            await api.post('/contacts', {
                name: user?.name || 'App User',
                email: user?.email,
                subject: subject,
                message: message
            });
            Alert.alert('Success', 'Your message has been sent to the admin. We will get back to you soon.');
            setSubject('');
            setMessage('');
        } catch (error: any) {
            console.error('Failed to send message:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

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

                {/* Direct Message Form */}
                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Send a Direct Message</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Subject</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="What is this about?"
                            value={subject}
                            onChangeText={setSubject}
                            placeholderTextColor={COLORS.gray[300]}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Message</Text>
                        <TextInput 
                            style={[styles.input, styles.textArea]}
                            placeholder="Type your message here..."
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholderTextColor={COLORS.gray[300]}
                        />
                    </View>

                    <TouchableOpacity 
                        style={[styles.sendBtn, sending && { opacity: 0.7 }]}
                        onPress={handleSendMessage}
                        disabled={sending}
                    >
                        {sending ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Send size={20} color={COLORS.white} />
                                <Text style={styles.sendBtnText}>Send Message</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <ContactItem 
                        icon={Mail} 
                        title="Email Us" 
                        value="dropbest2@gmail.com" 
                        onPress={() => Linking.openURL('mailto:dropbest2@gmail.com')}
                        color={COLORS.brand[500]}
                    />
                    <ContactItem 
                        icon={Phone} 
                        title="Call Us" 
                        value="Coming Soon" 
                        onPress={() => {}}
                        color={COLORS.accent.orange}
                    />
                    <ContactItem 
                        icon={Globe} 
                        title="Website" 
                        value="dropbest.vercel.app" 
                        onPress={() => Linking.openURL('https://dropbest.vercel.app')}
                        color="#10B981"
                    />
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
    formContainer: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 24,
        marginBottom: 30,
        ...SHADOWS.sm,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.gray[900],
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.gray[700],
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.gray[50],
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
        fontSize: 15,
        color: COLORS.gray[900],
    },
    textArea: {
        height: 120,
        paddingTop: 15,
    },
    sendBtn: {
        backgroundColor: COLORS.brand[600],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 16,
        marginTop: 10,
        gap: 10,
        ...SHADOWS.md,
    },
    sendBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
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
