"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseUrl = exports.getHubConfigs = void 0;
const getHubConfigs = (baseUrl, getToken) => ({
    chat: {
        url: `${baseUrl}/hubs/chat`,
        hubName: 'chat',
        accessTokenFactory: getToken,
        automaticReconnect: [0, 2000, 5000, 10000, 30000],
        enabled: true,
    },
    notifications: {
        url: `${baseUrl}/hubs/notifications`,
        hubName: 'notifications',
        accessTokenFactory: getToken,
        automaticReconnect: true,
        enabled: true,
    },
    dashboard: {
        url: `${baseUrl}/hubs/dashboard`,
        hubName: 'dashboard',
        accessTokenFactory: getToken,
        automaticReconnect: true,
        enabled: false, // Disabled by default
    },
});
exports.getHubConfigs = getHubConfigs;
// Environment-specific configuration
const getBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return process.env.REACT_APP_API_URL || 'https://api.production.com';
    }
    if (process.env.NODE_ENV === 'staging') {
        return process.env.REACT_APP_API_URL || 'https://api.staging.com';
    }
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};
exports.getBaseUrl = getBaseUrl;
