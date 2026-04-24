import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, ShieldAlert } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

export default function DisclaimerScreen({ navigation }: any) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.gray[900]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Affiliate Disclaimer</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.iconContainer}>
                    <ShieldAlert size={48} color={COLORS.brand[500]} />
                </View>
                
                <Text style={styles.title}>Affiliate Disclaimer</Text>
                <Text style={styles.lastUpdated}>Last updated: April 2026</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Affiliate Links</Text>
                    <Text style={styles.paragraph}>
                        Dropbest participates in various affiliate marketing programs, which means we may get paid commissions on editorially chosen products purchased through our links to retailer sites.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Transparency</Text>
                    <Text style={styles.paragraph}>
                        When you click on links to various merchants on this site and make a purchase, this can result in this site earning a commission. Affiliate programs and affiliations include, but are not limited to, the eBay Partner Network, Amazon Associates, and others.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Pricing</Text>
                    <Text style={styles.paragraph}>
                        Using our affiliate links does not increase the cost of the products you purchase. Sometimes, we might even provide a discount code that reduces the price.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.white },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100] },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.gray[900] },
    container: { padding: 24, paddingBottom: 40 },
    iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.brand[50], alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '800', color: COLORS.gray[900], textAlign: 'center', marginBottom: 8 },
    lastUpdated: { fontSize: 14, color: COLORS.gray[500], textAlign: 'center', marginBottom: 32 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.gray[900], marginBottom: 12 },
    paragraph: { fontSize: 15, lineHeight: 24, color: COLORS.gray[600] },
});
