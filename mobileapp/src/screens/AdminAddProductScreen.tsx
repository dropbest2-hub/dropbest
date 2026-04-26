import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, SafeAreaView, StatusBar, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react-native';
import { CATEGORIES } from '../lib/categories';
import api from '../api/api';

const violetPrimary = '#6b38d4';
const background = '#f8f9fa';

export default function AdminAddProductScreen({ navigation, route }: any) {
    const editingProduct = route.params?.product;

    const [title, setTitle] = useState(editingProduct?.title || '');
    const [keywords, setKeywords] = useState(editingProduct?.search_keywords || '');
    const [price, setPrice] = useState(editingProduct?.price?.toString() || '');
    const [imageUrl, setImageUrl] = useState(editingProduct?.image_url || '');
    const [description, setDescription] = useState(editingProduct?.description || '');
    const [loading, setLoading] = useState(false);
    const [amazonLink, setAmazonLink] = useState(editingProduct?.amazon_link || '');
    const [flipkartLink, setFlipkartLink] = useState(editingProduct?.flipkart_link || '');
    const [myntraLink, setMyntraLink] = useState(editingProduct?.myntra_link || '');
    const [shopifyLink, setShopifyLink] = useState(editingProduct?.shopify_link || '');
    const [category, setCategory] = useState(editingProduct?.category || (CATEGORIES[1] ? CATEGORIES[1].id : ''));

    const handleSave = async () => {
        if (!title || !price || !imageUrl || !description) {
            Alert.alert("Error", "Please fill in all required fields (Title, Price, Image, Description).");
            return;
        }

        if (!amazonLink && !flipkartLink && !myntraLink && !shopifyLink) {
            Alert.alert("Error", "Please provide at least one store link (Amazon, Flipkart, Myntra, or Shopify).");
            return;
        }

        try {
            setLoading(true);
            const ensureProtocol = (url: string) => {
                if (!url) return '';
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    return `https://${url}`;
                }
                return url;
            };

            const productData = {
                title,
                description,
                price: parseFloat(price),
                image_url: ensureProtocol(imageUrl),
                amazon_link: ensureProtocol(amazonLink),
                flipkart_link: ensureProtocol(flipkartLink),
                myntra_link: ensureProtocol(myntraLink),
                shopify_link: ensureProtocol(shopifyLink),
                category,
                search_keywords: keywords
            };

            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, productData);
                Alert.alert("Success", "Product updated successfully!");
            } else {
                await api.post('/products', productData);
                Alert.alert("Success", "Product added successfully!");
            }
            navigation.goBack();
        } catch (error) {
            console.error('Error saving product:', error);
            Alert.alert("Error", "Failed to save product to database.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color="#191c1d" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{editingProduct ? 'Edit Product' : 'Add New Product'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
            >
                <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
                    
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Basic Details</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Product Title *</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="Enter product title"
                                placeholderTextColor="#7b7486"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Searching Keywords</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="e.g. wireless, headphones, sony"
                                placeholderTextColor="#7b7486"
                                value={keywords}
                                onChangeText={setKeywords}
                            />
                            <Text style={styles.hintText}>Helps users find the product in search.</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Price (₹) *</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="0.00"
                                placeholderTextColor="#7b7486"
                                keyboardType="numeric"
                                value={price}
                                onChangeText={setPrice}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Category *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                    <TouchableOpacity 
                                        key={cat.id}
                                        style={[styles.categoryChip, category === cat.id && styles.categoryChipActive]}
                                        onPress={() => setCategory(cat.id)}
                                    >
                                        <Text style={[styles.categoryChipText, category === cat.id && styles.categoryChipTextActive]}>
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description *</Text>
                            <TextInput 
                                style={[styles.input, styles.textArea]}
                                placeholder="Detailed product description..."
                                placeholderTextColor="#7b7486"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Media</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Image URL *</Text>
                            <View style={styles.imageInputRow}>
                                <ImageIcon size={20} color="#7b7486" style={styles.inputIcon} />
                                <TextInput 
                                    style={[styles.input, { flex: 1, paddingLeft: 40 }]}
                                    placeholder="https://..."
                                    placeholderTextColor="#7b7486"
                                    value={imageUrl}
                                    onChangeText={setImageUrl}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Affiliate Links</Text>
                        <Text style={styles.hintText}>Provide at least one affiliate link.</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Amazon Link</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="https://amazon.in/..."
                                placeholderTextColor="#7b7486"
                                value={amazonLink}
                                onChangeText={setAmazonLink}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Flipkart Link</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="https://flipkart.com/..."
                                placeholderTextColor="#7b7486"
                                value={flipkartLink}
                                onChangeText={setFlipkartLink}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Myntra Link</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="https://myntra.com/..."
                                placeholderTextColor="#7b7486"
                                value={myntraLink}
                                onChangeText={setMyntraLink}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Shopify Link</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="https://yourstore.myshopify.com/..."
                                placeholderTextColor="#7b7486"
                                value={shopifyLink}
                                onChangeText={setShopifyLink}
                            />
                        </View>
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={[styles.saveButton, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
                    <Save size={20} color="#ffffff" />
                    <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Product'}</Text>
                </TouchableOpacity>
            </View>
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
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#191c1d',
    },
    container: {
        flex: 1,
        backgroundColor: background,
    },
    contentPadding: {
        padding: 20,
    },
    formSection: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#191c1d',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#494454',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#cbc3d7',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        fontSize: 14,
        color: '#191c1d',
    },
    textArea: {
        height: 100,
        paddingTop: 12,
    },
    hintText: {
        fontSize: 10,
        color: '#7b7486',
        marginTop: 4,
    },
    imageInputRow: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: 12,
        zIndex: 2,
    },
    categoriesScroll: {
        marginHorizontal: -4,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#cbc3d7',
        marginHorizontal: 4,
    },
    categoryChipActive: {
        backgroundColor: violetPrimary,
        borderColor: violetPrimary,
    },
    categoryChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#494454',
    },
    categoryChipTextActive: {
        color: '#ffffff',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        ...Platform.select({
            ios: {
                paddingBottom: 34,
                shadowColor: '#111827',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    saveButton: {
        backgroundColor: violetPrimary,
        flexDirection: 'row',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    }
});
