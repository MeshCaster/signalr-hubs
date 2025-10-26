"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatHub = void 0;
const abstractions_1 = require("../core/abstractions");
/**
 * Type-safe Chat Hub implementation
 */
class ChatHub extends abstractions_1.BaseSignalRHub {
    constructor(config) {
        super({
            ...config,
            hubName: 'chatHub',
        });
        this.currentRoom = null;
    }
    async onConnected() {
        console.log('Connected to chat hub:', this.connectionId);
        // Auto-join default room on connection
        if (this.currentRoom) {
            await this.invoke('JoinRoom', this.currentRoom);
        }
    }
    async onDisconnected() {
        console.log('Disconnected from chat hub');
    }
    async onReconnected() {
        console.log('Reconnected to chat hub');
        // Rejoin room after reconnection
        if (this.currentRoom) {
            await this.invoke('JoinRoom', this.currentRoom);
        }
    }
    // Convenience methods with business logic
    async joinRoom(roomName) {
        const success = await this.invoke('JoinRoom', roomName);
        if (success) {
            this.currentRoom = roomName;
        }
        return success;
    }
    async leaveCurrentRoom() {
        if (this.currentRoom) {
            await this.invoke('LeaveRoom', this.currentRoom);
            this.currentRoom = null;
        }
    }
    async sendMessage(message) {
        if (!this.currentRoom) {
            throw new Error('Not in a room');
        }
        await this.invoke('SendMessage', message);
    }
    getCurrentRoom() {
        return this.currentRoom;
    }
}
exports.ChatHub = ChatHub;
//# sourceMappingURL=ChatHub.js.map