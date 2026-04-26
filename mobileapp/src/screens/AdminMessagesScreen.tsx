import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, TextInput, StatusBar, Platform, Alert, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { Menu, Search, Star, CreditCard, ChevronRight, Edit2, MessageSquare, X, Send } from 'lucide-react-native';
import SideMenuModal from '../components/SideMenuModal';
import api from '../api/api';

const violetPrimary = '#6b38d4';
const background = '#f8f9fa';

const filters = ['All Messages', 'New', 'Replied'];

// Stable Hero and Search Section to prevent keyboard dismissal
const AdminMessagesHero = ({ 
    searchQuery, 
    setSearchQuery 
}: any) => (
    <View style={styles.heroSection}>
        <Text style={styles.pageTitle}>Support Messages</Text>
        <Text style={styles.pageSubtitle}>Manage user inquiries regarding rewards and marketplace issues.</Text>
        
        <View style={styles.searchContainer}>
            <Search size={20} color="#7b7486" style={styles.searchIcon} />
            <TextInput 
                style={styles.searchInput}
                placeholder="Search by user or subject..."
                placeholderTextColor="#7b7486"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>
    </View>
);

export default function AdminMessagesScreen({ navigation }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All Messages');
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [replyText, setReplyText] = useState('');
    const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
    const [sendingReply, setSendingReply] = useState(false);

    const fetchMessages = useCallback(async () => {
        try {
            const response = await api.get('/contacts');
            setMessages(response.data || []);
        } catch (error) {
            console.error('Fetch messages failed', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchMessages();
        });
        return unsubscribe;
    }, [navigation, fetchMessages]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMessages();
    };

    const filteredMessages = useMemo(() => {
        return messages.filter(msg => {
            const matchesSearch = (msg.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                                   (msg.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
            
            let matchesFilter = true;
            if (selectedFilter !== 'All Messages') {
                matchesFilter = msg.status === selectedFilter;
            }

            return matchesSearch && matchesFilter;
        });
    }, [messages, searchQuery, selectedFilter]);

    const handleViewThread = (msg: any) => {
        setSelectedMessage(msg);
        setIsReplyModalVisible(true);
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) {
            Alert.alert('Error', 'Please enter a reply message.');
            return;
        }

        setSendingReply(true);
        try {
            await api.post('/contacts/reply', {
                messageId: selectedMessage.id,
                userEmail: selectedMessage.email,
                replyText: replyText
            });

            Alert.alert('Success', 'Reply sent successfully!');
            setIsReplyModalVisible(false);
            setReplyText('');
            fetchMessages();
        } catch (error) {
            Alert.alert('Error', 'Failed to send reply. Please check your connection.');
        } finally {
            setSendingReply(false);
        }
    };

    const handleNewMessage = () => {
        Alert.alert("New Message", "Compose new message...");
    };

    const memoizedHero = useMemo(() => (
        <AdminMessagesHero 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
        />
    ), [searchQuery]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            
            <SideMenuModal 
                visible={isMenuVisible} 
                onClose={() => setIsMenuVisible(false)} 
                navigation={navigation} 
            />
            
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setIsMenuVisible(true)}>
                        <Menu size={24} color={violetPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Dropbest Admin</Text>
                </View>
            </View>

            <ScrollView 
                style={styles.container} 
                contentContainerStyle={styles.contentPadding}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[violetPrimary]} />}
            >
                {memoizedHero}

                {/* Filter Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer} contentContainerStyle={styles.chipsContent}>
                    {filters.map(filter => (
                        <TouchableOpacity 
                            key={filter}
                            style={[styles.chip, selectedFilter === filter && styles.chipActive]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text style={[styles.chipText, selectedFilter === filter && styles.chipTextActive]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Messages List */}
                <View style={styles.messagesList}>
                    {loading ? (
                        <ActivityIndicator size="large" color={violetPrimary} style={{ marginVertical: 40 }} />
                    ) : filteredMessages.length === 0 ? (
                        <Text style={styles.emptyText}>No messages found.</Text>
                    ) : (
                        filteredMessages.map(msg => {
                            const isNew = msg.status === 'New';
                            return (
                                <TouchableOpacity key={msg.id} style={[styles.messageCard, !isNew && { opacity: 0.8 }]}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.userInfo}>
                                            <View style={styles.userAvatarPlaceholder}>
                                                <Text style={styles.userAvatarText}>{(msg.name || 'U').charAt(0)}</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.userName}>{msg.name || 'Unknown'}</Text>
                                                <Text style={styles.userTicket}>ID: {msg.id.toString().split('-')[0]}</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: isNew ? '#ede9fe' : '#dcfce7' }]}>
                                            <Text style={[styles.statusText, { color: isNew ? '#6d28d9' : '#15803d' }]}>{msg.status || 'New'}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.messageContent}>
                                        <View style={styles.subjectRow}>
                                            <MessageSquare size={18} color={violetPrimary} />
                                            <Text style={[styles.subjectText, { color: violetPrimary }]}>SUBJECT: {msg.subject}</Text>
                                        </View>
                                        <Text style={styles.messagePreview} numberOfLines={2}>{msg.message}</Text>
                                    </View>

                                    <View style={styles.cardFooter}>
                                        <Text style={styles.timeText}>{new Date(msg.created_at).toLocaleDateString()}</Text>
                                        <TouchableOpacity style={styles.viewThreadBtn} onPress={() => handleViewThread(msg)}>
                                            <Text style={styles.viewThreadText}>View Details</Text>
                                            <ChevronRight size={16} color={violetPrimary} />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={handleNewMessage}>
                <Edit2 size={24} color="#ffffff" />
            </TouchableOpacity>

            {/* Reply Modal */}
            <Modal
                visible={isReplyModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsReplyModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Message Details</Text>
                            <TouchableOpacity onPress={() => setIsReplyModalVisible(false)}>
                                <X size={24} color="#494454" />
                            </TouchableOpacity>
                        </View>

                        {selectedMessage && (
                            <ScrollView style={styles.modalScroll}>
                                <View style={styles.modalUserInfo}>
                                    <View style={styles.userAvatarPlaceholder}>
                                        <Text style={styles.userAvatarText}>{(selectedMessage.name || 'U').charAt(0)}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.modalUserName}>{selectedMessage.name}</Text>
                                        <Text style={styles.modalUserEmail}>{selectedMessage.email}</Text>
                                    </View>
                                </View>

                                <View style={styles.modalMessageSection}>
                                    <Text style={styles.modalLabel}>SUBJECT</Text>
                                    <Text style={styles.modalSubject}>{selectedMessage.subject}</Text>
                                    
                                    <Text style={styles.modalLabel}>MESSAGE</Text>
                                    <View style={styles.messageBubble}>
                                        <Text style={styles.modalMessageBody}>{selectedMessage.message}</Text>
                                    </View>
                                </View>

                                {selectedMessage.admin_reply && (
                                    <View style={styles.modalMessageSection}>
                                        <Text style={styles.modalLabel}>PREVIOUS REPLY</Text>
                                        <View style={[styles.messageBubble, styles.replyBubble]}>
                                            <Text style={styles.modalMessageBody}>{selectedMessage.admin_reply}</Text>
                                        </View>
                                    </View>
                                )}

                                <View style={styles.replyInputSection}>
                                    <Text style={styles.modalLabel}>SEND A REPLY</Text>
                                    <TextInput
                                        style={styles.replyInput}
                                        placeholder="Type your response here..."
                                        multiline
                                        numberOfLines={4}
                                        value={replyText}
                                        onChangeText={setReplyText}
                                    />
                                    <TouchableOpacity 
                                        style={[styles.sendReplyBtn, sendingReply && { opacity: 0.7 }]}
                                        onPress={handleSendReply}
                                        disabled={sendingReply}
                                    >
                                        {sendingReply ? (
                                            <ActivityIndicator color="#ffffff" />
                                        ) : (
                                            <>
                                                <Send size={18} color="#ffffff" />
                                                <Text style={styles.sendReplyText}>Send Response</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
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
        gap: 12,
    },
    searchIconButton: {
        padding: 4,
    },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#e2e8f0',
        borderWidth: 2,
        borderColor: '#8455ef',
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
    heroSection: {
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
        fontSize: 12,
        color: '#494454',
        marginBottom: 16,
    },
    searchContainer: {
        position: 'relative',
        width: '100%',
    },
    searchIcon: {
        position: 'absolute',
        left: 16,
        top: '50%',
        marginTop: -10,
        zIndex: 2,
    },
    searchInput: {
        backgroundColor: '#ffffff',
        height: 48,
        borderRadius: 24,
        paddingLeft: 48,
        paddingRight: 16,
        fontSize: 14,
        color: '#191c1d',
        borderWidth: 1,
        borderColor: '#cbc3d7',
    },
    chipsContainer: {
        marginHorizontal: -20,
        marginBottom: 32,
    },
    chipsContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cbc3d7',
    },
    chipActive: {
        backgroundColor: violetPrimary,
        borderColor: violetPrimary,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#494454',
    },
    chipTextActive: {
        fontSize: 12,
        fontWeight: '700',
        color: '#ffffff',
    },
    messagesList: {
        gap: 16,
    },
    messageCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#cbc3d7',
        ...Platform.select({
            ios: {
                shadowColor: '#111827',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    cardHeader: {
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
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userAvatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#dce2f7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userAvatarText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#141b2b',
    },
    userName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#191c1d',
    },
    userTicket: {
        fontSize: 12,
        color: '#494454',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    messageContent: {
        marginBottom: 16,
    },
    subjectRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    subjectText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    messagePreview: {
        fontSize: 14,
        color: '#191c1d',
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f8f9fa',
    },
    timeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#494454',
        letterSpacing: 0.5,
    },
    viewThreadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewThreadText: {
        fontSize: 12,
        fontWeight: '700',
        color: violetPrimary,
    },
    emptyText: {
        textAlign: 'center',
        color: '#7b7486',
        marginTop: 20,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: violetPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#111827',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '90%',
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#191c1d',
    },
    modalScroll: {
        padding: 25,
    },
    modalUserInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 25,
    },
    modalUserName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#191c1d',
    },
    modalUserEmail: {
        fontSize: 14,
        color: '#7b7486',
    },
    modalMessageSection: {
        marginBottom: 25,
    },
    modalLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: '#7b7486',
        letterSpacing: 1,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    modalSubject: {
        fontSize: 16,
        fontWeight: '700',
        color: violetPrimary,
        marginBottom: 15,
    },
    messageBubble: {
        backgroundColor: '#f1f5f9',
        padding: 15,
        borderRadius: 16,
        borderBottomLeftRadius: 4,
    },
    modalMessageBody: {
        fontSize: 15,
        color: '#191c1d',
        lineHeight: 22,
    },
    replyBubble: {
        backgroundColor: '#ede9fe',
        borderColor: '#ddd6fe',
        borderWidth: 1,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 4,
    },
    replyInputSection: {
        marginBottom: 50,
    },
    replyInput: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cbc3d7',
        borderRadius: 16,
        padding: 15,
        height: 120,
        textAlignVertical: 'top',
        fontSize: 15,
        color: '#191c1d',
        marginBottom: 15,
    },
    sendReplyBtn: {
        backgroundColor: violetPrimary,
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    sendReplyText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    }
});
