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
exports.useMultipleHubs = useMultipleHubs;
// src/signalr/hooks/useMultipleHubs.ts
const useChatHub_1 = require("./useChatHub");
const useNotificationHub_1 = require("./useNotificationHub");
function useMultipleHubs() {
    const chat = (0, useChatHub_1.useChatHub)();
    const notifications = (0, useNotificationHub_1.useNotificationHub)();
    const isAnyConnected = chat.isConnected || notifications.isConnected;
    const allConnected = chat.isConnected && notifications.isConnected;
    const connectAll = () => __awaiter(this, void 0, void 0, function* () {
        yield Promise.all([chat.connect(), notifications.connect()]);
    });
    const disconnectAll = () => __awaiter(this, void 0, void 0, function* () {
        yield Promise.all([chat.disconnect(), notifications.disconnect()]);
    });
    return {
        chat,
        notifications,
        isAnyConnected,
        allConnected,
        connectAll,
        disconnectAll,
    };
}
