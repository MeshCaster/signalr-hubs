"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollaborationHub = void 0;
const abstractions_1 = require("../core/abstractions");
class CollaborationHub extends abstractions_1.BaseSignalRHub {
    constructor(config) {
        super({
            ...config,
            hubName: 'collaborationHub',
        });
        this.activeDocuments = new Map(); // documentId -> userIds
        this.changeQueue = [];
        this.setupCollaborationHandlers();
    }
    setupCollaborationHandlers() {
        this.on('UserJoinedDocument', (userId, documentId) => {
            if (!this.activeDocuments.has(documentId)) {
                this.activeDocuments.set(documentId, new Set());
            }
            this.activeDocuments.get(documentId).add(userId);
        });
        this.on('UserLeftDocument', (userId, documentId) => {
            const users = this.activeDocuments.get(documentId);
            if (users) {
                users.delete(userId);
                if (users.size === 0) {
                    this.activeDocuments.delete(documentId);
                }
            }
        });
        this.on('DocumentChanged', (change) => {
            this.changeQueue.push(change);
        });
    }
    async joinDocument(documentId) {
        return this.invoke('JoinDocument', documentId);
    }
    async leaveDocument(documentId) {
        await this.invoke('LeaveDocument', documentId);
        this.activeDocuments.delete(documentId);
    }
    async applyChange(change) {
        await this.invoke('ApplyChange', change);
    }
    getActiveUsers(documentId) {
        return Array.from(this.activeDocuments.get(documentId) || []);
    }
    getChangeHistory() {
        return [...this.changeQueue];
    }
    clearChangeHistory() {
        this.changeQueue = [];
    }
}
exports.CollaborationHub = CollaborationHub;
//# sourceMappingURL=CollaborationHub.js.map