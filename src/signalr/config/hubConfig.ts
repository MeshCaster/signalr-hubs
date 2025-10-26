// src/signalr/config/hubConfig.ts
import { HubConfig } from '../core/types';

export interface AppHubConfigs {
    chat: HubConfig;
    notifications: HubConfig;
    dashboard: HubConfig;
}

export const getHubConfigs = (baseUrl: string, getToken: () => string): AppHubConfigs => ({
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

// Environment-specific configuration
export const getBaseUrl = (): string => {
    if (process.env.NODE_ENV === 'production') {
        return process.env.REACT_APP_API_URL || 'https://api.production.com';
    }
    if (process.env.NODE_ENV === 'staging') {
        return process.env.REACT_APP_API_URL || 'https://api.staging.com';
    }
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};