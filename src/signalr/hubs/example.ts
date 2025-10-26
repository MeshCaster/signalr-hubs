import {ChatHub} from "./ChatHub";
import {DashboardHub} from "./DashboardHub";
import {NotificationHub} from "./NotificationHub";

export async function exampleUsage() {
    // Chat Hub
    const chatHub = new ChatHub({
        url: 'https://api.example.com/hubs/chat',
        accessTokenFactory: () => 'your-auth-token',
        automaticReconnect: true,
    });

    chatHub.on('ReceiveMessage', (user, message, timestamp) => {
        console.log(`${user} (${timestamp}): ${message}`);
    });

    await chatHub.start();
    await chatHub.joinRoom('general');
    await chatHub.sendMessage('Hello, everyone!');

    // Notification Hub
    const notificationHub = new NotificationHub({
        url: 'https://api.example.com/hubs/notifications',
        accessTokenFactory: () => 'your-auth-token',
    });

    const unsubscribe = notificationHub.addNotificationListener((notification) => {
        console.log('New notification:', notification.title);
    });

    await notificationHub.start();

    // Dashboard Hub with streaming
    const dashboardHub = new DashboardHub({
        url: 'https://api.example.com/hubs/dashboard',
    });

    await dashboardHub.start();
    await dashboardHub.subscribeToMetric('cpu-usage');

    dashboardHub.on('MetricUpdate', (update) => {
        console.log(`${update.metricName}: ${update.value}${update.unit || ''}`);
    });

    // Cleanup
    await chatHub.stop();
    await notificationHub.stop();
    await dashboardHub.stop();
}