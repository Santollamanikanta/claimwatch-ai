import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { fraudMonitor, FraudAlert, FraudMetrics } from '../services/fraudMonitoringService';
import { BellAlertIcon } from './icons/BellAlertIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { TrendUpIcon } from './icons/TrendUpIcon';
import { FlagIcon } from './icons/FlagIcon';

const FraudDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<FraudMetrics | null>(null);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);

  useEffect(() => {
    // Initialize with sample data
    fraudMonitor.generateSampleData();
    updateData();
    
    // Update every 30 seconds
    const interval = setInterval(updateData, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateData = () => {
    setMetrics(fraudMonitor.getMetrics());
    setAlerts(fraudMonitor.getRecentAlerts(5));
  };

  const getAlertColor = (severity: FraudAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
    }
  };

  const getAlertIcon = (severity: FraudAlert['severity']) => {
    const baseClass = "h-5 w-5";
    switch (severity) {
      case 'critical': return <BellAlertIcon className={`${baseClass} text-red-600`} />;
      case 'high': return <FlagIcon className={`${baseClass} text-orange-600`} />;
      default: return <BellAlertIcon className={`${baseClass} text-yellow-600`} />;
    }
  };

  if (!metrics) {
    return <div className="p-4">Loading fraud analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Claims</p>
              <p className="text-2xl font-bold">{metrics.totalClaims}</p>
            </div>
            <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fraud Rate</p>
              <p className="text-2xl font-bold text-red-600">
                {(metrics.fraudRate * 100).toFixed(1)}%
              </p>
            </div>
            <FlagIcon className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Risk Score</p>
              <p className="text-2xl font-bold text-yellow-600">
                {metrics.avgRiskScore.toFixed(0)}
              </p>
            </div>
            <TrendUpIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-orange-600">{alerts.length}</p>
            </div>
            <BellAlertIcon className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold flex items-center">
              <BellAlertIcon className="h-5 w-5 mr-2" />
              Recent Alerts
            </h3>
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent alerts</p>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className={`p-3 rounded-lg ${getAlertColor(alert.severity)}`}>
                  <div className="flex items-start space-x-2">
                    {getAlertIcon(alert.severity)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs opacity-75">
                        {alert.timestamp.toLocaleTimeString()}
                        {alert.claimId && ` • ${alert.claimId}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top Fraud Indicators */}
        <Card>
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold flex items-center">
              <FlagIcon className="h-5 w-5 mr-2" />
              Top Fraud Indicators
            </h3>
          </div>
          <div className="p-4">
            {metrics.topIndicators.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No indicators detected</p>
            ) : (
              <div className="space-y-2">
                {metrics.topIndicators.map((indicator, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{indicator}</span>
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => fraudMonitor.clearAlerts()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
          >
            Clear Alerts
          </button>
          <button 
            onClick={updateData}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
          >
            Refresh Data
          </button>
          <button 
            onClick={() => fraudMonitor.generateSampleData()}
            className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
          >
            Generate Sample Data
          </button>
        </div>
      </Card>
    </div>
  );
};

export default FraudDashboard;