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
exports.CollaborationHub = void 0;
const abstractions_1 = require("../core/abstractions");
class CollaborationHub extends abstractions_1.BaseSignalRHub {
    constructor(config) {
        super(Object.assign(Object.assign({}, config), { hubName: 'collaborationHub' }));
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
    joinDocument(documentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.invoke('JoinDocument', documentId);
        });
    }
    leaveDocument(documentId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.invoke('LeaveDocument', documentId);
            this.activeDocuments.delete(documentId);
        });
    }
    applyChange(change) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.invoke('ApplyChange', change);
        });
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
