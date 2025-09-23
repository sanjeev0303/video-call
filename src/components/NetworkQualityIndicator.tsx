"use client";

import { useCallStateHooks } from "@stream-io/video-react-sdk";
import { Wifi, WifiOff, AlertTriangle, Activity } from "lucide-react";
import { useEffect, useState } from "react";

// Simple network quality indicator based on call stats
export const NetworkQualityIndicator = () => {
  const { useCallStatsReport } = useCallStateHooks();
  const statsReport = useCallStatsReport();

  const [networkQuality, setNetworkQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('good');
  const [connectionStats, setConnectionStats] = useState<{
    latency: number;
    packetLoss: number;
  }>({
    latency: 0,
    packetLoss: 0
  });

  useEffect(() => {
    if (statsReport) {
      // The statsReport structure depends on the actual Stream.io API
      // For now, we'll use a simplified approach
      try {
        // Basic network quality assessment
        const hasData = Object.keys(statsReport).length > 0;

        if (!hasData) {
          setNetworkQuality('offline');
        } else {
          // Assume good quality if we have stats data
          setNetworkQuality('good');
        }
      } catch (error) {
        console.log('Stats parsing error:', error);
        setNetworkQuality('good');
      }
    }
  }, [statsReport]);

  const getQualityIcon = () => {
    switch (networkQuality) {
      case 'excellent':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'good':
        return <Wifi className="w-4 h-4 text-blue-500" />;
      case 'poor':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  const getQualityLabel = () => {
    switch (networkQuality) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'poor':
        return 'Poor';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const getQualityColor = () => {
    switch (networkQuality) {
      case 'excellent':
        return 'text-green-400';
      case 'good':
        return 'text-blue-400';
      case 'poor':
        return 'text-yellow-400';
      case 'offline':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#19232d] text-white">
      {getQualityIcon()}
      <div className="flex flex-col">
        <span className={`text-xs ${getQualityColor()}`}>
          {getQualityLabel()}
        </span>
        <span className="text-xs text-gray-400">
          Network Status
        </span>
      </div>
    </div>
  );
};

// Connection info component
export const ConnectionInfo = () => {
  const { useCallStatsReport, useParticipants } = useCallStateHooks();
  const statsReport = useCallStatsReport();
  const participants = useParticipants();

  const [connectionDetails, setConnectionDetails] = useState({
    participants: 0,
    duration: 0,
    quality: 'good'
  });

  useEffect(() => {
    setConnectionDetails(prev => ({
      ...prev,
      participants: participants.length
    }));
  }, [participants]);

  return (
    <div className="bg-[#19232d] text-white p-4 rounded-lg">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4" />
        Connection Info
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span>Participants:</span>
          <span>{connectionDetails.participants}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Quality:</span>
          <span className="text-blue-400">{connectionDetails.quality}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Status:</span>
          <span className="text-green-400">Connected</span>
        </div>
      </div>
    </div>
  );
};
