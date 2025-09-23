"use client";

import { useState } from "react";
import { VideoQualitySettings, IncomingVideoQualitySelector } from "./VideoQualitySelector";
import { NetworkQualityIndicator, ConnectionInfo } from "./NetworkQualityIndicator";
import { Settings, Monitor, X } from "lucide-react";
import { useCallStateHooks, useCall } from "@stream-io/video-react-sdk";

interface VideoQualityDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

export const VideoQualityDashboard = ({ isVisible, onClose }: VideoQualityDashboardProps) => {
  const call = useCall();
  const { useParticipants, useIncomingVideoSettings } = useCallStateHooks();

  // Safely get data with default values
  let participants: any[] = [];
  let enabled = false;
  let preferredResolution = null;

  try {
    if (call) {
      participants = useParticipants() || [];
      const videoSettings = useIncomingVideoSettings();
      enabled = videoSettings?.enabled || false;
      preferredResolution = videoSettings?.preferredResolution || null;
    }
  } catch (error) {
    console.error("Error getting video dashboard data:", error);
  }

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Monitor className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Video Quality Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Status */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Current Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#2a2a2a] p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Network Status</h4>
              <NetworkQualityIndicator />
            </div>
            <div className="bg-[#2a2a2a] p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Connection Info</h4>
              <ConnectionInfo />
            </div>
          </div>
        </div>

        {/* Video Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Video Quality Settings</h3>
          <div className="bg-[#2a2a2a] p-4 rounded-lg">
            <div className="mb-4">
              <VideoQualitySettings />
            </div>
            <div className="text-sm text-gray-400">
              <p className="mb-2">• <strong>Auto:</strong> Automatically adjusts quality based on network conditions</p>
              <p className="mb-2">• <strong>1080p/720p:</strong> High quality, requires stable high-speed connection</p>
              <p className="mb-2">• <strong>480p/360p:</strong> Good quality for slower connections</p>
              <p>• <strong>Off:</strong> Audio-only mode to save bandwidth</p>
            </div>
          </div>
        </div>

        {/* Participants Quality */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            Participants ({participants.length})
          </h3>
          <div className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.sessionId} className="bg-[#2a2a2a] p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {participant.image && (
                      <img
                        src={participant.image}
                        alt={participant.name || participant.userId}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-white font-medium">
                        {participant.name || participant.userId}
                        {participant.isLocalParticipant && (
                          <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">You</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        {participant.connectionQuality || "Good"} connection
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      Video: {participant.videoStream ? "On" : "Off"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Audio: {participant.audioStream ? "On" : "Off"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
          <div className="bg-[#2a2a2a] p-4 rounded-lg">
            <div className="space-y-2 text-sm text-gray-300">
              <p>• For stable connections with good bandwidth: Use 720p or 1080p</p>
              <p>• For mobile or slower connections: Use 480p or 360p</p>
              <p>• If experiencing lag or poor quality: Switch to "Auto" mode</p>
              <p>• To save data: Use audio-only mode ("Off" video)</p>
              <p>• For large meetings: Consider lower quality to reduce server load</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Apply optimal settings based on participant count
                const optimalSetting = participants.length > 4 ? "480p" : "720p";
                console.log(`Applying optimal setting: ${optimalSetting}`);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Apply Optimal Settings
            </button>
            <button
              onClick={() => {
                // Reset to auto mode
                console.log("Resetting to auto mode");
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Reset to Auto
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Compact video quality controls for meeting toolbar
export const CompactVideoQualityControls = () => {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <IncomingVideoQualitySelector />
        <button
          onClick={() => setShowDashboard(true)}
          className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] text-white flex items-center gap-2"
          title="Open Video Quality Dashboard"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Advanced</span>
        </button>
        <NetworkQualityIndicator />
      </div>

      <VideoQualityDashboard
        isVisible={showDashboard}
        onClose={() => setShowDashboard(false)}
      />
    </>
  );
};
