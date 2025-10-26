"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalRHubManager = exports.BaseSignalRHub = exports.ConnectionState = void 0;
const signalR = __importStar(require("@microsoft/signalr"));
/**
 * Connection state enum
 */
var ConnectionState;
(function (ConnectionState) {
    ConnectionState["Disconnected"] = "Disconnected";
    ConnectionState["Connecting"] = "Connecting";
    ConnectionState["Connected"] = "Connected";
    ConnectionState["Reconnecting"] = "Reconnecting";
    ConnectionState["Disconnecting"] = "Disconnecting";
})(ConnectionState || (exports.ConnectionState = ConnectionState = {}));
/**
 * Base SignalR Hub Client abstraction
 */
class BaseSignalRHub {
    constructor(config) {
        this.subscriptions = new Map();
        this._state = ConnectionState.Disconnected;
        this.connectionHandlers = [];
        this.disconnectionHandlers = [];
        this.reconnectingHandlers = [];
        this.reconnectedHandlers = [];
        this.closeHandlers = [];
        this.config = config;
        this.connection = this.buildConnection(config);
        this.setupConnectionHandlers();
    }
    /**
     * Build the SignalR connection with configuration
     */
    buildConnection(config) {
        const builder = new signalR.HubConnectionBuilder()
            .withUrl(config.url, {
            accessTokenFactory: config.accessTokenFactory,
            skipNegotiation: config.skipNegotiation,
            transport: config.transport,
        });
        if (config.automaticReconnect !== false) {
            if (Array.isArray(config.automaticReconnect)) {
                // Pass array of retry delays
                builder.withAutomaticReconnect(config.automaticReconnect);
            }
            else if (config.automaticReconnect === true) {
                // Use default reconnect policy
                builder.withAutomaticReconnect();
            }
            // If undefined, don't call withAutomaticReconnect at all
        }
        if (config.logLevel !== undefined) {
            builder.configureLogging(config.logLevel);
        }
        return builder.build();
    }
    /**
     * Setup internal connection lifecycle handlers
     */
    setupConnectionHandlers() {
        this.connection.onclose((error) => {
            this._state = ConnectionState.Disconnected;
            this.closeHandlers.forEach((handler) => handler(error || new Error('Connection closed')));
            this.onDisconnected();
        });
        this.connection.onreconnecting((error) => {
            this._state = ConnectionState.Reconnecting;
            this.reconnectingHandlers.forEach((handler) => handler(error || new Error('Reconnecting')));
            this.onReconnecting(error);
        });
        this.connection.onreconnected(() => {
            this._state = ConnectionState.Connected;
            this.reconnectedHandlers.forEach((handler) => handler());
            this.onReconnected();
        });
    }
    /**
     * Lifecycle hooks - override in derived classes
     */
    onConnected() { }
    onDisconnected() { }
    onReconnecting(error) { }
    onReconnected() { }
    /**
     * Start the connection
     */
    async start() {
        if (this._state === ConnectionState.Connected ||
            this._state === ConnectionState.Connecting) {
            return;
        }
        this._state = ConnectionState.Connecting;
        try {
            await this.connection.start();
            this._state = ConnectionState.Connected;
            this.connectionHandlers.forEach((handler) => handler());
            await this.onConnected();
        }
        catch (error) {
            this._state = ConnectionState.Disconnected;
            throw error;
        }
    }
    /**
     * Stop the connection
     */
    async stop() {
        if (this._state === ConnectionState.Disconnected) {
            return;
        }
        this._state = ConnectionState.Disconnecting;
        try {
            await this.connection.stop();
            this._state = ConnectionState.Disconnected;
            this.disconnectionHandlers.forEach((handler) => handler());
        }
        catch (error) {
            this._state = ConnectionState.Disconnected;
            throw error;
        }
    }
    /**
     * Subscribe to a hub method (server -> client)
     */
    on(methodName, handler) {
        const subscription = {
            methodName: methodName,
            unsubscribe: () => this.off(methodName, handler),
        };
        this.connection.on(methodName, handler);
        if (!this.subscriptions.has(methodName)) {
            this.subscriptions.set(methodName, []);
        }
        this.subscriptions.get(methodName).push(subscription);
        return subscription;
    }
    /**
     * Unsubscribe from a hub method
     */
    off(methodName, handler) {
        if (handler) {
            this.connection.off(methodName, handler);
        }
        else {
            this.connection.off(methodName);
        }
        if (!handler) {
            this.subscriptions.delete(methodName);
        }
        else {
            const subs = this.subscriptions.get(methodName);
            if (subs) {
                const filtered = subs.filter((s) => s.methodName !== methodName);
                if (filtered.length > 0) {
                    this.subscriptions.set(methodName, filtered);
                }
                else {
                    this.subscriptions.delete(methodName);
                }
            }
        }
    }
    /**
     * Invoke a hub method (client -> server)
     */
    async invoke(methodName, ...args) {
        return this.connection.invoke(methodName, ...args);
    }
    /**
     * Send a hub method without waiting for response (client -> server)
     */
    async send(methodName, ...args) {
        return this.connection.send(methodName, ...args);
    }
    /**
     * Stream from server
     */
    stream(methodName, ...args) {
        return this.connection.stream(methodName, ...args);
    }
    /**
     * Register a connection opened handler
     */
    onConnectedCallback(handler) {
        this.connectionHandlers.push(handler);
        return () => {
            this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
        };
    }
    /**
     * Register a disconnection handler
     */
    onDisconnectedCallback(handler) {
        this.disconnectionHandlers.push(handler);
        return () => {
            this.disconnectionHandlers = this.disconnectionHandlers.filter(h => h !== handler);
        };
    }
    /**
     * Register a reconnecting handler
     */
    onReconnectingCallback(handler) {
        this.reconnectingHandlers.push(handler);
        return () => {
            this.reconnectingHandlers = this.reconnectingHandlers.filter(h => h !== handler);
        };
    }
    /**
     * Register a reconnected handler
     */
    onReconnectedCallback(handler) {
        this.reconnectedHandlers.push(handler);
        return () => {
            this.reconnectedHandlers = this.reconnectedHandlers.filter(h => h !== handler);
        };
    }
    /**
     * Register a close handler
     */
    onCloseCallback(handler) {
        this.closeHandlers.push(handler);
        return () => {
            this.closeHandlers = this.closeHandlers.filter(h => h !== handler);
        };
    }
    /**
     * Get current connection state
     */
    get state() {
        return this._state;
    }
    /**
     * Get current SignalR connection state
     */
    get connectionState() {
        return this.connection.state;
    }
    /**
     * Check if connected
     */
    get isConnected() {
        return this._state === ConnectionState.Connected;
    }
    /**
     * Get the connection ID
     */
    get connectionId() {
        return this.connection.connectionId;
    }
    /**
     * Clean up all subscriptions
     */
    dispose() {
        this.subscriptions.forEach((subs, methodName) => {
            this.connection.off(methodName);
        });
        this.subscriptions.clear();
        this.connectionHandlers = [];
        this.disconnectionHandlers = [];
        this.reconnectingHandlers = [];
        this.reconnectedHandlers = [];
        this.closeHandlers = [];
    }
}
exports.BaseSignalRHub = BaseSignalRHub;
/**
 * Hub connection manager for multiple hubs
 */
class SignalRHubManager {
    constructor() {
        this.hubs = new Map();
    }
    register(name, hub) {
        this.hubs.set(name, hub);
    }
    unregister(name) {
        const hub = this.hubs.get(name);
        if (hub) {
            hub.dispose();
            this.hubs.delete(name);
        }
    }
    get(name) {
        return this.hubs.get(name);
    }
    async startAll() {
        await Promise.all(Array.from(this.hubs.values()).map((hub) => hub.start()));
    }
    async stopAll() {
        await Promise.all(Array.from(this.hubs.values()).map((hub) => hub.stop()));
    }
    disposeAll() {
        this.hubs.forEach((hub) => hub.dispose());
        this.hubs.clear();
    }
}
exports.SignalRHubManager = SignalRHubManager;
//# sourceMappingURL=abstractions.js.map