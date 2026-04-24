import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, SafeAreaView, Dimensions, TouchableWithoutFeedback, Image } from 'react-native';
import { User, MessageSquare, Shield, AlertCircle, X, ChevronRight, LogOut } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const violetPrimary = '#6b38d4';

interface SideMenuModalProps {
    visible: boolean;
    onClose: () => void;
    navigation: any;
}

export default function SideMenuModal({ visible, onClose, navigation }: SideMenuModalProps) {
    
    const menuItems = [
        { icon: User, label: 'Profile', route: 'ProfileTab' },
        { icon: MessageSquare, label: 'Contact Us', route: 'Contact' },
        { icon: Shield, label: 'Privacy Policy', route: 'Policy' },
        { icon: AlertCircle, label: 'Affiliate Disclaimer', route: 'Disclaimer' },
    ];

    const handleNavigate = (route: string) => {
        onClose();
        // Since Admin screens are in a separate stack, navigating to user screens might require navigating to 'Main' stack first, or we can just mock it for now
        // For now, let's just show an alert or attempt navigation
        if (route) {
            try {
                navigation.navigate(route);
            } catch(e) {
                console.log("Navigation to user route from admin failed", e);
            }
        }
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
                
                <View style={styles.menuContainer}>
                    <SafeAreaView style={styles.safeArea}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.userInfo}>
                                <Image 
                                    source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150' }}
                                    style={styles.avatar}
                                />
                                <View>
                                    <Text style={styles.userName}>Dropbest Admin</Text>
                                    <Text style={styles.userEmail}>admin@dropbest.com</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <X size={24} color="#191c1d" />
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
                                            <Icon size={22} color="#494454" />
                                            <Text style={styles.menuItemText}>{item.label}</Text>
                                        </View>
                                        <ChevronRight size={20} color="#cbc3d7" />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Logout */}
                        <TouchableOpacity style={styles.logoutBtn} onPress={onClose}>
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
