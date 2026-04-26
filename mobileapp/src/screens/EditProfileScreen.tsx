import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import api from '../api/api';
import { ChevronLeft, User, Mail, Camera, Save, CheckCircle2 } from 'lucide-react-native';

export default function EditProfileScreen({ navigation }: any) {
    const { user, login, token } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name cannot be empty.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.put('/users/profile', { name });
            // Update local store with new user data
            if (token) {
                await login(token, response.data);
            }
            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.gray[900]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveHeaderBtn}>
                    {loading ? <ActivityIndicator size="small" color={COLORS.brand[600]} /> : <Text style={styles.saveText}>Save</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        {user?.avatar_url ? (
                            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.placeholderAvatar]}>
                                <Text style={styles.avatarText}>{user?.name?.[0] || user?.email?.[0]?.toUpperCase()}</Text>
                            </View>
                        )}
                        <TouchableOpacity style={styles.cameraBtn} onPress={() => Alert.alert('Upload Photo', 'Image upload will be available in the next build.')}>
                            <Camera size={18} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.avatarHint}>Tap to change profile picture</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputWrapper}>
                            <User size={20} color={COLORS.gray[400]} />
                            <TextInput 
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your full name"
                                placeholderTextColor={COLORS.gray[300]}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address (Read Only)</Text>
                        <View style={[styles.inputWrapper, styles.disabledInput]}>
                            <Mail size={20} color={COLORS.gray[300]} />
                            <Text style={styles.readOnlyText}>{user?.email}</Text>
                            <CheckCircle2 size={16} color={COLORS.success} />
                        </View>
                        <Text style={styles.hint}>Email cannot be changed for security reasons.</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color={COLORS.white} /> : (
                        <>
                            <Save size={20} color={COLORS.white} />
                            <Text style={styles.saveBtnText}>Update Profile</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 60,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[50],
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.gray[900],
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveHeaderBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    saveText: {
        color: COLORS.brand[600],
        fontWeight: 'bold',
        fontSize: 16,
    },
    scrollContent: {
        padding: 24,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: COLORS.brand[50],
    },
    placeholderAvatar: {
        backgroundColor: COLORS.brand[500],
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 48,
        fontWeight: '900',
        color: COLORS.white,
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.brand[600],
        padding: 10,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    avatarHint: {
        fontSize: 12,
        color: COLORS.gray[400],
        fontWeight: '600',
    },
    form: {
        gap: 20,
        marginBottom: 40,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.gray[700],
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray[50],
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
        gap: 12,
    },
    disabledInput: {
        backgroundColor: COLORS.gray[50],
        borderColor: COLORS.gray[50],
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.gray[900],
        fontWeight: '500',
    },
    readOnlyText: {
        flex: 1,
        fontSize: 16,
        color: COLORS.gray[400],
        fontWeight: '500',
    },
    hint: {
        fontSize: 12,
        color: COLORS.gray[400],
        marginLeft: 4,
    },
    saveBtn: {
        backgroundColor: COLORS.brand[600],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 60,
        borderRadius: 20,
        ...SHADOWS.md,
    },
    saveBtnText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    }
});
