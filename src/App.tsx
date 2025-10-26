// src/App.tsx
import React from 'react';
import { SignalRProvider, HubDebugger } from './signalr';
import { ChatScreen } from './screens/ChatScreen';
import { NotificationBell } from './signalr/components/NotificationBell';

function App() {
    const getAuthToken = () => {
        // Your auth logic here
        return localStorage.getItem('authToken') || '';
    };

    return (
        <SignalRProvider
            getAuthToken={getAuthToken}
            autoConnect={true}
            enabledHubs={['chat', 'notifications']}
        >
            <div className="app">
                <header>
                    <h1>My App</h1>
                    <NotificationBell />
                </header>

                <main>
                    <ChatScreen />
                </main>

                <HubDebugger />
            </div>
        </SignalRProvider>
    );
}

export default App;