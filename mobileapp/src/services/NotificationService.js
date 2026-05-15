import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';

export const requestUserPermission = async () => {
    try {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
            getFCMToken();
        }
    } catch (error) {
        console.log('Permission request error:', error);
    }
};

const getFCMToken = async () => {
    try {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
            console.log('Your Firebase Token is:', fcmToken);
            updateTokenInBackend(fcmToken);
        } else {
            console.log('Failed to get FCM token');
        }
    } catch (error) {
        console.log('Error getting FCM token:', error);
    }
};

const updateTokenInBackend = async (token) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
        await api.put('/user/profile', { fcm_token: token });
        console.log('FCM Token updated in backend');
    } catch (error) {
        console.error('Failed to update FCM Token in backend', error);
    }
};

export const notificationListener = () => {
    // When the app is in the foreground
    const unsubscribe = messaging().onMessage(async remoteMessage => {
        Alert.alert(
            remoteMessage.notification.title,
            remoteMessage.notification.body
        );
    });

    // When the app is opened from a notification (background state)
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification caused app to open from background state:', remoteMessage.notification);
    });

    // When the app is opened from a notification (quit state)
    messaging()
        .getInitialNotification()
        .then(remoteMessage => {
            if (remoteMessage) {
                console.log('Notification caused app to open from quit state:', remoteMessage.notification);
            }
        });

    return unsubscribe;
};
