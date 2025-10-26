import { BaseSignalRHub, HubEventMap, HubInvokeMap, SignalRConfig } from '../core/abstractions';

// ============================================================================
// EXAMPLE 1: Chat Hub
// ============================================================================

/**
 * Define the events that the server can send to clients
 */
interface ChatHubEvents extends HubEventMap {
    ReceiveMessage: (user: string, message: string, timestamp: Date) => void;
    UserJoined: (user: string) => void;
    UserLeft: (user: string) => void;
    TypingIndicator: (user: string, isTyping: boolean) => void;
}

/**
 * Define the methods that clients can invoke on the server
 */
interface ChatHubMethods extends HubInvokeMap {
    SendMessage: (message: string) => Promise<void>;
    JoinRoom: (roomName: string) => Promise<boolean>;
    LeaveRoom: (roomName: string) => Promise<void>;
    SetTyping: (isTyping: boolean) => Promise<void>;
    GetOnlineUsers: () => Promise<string[]>;
}

/**
 * Type-safe Chat Hub implementation
 */
export class ChatHub extends BaseSignalRHub<ChatHubEvents, ChatHubMethods> {
    private currentRoom: string | null = null;

    constructor(config: Omit<SignalRConfig, 'hubName'>) {
        super({
            ...config,
            hubName: 'chatHub',
        });
    }

    protected override async onConnected(): Promise<void> {
        console.log('Connected to chat hub:', this.connectionId);

        // Auto-join default room on connection
        if (this.currentRoom) {
            await this.invoke('JoinRoom', this.currentRoom);
        }
    }

    protected override async onDisconnected(): Promise<void> {
        console.log('Disconnected from chat hub');
    }

    protected override async onReconnected(): Promise<void> {
        console.log('Reconnected to chat hub');

        // Rejoin room after reconnection
        if (this.currentRoom) {
            await this.invoke('JoinRoom', this.currentRoom);
        }
    }

    // Convenience methods with business logic
    async joinRoom(roomName: string): Promise<boolean> {
        const success = await this.invoke('JoinRoom', roomName);
        if (success) {
            this.currentRoom = roomName;
        }
        return success;
    }

    async leaveCurrentRoom(): Promise<void> {
        if (this.currentRoom) {
            await this.invoke('LeaveRoom', this.currentRoom);
            this.currentRoom = null;
        }
    }

    async sendMessage(message: string): Promise<void> {
        if (!this.currentRoom) {
            throw new Error('Not in a room');
        }
        await this.invoke('SendMessage', message);
    }

    getCurrentRoom(): string | null {
        return this.currentRoom;
    }
}
