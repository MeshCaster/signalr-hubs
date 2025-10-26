import {BaseSignalRHub, HubEventMap, HubInvokeMap, SignalRConfig} from "../core/abstractions";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: Date;
}

interface NotificationHubEvents extends HubEventMap {
    ReceiveNotification: (notification: Notification) => void;
    NotificationRead: (notificationId: string) => void;
    NotificationDeleted: (notificationId: string) => void;
    BulkNotifications: (notifications: Notification[]) => void;
}

interface NotificationHubMethods extends HubInvokeMap {
    MarkAsRead: (notificationId: string) => Promise<void>;
    DeleteNotification: (notificationId: string) => Promise<void>;
    GetUnreadCount: () => Promise<number>;
    GetNotifications: (limit: number, offset: number) => Promise<Notification[]>;
    SubscribeToCategory: (category: string) => Promise<void>;
    UnsubscribeFromCategory: (category: string) => Promise<void>;
}

export class NotificationHub extends BaseSignalRHub<
    NotificationHubEvents,
    NotificationHubMethods
> {
    private unreadCount: number = 0;
    private notificationCallbacks: Set<(notification: Notification) => void> = new Set();

    constructor(config: Omit<SignalRConfig, 'hubName'>) {
        super({
            ...config,
            hubName: 'notificationHub',
        });

        // Setup default handlers
        this.setupDefaultHandlers();
    }

    private setupDefaultHandlers(): void {
        this.on('ReceiveNotification', (notification) => {
            this.unreadCount++;
            this.notificationCallbacks.forEach(cb => cb(notification));
        });

        this.on('NotificationRead', () => {
            if (this.unreadCount > 0) {
                this.unreadCount--;
            }
        });
    }

    protected override async onConnected(): Promise<void> {
        // Sync unread count on connection
        this.unreadCount = await this.invoke('GetUnreadCount');
    }

    // Add custom notification listener
    addNotificationListener(callback: (notification: Notification) => void): () => void {
        this.notificationCallbacks.add(callback);
        return () => this.notificationCallbacks.delete(callback);
    }

    getUnreadCount(): number {
        return this.unreadCount;
    }

    async markAsRead(notificationId: string): Promise<void> {
        await this.invoke('MarkAsRead', notificationId);
    }

    async getNotifications(limit: number = 20, offset: number = 0): Promise<Notification[]> {
        return this.invoke('GetNotifications', limit, offset);
    }
}