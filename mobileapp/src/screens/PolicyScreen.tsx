import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { ChevronLeft } from 'lucide-react-native';

export default function PolicyScreen({ route, navigation }: any) {
    const title = route?.params?.title || 'Privacy Policy';
    const content = route?.params?.content || `
1. Information We Collect
We collect information you provide directly to us, such as when you create or modify your account, contact customer support, or otherwise communicate with us.

2. How We Use Your Information
We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect Dropbest and our users.

3. Affiliate Tracking
When you click on external product links, we track these actions to credit your account with badges upon successful purchases verified by our partners.
    `.trim();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.gray[900]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.lastUpdated}>Last Updated: May 2024</Text>
                <Text style={styles.content}>{content}</Text>
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
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
        paddingHorizontal: SPACING.md,
        paddingTop: 50,
        paddingBottom: 15,
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
        padding: SPACING.lg,
    },
    lastUpdated: {
        fontSize: 12,
        color: COLORS.gray[400],
        fontWeight: 'bold',
        marginBottom: 20,
    },
    content: {
        fontSize: 15,
        color: COLORS.gray[700],
        lineHeight: 24,
    }
});
