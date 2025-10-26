// src/signalr/context/SignalRProvider.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { BaseSignalRHub } from '../core/abstractions';
import { SignalRContextValue, HubConfig } from '../core/types';
import { ChatHub } from '../hubs/ChatHub';
import { NotificationHub } from '../hubs/NotificationHub';
import { DashboardHub } from '../hubs/DashboardHub';
import { getHubConfigs, getBaseUrl } from '../config/hubConfig';

const SignalRContext = createContext<SignalRContextValue | undefined>(undefined);

interface SignalRProviderProps {
    children: React.ReactNode;
    getAuthToken: () => string;
    autoConnect?: boolean;
    enabledHubs?: string[];
}

export const SignalRProvider: React.FC<SignalRProviderProps> = ({
                                                                    children,
                                                                    getAuthToken,
                                                                    autoConnect = true,
                                                                    enabledHubs,
                                                                }) => {
    const hubs = useRef(new Map<string, BaseSignalRHub>());
    const [isInitialized, setIsInitialized] = useState(false);

    const registerHub = useCallback(<T,>(name: string, hub: T) => {
        hubs.current.set(name, hub as any);
    }, []);

    const unregisterHub = useCallback((name: string) => {
        const hub = hubs.current.get(name);
        if (hub) {
            hub.stop();
            hub.dispose();
            hubs.current.delete(name);
        }
    }, []);

    const getHub = useCallback(<T,>(name: string): T | undefined => {
        return hubs.current.get(name) as T | undefined;
    }, []);

    useEffect(() => {
        const baseUrl = getBaseUrl();
        const configs = getHubConfigs(baseUrl, getAuthToken);

        // Initialize hubs based on configuration
        const hubFactories: Record<string, (config: HubConfig) => BaseSignalRHub> = {
            chat: (config) => new ChatHub(config),
            notifications: (config) => new NotificationHub(config),
            dashboard: (config) => new DashboardHub(config),
        };

        // Create and register hubs
        Object.entries(configs).forEach(([name, config]) => {
            if (config.enabled && (!enabledHubs || enabledHubs.includes(name))) {
                const factory = hubFactories[name];
                if (factory) {
                    const hub = factory(config);
                    registerHub(name, hub);

                    if (autoConnect) {
                        hub.start().catch((error) => {
                            console.error(`Failed to start ${name} hub:`, error);
                        });
                    }
                }
            }
        });

        setIsInitialized(true);

        // Cleanup
        return () => {
            hubs.current.forEach((hub) => {
                hub.stop();
                hub.dispose();
            });
            hubs.current.clear();
        };
    }, [getAuthToken, autoConnect, enabledHubs, registerHub]);

    const contextValue: SignalRContextValue = {
        hubs: hubs.current,
        registerHub,
        unregisterHub,
        getHub,
    };

    return (
        <SignalRContext.Provider value={contextValue}>
            {isInitialized ? children : null}
        </SignalRContext.Provider>
    );
};

export const useSignalRContext = (): SignalRContextValue => {
    const context = useContext(SignalRContext);
    if (!context) {
        throw new Error('useSignalRContext must be used within SignalRProvider');
    }
    return context;
};