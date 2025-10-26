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
exports.DashboardHub = void 0;
const abstractions_1 = require("../core/abstractions");
class DashboardHub extends abstractions_1.BaseSignalRHub {
    constructor(config) {
        super(Object.assign(Object.assign({}, config), { hubName: 'dashboardHub' }));
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
    onReconnected() {
        return __awaiter(this, void 0, void 0, function* () {
            // Resubscribe to metrics after reconnection
            const resubscribePromises = Array.from(this.subscribedMetrics).map(metric => this.invoke('SubscribeToMetric', metric));
            yield Promise.all(resubscribePromises);
        });
    }
    subscribeToMetric(metricName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.invoke('SubscribeToMetric', metricName);
            this.subscribedMetrics.add(metricName);
        });
    }
    unsubscribeFromMetric(metricName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.invoke('UnsubscribeFromMetric', metricName);
            this.subscribedMetrics.delete(metricName);
            this.metricCache.delete(metricName);
        });
    }
    getMetricValue(metricName) {
        return this.metricCache.get(metricName);
    }
    getMetricHistory(metricName, startTime, endTime) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.invoke('GetMetricHistory', metricName, startTime, endTime);
        });
    }
}
exports.DashboardHub = DashboardHub;
