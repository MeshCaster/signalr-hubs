"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardHub = void 0;
const abstractions_1 = require("../core/abstractions");
class DashboardHub extends abstractions_1.BaseSignalRHub {
    constructor(config) {
        super({
            ...config,
            hubName: 'dashboardHub',
        });
        this.subscribedMetrics = new Set();
        this.metricCache = new Map();
        this.setupMetricHandlers();
    }
    setupMetricHandlers() {
        this.on('MetricUpdate', (update) => {
            this.metricCache.set(update.metricName, update);
        });
        this.on('BulkMetricUpdate', (updates) => {
            updates.forEach(update => {
                this.metricCache.set(update.metricName, update);
            });
        });
    }
    async onReconnected() {
        // Resubscribe to metrics after reconnection
        const resubscribePromises = Array.from(this.subscribedMetrics).map(metric => this.invoke('SubscribeToMetric', metric));
        await Promise.all(resubscribePromises);
    }
    async subscribeToMetric(metricName) {
        await this.invoke('SubscribeToMetric', metricName);
        this.subscribedMetrics.add(metricName);
    }
    async unsubscribeFromMetric(metricName) {
        await this.invoke('UnsubscribeFromMetric', metricName);
        this.subscribedMetrics.delete(metricName);
        this.metricCache.delete(metricName);
    }
    getMetricValue(metricName) {
        return this.metricCache.get(metricName);
    }
    async getMetricHistory(metricName, startTime, endTime) {
        return this.invoke('GetMetricHistory', metricName, startTime, endTime);
    }
}
exports.DashboardHub = DashboardHub;
//# sourceMappingURL=DashboardHub.js.map