"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatHub = void 0;
const abstractions_1 = require("../core/abstractions");
/**
 * Type-safe Chat Hub implementation
 */
class ChatHub extends abstractions_1.BaseSignalRHub {
    constructor(config) {
        super(Object.assign(Object.assign({}, config), { hubName: 'chatHub' }));
        this.currentRoom = null;
    }
    onConnected() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Connected to chat hub:', this.connectionId);
            // Auto-join default room on connection
            if (this.currentRoom) {
                yield this.invoke('JoinRoom', this.currentRoom);
            }
        });
    }
    onDisconnected() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Disconnected from chat hub');
        });
    }
    onReconnected() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Reconnected to chat hub');
            // Rejoin room after reconnection
            if (this.currentRoom) {
                yield this.invoke('JoinRoom', this.currentRoom);
            }
        });
    }
    // Convenience methods with business logic
    joinRoom(roomName) {
        return __awaiter(this, void 0, void 0, function* () {
            const success = yield this.invoke('JoinRoom', roomName);
            if (success) {
                this.currentRoom = roomName;
            }
            return success;
        });
    }
    leaveCurrentRoom() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentRoom) {
                yield this.invoke('LeaveRoom', this.currentRoom);
                this.currentRoom = null;
            }
        });
    }
    sendMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.currentRoom) {
                throw new Error('Not in a room');
            }
            yield this.invoke('SendMessage', message);
        });
    }
    getCurrentRoom() {
        return this.currentRoom;
    }
}
exports.ChatHub = ChatHub;
