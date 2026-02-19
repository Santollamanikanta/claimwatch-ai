import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { TrendUpIcon } from '../icons/TrendUpIcon';
import { BellAlertIcon } from '../icons/BellAlertIcon';

interface LiveMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface LiveDataDashboardProps {
  isActive: boolean;
}

export const LiveDataDashboard: React.FC<LiveDataDashboardProps> = ({ isActive }) => {
  const [metrics, setMetrics] = useState<LiveMetric[]>([
    { label: 'Active Claims', value: 1247, change: 0, trend: 'stable' },
    { label: 'Fraud Alerts', value: 23, change: 0, trend: 'stable' },
    { label: 'Processing Time', value: '2.3s', change: 0, trend: 'stable' },
    { label: 'Risk Score Avg', value: 34, change: 0, trend: 'stable' }
  ]);

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        const changePercent = (Math.random() - 0.5) * 10; // -5% to +5% change
        let newValue: string | number;
        
        if (typeof metric.value === 'number') {
          newValue = Math.max(0, Math.round(metric.value * (1 + changePercent / 100)));
        } else {
          // For processing time
          const currentTime = parseFloat(metric.value);
          newValue = Math.max(0.1, (currentTime * (1 + changePercent / 100))).toFixed(1) + 's';
        }

        return {
          ...metric,
          value: newValue,
          change: changePercent,
          trend: changePercent > 2 ? 'up' : changePercent < -2 ? 'down' : 'stable'
        };
      }));
      
      setLastUpdate(new Date());
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isActive]);

  const getTrendColor = (trend: LiveMetric['trend']) => {
    switch (trend) {
      case 'up': return 'text-red-500';
      case 'down': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend: LiveMetric['trend']) => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  if (!isActive) return null;

  return (
    <Card className="mb-6">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <BellAlertIcon className="h-5 w-5 mr-2 text-blue-600" />
          Live System Metrics
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {metric.value}
            </div>
            <div className="text-sm text-gray-600 mb-2">{metric.label}</div>
            <div className={`text-xs flex items-center justify-center ${getTrendColor(metric.trend)}`}>
              <span className="mr-1">{getTrendIcon(metric.trend)}</span>
              <span>{Math.abs(metric.change).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};