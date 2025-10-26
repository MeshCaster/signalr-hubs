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
exports.HubDebugger = void 0;
// src/signalr/components/HubDebugger.tsx
const react_1 = __importStar(require("react"));
const SignalRProvider_1 = require("../context/SignalRProvider");
const HubDebugger = () => {
    const { hubs } = (0, SignalRProvider_1.useSignalRContext)();
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    if (process.env.NODE_ENV === 'production') {
        return null;
    }
    return (react_1.default.createElement("div", { className: "fixed bottom-4 right-4 z-50" },
        react_1.default.createElement("button", { onClick: () => setIsOpen(!isOpen), className: "bg-gray-800 text-white px-4 py-2 rounded shadow-lg" }, "\uD83D\uDD0D SignalR Debug"),
        isOpen && (react_1.default.createElement("div", { className: "absolute bottom-12 right-0 bg-white border rounded shadow-lg p-4 w-80 max-h-96 overflow-y-auto" },
            react_1.default.createElement("h3", { className: "font-bold mb-2" }, "Active Hubs"),
            Array.from(hubs.entries()).map(([name, hub]) => (react_1.default.createElement("div", { key: name, className: "mb-3 p-2 bg-gray-50 rounded" },
                react_1.default.createElement("div", { className: "font-medium" }, name),
                react_1.default.createElement("div", { className: "text-sm text-gray-600" },
                    "State: ",
                    hub.state),
                react_1.default.createElement("div", { className: "text-sm text-gray-600" },
                    "ID: ",
                    hub.connectionId || 'N/A'))))))));
};
exports.HubDebugger = HubDebugger;
//# sourceMappingURL=HubDebugger.js.map