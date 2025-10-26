// src/signalr/components/ConnectionStatus.tsx
import React from 'react';
import { ConnectionState } from '../core/types';

interface ConnectionStatusProps {
    hubName: string;
    connectionState: ConnectionState;
    onReconnect?: () => void;
    className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
                                                                      hubName,
                                                                      connectionState,
                                                                      onReconnect,
                                                                      className = '',
                                                                  }) => {
    const { isConnected, isConnecting, error } = connectionState;

    const getStatusColor = () => {
        if (isConnected) return 'bg-green-500';
        if (isConnecting) return 'bg-yellow-500';
        if (error) return 'bg-red-500';
        return 'bg-gray-500';
    };

    const getStatusText = () => {
        if (isConnected) return 'Connected';
        if (isConnecting) return 'Connecting...';
        if (error) return 'Disconnected';
        return 'Not Connected';
    };

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="text-sm text-gray-600">
        {hubName}: {getStatusText()}
      </span>
            {error && onReconnect && (
                <button
                    onClick={onReconnect}
                    className="text-xs text-blue-500 hover:text-blue-700"
                >
                    Reconnect
                </button>
            )}
        </div>
    );
};