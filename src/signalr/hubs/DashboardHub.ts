import {BaseSignalRHub, HubEventMap, HubInvokeMap, SignalRConfig} from "../core/abstractions";

interface MetricUpdate {
    metricName: string;
    value: number;
    timestamp: Date;
    unit?: string;
}

interface DashboardHubEvents extends HubEventMap {
    MetricUpdate: (update: MetricUpdate) => void;
    BulkMetricUpdate: (updates: MetricUpdate[]) => void;
    AlertTriggered: (alert: { severity: string; message: string }) => void;
    SystemStatus: (status: 'healthy' | 'degraded' | 'down') => void;
}

interface DashboardHubMethods extends HubInvokeMap {
    SubscribeToMetric: (metricName: string) => Promise<void>;
    UnsubscribeFromMetric: (metricName: string) => Promise<void>;
    GetMetricHistory: (
        metricName: string,
        startTime: Date,
        endTime: Date
    ) => Promise<MetricUpdate[]>;
    GetCurrentMetrics: () => Promise<Record<string, number>>;
}

export class DashboardHub extends BaseSignalRHub<
    DashboardHubEvents,
    DashboardHubMethods
> {
    private subscribedMetrics: Set<string> = new Set();
    private metricCache: Map<string, MetricUpdate> = new Map();

    constructor(config: Omit<SignalRConfig, 'hubName'>) {
        super({
            ...config,
            hubName: 'dashboardHub',
        });

        this.setupMetricHandlers();
    }

    private setupMetricHandlers(): void {
        this.on('MetricUpdate', (update) => {
            this.metricCache.set(update.metricName, update);
        });

        this.on('BulkMetricUpdate', (updates) => {
            updates.forEach(update => {
                this.metricCache.set(update.metricName, update);
            });
        });
    }

    protected override async onReconnected(): Promise<void> {
        // Resubscribe to metrics after reconnection
        const resubscribePromises = Array.from(this.subscribedMetrics).map(
            metric => this.invoke('SubscribeToMetric', metric)
        );
        await Promise.all(resubscribePromises);
    }

    async subscribeToMetric(metricName: string): Promise<void> {
        await this.invoke('SubscribeToMetric', metricName);
        this.subscribedMetrics.add(metricName);
    }

    async unsubscribeFromMetric(metricName: string): Promise<void> {
        await this.invoke('UnsubscribeFromMetric', metricName);
        this.subscribedMetrics.delete(metricName);
        this.metricCache.delete(metricName);
    }

    getMetricValue(metricName: string): MetricUpdate | undefined {
        return this.metricCache.get(metricName);
    }

    async getMetricHistory(
        metricName: string,
        startTime: Date,
        endTime: Date
    ): Promise<MetricUpdate[]> {
        return this.invoke('GetMetricHistory', metricName, startTime, endTime);
    }
}