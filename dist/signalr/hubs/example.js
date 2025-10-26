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
exports.exampleUsage = exampleUsage;
const ChatHub_1 = require("./ChatHub");
const DashboardHub_1 = require("./DashboardHub");
const NotificationHub_1 = require("./NotificationHub");
function exampleUsage() {
    return __awaiter(this, void 0, void 0, function* () {
        // Chat Hub
        const chatHub = new ChatHub_1.ChatHub({
            url: 'https://api.example.com/hubs/chat',
            accessTokenFactory: () => 'your-auth-token',
            automaticReconnect: true,
        });
        chatHub.on('ReceiveMessage', (user, message, timestamp) => {
            console.log(`${user} (${timestamp}): ${message}`);
        });
        yield chatHub.start();
        yield chatHub.joinRoom('general');
        yield chatHub.sendMessage('Hello, everyone!');
        // Notification Hub
        const notificationHub = new NotificationHub_1.NotificationHub({
            url: 'https://api.example.com/hubs/notifications',
            accessTokenFactory: () => 'your-auth-token',
        });
        const unsubscribe = notificationHub.addNotificationListener((notification) => {
            console.log('New notification:', notification.title);
        });
        yield notificationHub.start();
        // Dashboard Hub with streaming
        const dashboardHub = new DashboardHub_1.DashboardHub({
            url: 'https://api.example.com/hubs/dashboard',
        });
        yield dashboardHub.start();
        yield dashboardHub.subscribeToMetric('cpu-usage');
        dashboardHub.on('MetricUpdate', (update) => {
            console.log(`${update.metricName}: ${update.value}${update.unit || ''}`);
        });
        // Cleanup
        yield chatHub.stop();
        yield notificationHub.stop();
        yield dashboardHub.stop();
    });
}
