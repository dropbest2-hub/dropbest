import { messaging } from '../config/firebase';
import { supabaseAdmin } from '../config/supabase';

interface PushNotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

export const sendPushNotification = async (userId: string, payload: PushNotificationPayload) => {
    if (!messaging) return;

    try {
        // 1. Get user's FCM token
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('fcm_token')
            .eq('id', userId)
            .single();

        if (!user?.fcm_token) return;

        // 2. Send notification
        await messaging.send({
            token: user.fcm_token,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data,
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'default',
                }
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                    }
                }
            }
        });
    } catch (error) {
        console.error(`Error sending push notification to user ${userId}:`, error);
    }
};

export const broadcastPushNotification = async (payload: PushNotificationPayload) => {
    if (!messaging) return;

    try {
        // 1. Get all users with FCM tokens
        const { data: users } = await supabaseAdmin
            .from('users')
            .select('fcm_token')
            .not('fcm_token', 'is', null);

        if (!users || users.length === 0) return;

        const tokens = users.map(u => u.fcm_token).filter(Boolean) as string[];

        // 2. Send multicast (max 500 tokens per call)
        for (let i = 0; i < tokens.length; i += 500) {
            const batch = tokens.slice(i, i + 500);
            await messaging.sendEachForMulticast({
                tokens: batch,
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                data: payload.data,
            });
        }
        console.log(`Broadcasted push notification to ${tokens.length} devices.`);
    } catch (error) {
        console.error('Error broadcasting push notification:', error);
    }
};
