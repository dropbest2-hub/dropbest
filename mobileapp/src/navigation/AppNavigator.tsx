import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Home, Award, User, CheckCircle2, Package, Users, MessageSquare, CreditCard } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import RewardsScreen from '../screens/RewardsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import ContactScreen from '../screens/ContactScreen';
import PolicyScreen from '../screens/PolicyScreen';
import LoginScreen from '../screens/LoginScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminProductsScreen from '../screens/AdminProductsScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminMessagesScreen from '../screens/AdminMessagesScreen';
import AdminPayoutsScreen from '../screens/AdminPayoutsScreen';
import AdminAddProductScreen from '../screens/AdminAddProductScreen';
import DisclaimerScreen from '../screens/DisclaimerScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import HowToTrackScreen from '../screens/HowToTrackScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyMessagesScreen from '../screens/MyMessagesScreen';

import { useAuthStore } from '../store/authStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function UserTabNavigator() {
    const { isDark } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: COLORS.brand[600],
                tabBarInactiveTintColor: isDark ? '#777' : COLORS.gray[400],
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: isDark ? '#333' : COLORS.gray[100],
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                    backgroundColor: isDark ? '#1e1e1e' : COLORS.white,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: 'bold',
                },
                headerShown: false,
            }}
        >
            <Tab.Screen 
                name="HomeTab" 
                component={HomeScreen} 
                options={{
                    tabBarLabel: 'Discovery',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tab.Screen 
                name="RewardsTab" 
                component={RewardsScreen} 
                options={{
                    tabBarLabel: 'Rewards',
                    tabBarIcon: ({ color, size }) => <Award size={size} color={color} />,
                }}
            />
            <Tab.Screen 
                name="MyMessagesTab" 
                component={MyMessagesScreen} 
                options={{
                    tabBarLabel: 'Messages',
                    tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
                }}
            />
            <Tab.Screen 
                name="ProfileTab" 
                component={ProfileScreen} 
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}

function AdminTabNavigator() {
    const { isDark } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#6b38d4',
                tabBarInactiveTintColor: isDark ? '#777' : '#94a3b8',
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: isDark ? '#333' : '#f1f5f9',
                    height: 70,
                    paddingBottom: 15,
                    paddingTop: 10,
                    backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                },
                headerShown: false,
            }}
        >
            <Tab.Screen 
                name="AdminDiscoveryTab" 
                component={HomeScreen} 
                options={{
                    tabBarLabel: 'Discovery',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tab.Screen 
                name="AdminDashboardTab" 
                component={AdminDashboardScreen} 
                options={{
                    tabBarLabel: 'Confirm',
                    tabBarIcon: ({ color, size }) => <CheckCircle2 size={size} color={color} />,
                }}
            />
            <Tab.Screen 
                name="AdminProductsTab" 
                component={AdminProductsScreen} 
                options={{
                    tabBarLabel: 'Products',
                    tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
                }}
            />
            <Tab.Screen 
                name="AdminUsersTab" 
                component={AdminUsersScreen} 
                options={{
                    tabBarLabel: 'Users',
                    tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
                }}
            />
            <Tab.Screen 
                name="AdminMessagesTab" 
                component={AdminMessagesScreen} 
                options={{
                    tabBarLabel: 'Messages',
                    tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
                }}
            />
            <Tab.Screen 
                name="RewardsTab" 
                component={RewardsScreen} 
                options={{
                    tabBarLabel: 'Rewards',
                    tabBarIcon: ({ color, size }) => <Award size={size} color={color} />,
                }}
            />
            <Tab.Screen 
                name="AdminPayoutsTab" 
                component={AdminPayoutsScreen} 
                options={{
                    tabBarLabel: 'Payouts',
                    tabBarIcon: ({ color, size }) => <CreditCard size={size} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { user } = useAuthStore();
    const { isDark } = useTheme();

    return (
        <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : user.role === 'ADMIN' ? (
                    <Stack.Group>
                        <Stack.Screen name="AdminMain" component={AdminTabNavigator} />
                        <Stack.Screen name="AdminAddProductScreen" component={AdminAddProductScreen} />
                        <Stack.Screen name="Main" component={UserTabNavigator} />
                        <Stack.Screen name="ProfileTab" component={ProfileScreen} />
                        <Stack.Screen name="Contact" component={ContactScreen} />
                        <Stack.Screen name="Policy" component={PolicyScreen} />
                        <Stack.Screen name="Disclaimer" component={DisclaimerScreen} />
                        <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
                        <Stack.Screen name="HowToTrack" component={HowToTrackScreen} />
                        <Stack.Screen name="Watchlist" component={WatchlistScreen} />
                        <Stack.Screen name="Settings" component={SettingsScreen} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="MyMessages" component={MyMessagesScreen} />
                    </Stack.Group>
                ) : (
                    <Stack.Group>
                        <Stack.Screen name="Main" component={UserTabNavigator} />
                        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
                        <Stack.Screen name="Contact" component={ContactScreen} />
                        <Stack.Screen name="Policy" component={PolicyScreen} />
                        <Stack.Screen name="Disclaimer" component={DisclaimerScreen} />
                        <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
                        <Stack.Screen name="HowToTrack" component={HowToTrackScreen} />
                        <Stack.Screen name="Watchlist" component={WatchlistScreen} />
                        <Stack.Screen name="Settings" component={SettingsScreen} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="MyMessages" component={MyMessagesScreen} />
                    </Stack.Group>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
