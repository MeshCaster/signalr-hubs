// src/signalr/components/HubDebugger.tsx
import React, { useState } from 'react';
import { useSignalRContext } from '../context/SignalRProvider';

export const HubDebugger: React.FC = () => {
    const { hubs } = useSignalRContext();
    const [isOpen, setIsOpen] = useState(false);

    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-800 text-white px-4 py-2 rounded shadow-lg"
            >
                🔍 SignalR Debug
            </button>

            {isOpen && (
                <div className="absolute bottom-12 right-0 bg-white border rounded shadow-lg p-4 w-80 max-h-96 overflow-y-auto">
                    <h3 className="font-bold mb-2">Active Hubs</h3>
                    {Array.from(hubs.entries()).map(([name, hub]) => (
                        <div key={name} className="mb-3 p-2 bg-gray-50 rounded">
                            <div className="font-medium">{name}</div>
                            <div className="text-sm text-gray-600">
                                State: {(hub as any).state}
                            </div>
                            <div className="text-sm text-gray-600">
                                ID: {(hub as any).connectionId || 'N/A'}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};