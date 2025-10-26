import {BaseSignalRHub, HubEventMap, HubInvokeMap, SignalRConfig} from "../core/abstractions";

interface DocumentChange {
    documentId: string;
    userId: string;
    changeType: 'insert' | 'delete' | 'update';
    position: number;
    content: string;
    timestamp: Date;
}

interface CursorPosition {
    userId: string;
    documentId: string;
    line: number;
    column: number;
}

interface CollaborationHubEvents extends HubEventMap {
    DocumentChanged: (change: DocumentChange) => void;
    CursorMoved: (cursor: CursorPosition) => void;
    UserJoinedDocument: (userId: string, documentId: string) => void;
    UserLeftDocument: (userId: string, documentId: string) => void;
    DocumentLocked: (documentId: string, userId: string) => void;
    DocumentUnlocked: (documentId: string) => void;
}

interface CollaborationHubMethods extends HubInvokeMap {
    JoinDocument: (documentId: string) => Promise<{ content: string; activeUsers: string[] }>;
    LeaveDocument: (documentId: string) => Promise<void>;
    ApplyChange: (change: DocumentChange) => Promise<void>;
    UpdateCursor: (cursor: CursorPosition) => Promise<void>;
    LockDocument: (documentId: string) => Promise<boolean>;
    UnlockDocument: (documentId: string) => Promise<void>;
}

export class CollaborationHub extends BaseSignalRHub<
    CollaborationHubEvents,
    CollaborationHubMethods
> {
    private activeDocuments: Map<string, Set<string>> = new Map(); // documentId -> userIds
    private changeQueue: DocumentChange[] = [];

    constructor(config: Omit<SignalRConfig, 'hubName'>) {
        super({
            ...config,
            hubName: 'collaborationHub',
        });

        this.setupCollaborationHandlers();
    }

    private setupCollaborationHandlers(): void {
        this.on('UserJoinedDocument', (userId, documentId) => {
            if (!this.activeDocuments.has(documentId)) {
                this.activeDocuments.set(documentId, new Set());
            }
            this.activeDocuments.get(documentId)!.add(userId);
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

    async joinDocument(documentId: string): Promise<{ content: string; activeUsers: string[] }> {
        return this.invoke('JoinDocument', documentId);
    }

    async leaveDocument(documentId: string): Promise<void> {
        await this.invoke('LeaveDocument', documentId);
        this.activeDocuments.delete(documentId);
    }

    async applyChange(change: DocumentChange): Promise<void> {
        await this.invoke('ApplyChange', change);
    }

    getActiveUsers(documentId: string): string[] {
        return Array.from(this.activeDocuments.get(documentId) || []);
    }

    getChangeHistory(): DocumentChange[] {
        return [...this.changeQueue];
    }

    clearChangeHistory(): void {
        this.changeQueue = [];
    }
}