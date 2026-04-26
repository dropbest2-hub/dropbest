import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, SafeAreaView } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import { ChevronLeft, MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react-native';

export default function MyMessagesScreen({ navigation }: any) {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyMessages = useCallback(async () => {
        try {
            // We use the same /contacts endpoint but we'll need a way to filter by user
            // For now, let's assume we have a /contacts/my endpoint or we filter on frontend
            // Actually, let's create a proper /contacts/my endpoint in the backend.
            const response = await api.get('/contacts/my');
            setMessages(response.data || []);
        } catch (error) {
            console.error('Error fetching my messages:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchMyMessages();
    }, [fetchMyMessages]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyMessages();
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'New': return { bg: '#ede9fe', text: '#6d28d9' };
            case 'Replied': return { bg: '#dcfce7', text: '#15803d' };
            default: return { bg: COLORS.gray[100], text: COLORS.gray[600] };
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.gray[900]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Inquiries</Text>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.brand[600]]} />}
            >
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={COLORS.brand[600]} style={{ marginTop: 50 }} />
                ) : messages.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MessageSquare size={64} color={COLORS.gray[200]} />
                        <Text style={styles.emptyTitle}>No messages yet</Text>
                        <Text style={styles.emptySubtitle}>When you contact support, your messages and replies will appear here.</Text>
                        <TouchableOpacity 
                            style={styles.contactBtn}
                            onPress={() => navigation.navigate('Contact')}
                        >
                            <Text style={styles.contactBtnText}>Contact Support</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    messages.map((msg) => {
                        const status = getStatusStyle(msg.status);
                        return (
                            <View key={msg.id} style={styles.messageCard}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                                        <Text style={[styles.statusText, { color: status.text }]}>{msg.status}</Text>
                                    </View>
                                    <View style={styles.dateInfo}>
                                        <Clock size={12} color={COLORS.gray[400]} />
                                        <Text style={styles.dateText}>{new Date(msg.created_at).toLocaleDateString()}</Text>
                                    </View>
                                </View>

                                <Text style={styles.subjectText}>{msg.subject}</Text>
                                <Text style={styles.messageText}>{msg.message}</Text>

                                {msg.admin_reply && (
                                    <View style={styles.replySection}>
                                        <View style={styles.replyHeader}>
                                            <AlertCircle size={16} color={COLORS.brand[600]} />
                                            <Text style={styles.replyTitle}>Admin Response</Text>
                                        </View>
                                        <Text style={styles.replyText}>{msg.admin_reply}</Text>
                                    </View>
                                )}

                                <TouchableOpacity 
                                    style={styles.replyBtn}
                                    onPress={() => navigation.navigate('Contact', { 
                                        initialSubject: `Re: ${msg.subject}` 
                                    })}
                                >
                                    <Text style={styles.replyBtnText}>Reply</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
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
        paddingTop: 10,
        paddingBottom: 15,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
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
        padding: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.gray[900],
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.gray[500],
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 20,
    },
    contactBtn: {
        backgroundColor: COLORS.brand[600],
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 30,
    },
    contactBtnText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    messageCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        ...SHADOWS.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 12,
        color: COLORS.gray[400],
    },
    subjectText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.gray[900],
        marginBottom: 8,
    },
    messageText: {
        fontSize: 14,
        color: COLORS.gray[600],
        lineHeight: 20,
        marginBottom: 15,
    },
    replySection: {
        backgroundColor: COLORS.brand[50],
        padding: 15,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.brand[600],
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    replyTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.brand[600],
    },
    replyText: {
        fontSize: 14,
        color: COLORS.gray[700],
        lineHeight: 20,
    },
    replyBtn: {
        alignSelf: 'flex-end',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: COLORS.gray[50],
        marginTop: 15,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    replyBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.brand[600],
    }
});
