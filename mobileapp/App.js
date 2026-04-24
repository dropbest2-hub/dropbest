import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/store/authStore';
import { COLORS } from './src/constants/theme';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const { initializeAuth, initialized, loading } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  if (!initialized || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.brand[500]} />
        <Text style={styles.loadingText}>Initializing DropBest...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.brand[600],
    fontWeight: 'bold',
  },
});

