"use client";

import { useState } from "react";
import { VideoQualitySettings } from "@/components/VideoQualitySelector";
import { AutoQualitySettings } from "@/components/AutoVideoQualityAdjuster";
import { Monitor, Settings, Wifi } from "lucide-react";

const VideoQualityPage = () => {
  const [autoSettings, setAutoSettings] = useState({
    enabled: true,
    adaptiveMode: 'balanced' as 'conservative' | 'balanced' | 'aggressive',
    minQuality: '240p' as 'auto' | '1080p' | '720p' | '480p' | '360p' | '240p' | 'off',
    maxQuality: '1080p' as 'auto' | '1080p' | '720p' | '480p' | '360p' | '240p' | 'off'
  });

  return (
    <section className="flex size-full flex-col gap-5 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Monitor className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Video Quality Settings</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Quality Controls */}
        <div className="bg-dark-1 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-400" />
            Manual Controls
          </h2>
          <p className="text-gray-300 mb-6">
            Manually control video quality settings for incoming and outgoing streams.
          </p>
          <VideoQualitySettings />
        </div>

        {/* Auto Quality Adjustment */}
        <div className="bg-dark-1 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
            <Wifi className="w-6 h-6 text-green-400" />
            Auto Adjustment
          </h2>
          <p className="text-gray-300 mb-6">
            Automatically adjust quality based on network conditions and participant count.
          </p>
          <AutoQualitySettings
            settings={autoSettings}
            onSettingsChange={setAutoSettings}
          />
        </div>

        {/* Quality Presets */}
        <div className="bg-dark-1 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quality Presets</h2>
          <div className="space-y-3">
            <button className="w-full p-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-left transition-colors">
              <h3 className="font-medium text-green-400">High Quality</h3>
              <p className="text-sm text-gray-400">1080p for stable high-speed connections</p>
            </button>
            <button className="w-full p-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-left transition-colors">
              <h3 className="font-medium text-blue-400">Balanced</h3>
              <p className="text-sm text-gray-400">720p for most situations</p>
            </button>
            <button className="w-full p-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-left transition-colors">
              <h3 className="font-medium text-yellow-400">Data Saver</h3>
              <p className="text-sm text-gray-400">480p to minimize bandwidth usage</p>
            </button>
            <button className="w-full p-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-left transition-colors">
              <h3 className="font-medium text-red-400">Audio Only</h3>
              <p className="text-sm text-gray-400">Disable video to save maximum bandwidth</p>
            </button>
          </div>
        </div>

        {/* Network Guidelines */}
        <div className="bg-dark-1 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Network Guidelines</h2>
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <h3 className="font-medium text-green-400 mb-2">Excellent Connection (25+ Mbps)</h3>
              <p>• Use 1080p for best quality</p>
              <p>• Support multiple high-quality streams</p>
              <p>• Enable all features without concerns</p>
            </div>
            <div>
              <h3 className="font-medium text-blue-400 mb-2">Good Connection (10-25 Mbps)</h3>
              <p>• Use 720p for balanced quality</p>
              <p>• Good for most meeting scenarios</p>
              <p>• May need to adjust with many participants</p>
            </div>
            <div>
              <h3 className="font-medium text-yellow-400 mb-2">Fair Connection (3-10 Mbps)</h3>
              <p>• Use 480p or 360p</p>
              <p>• Consider audio-only for large meetings</p>
              <p>• Enable auto-adjustment</p>
            </div>
            <div>
              <h3 className="font-medium text-red-400 mb-2">Poor Connection (&lt;3 Mbps)</h3>
              <p>• Use audio-only mode</p>
              <p>• Minimize other network usage</p>
              <p>• Consider connecting to better network</p>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-dark-1 rounded-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-blue-400 mb-3">Common Issues</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <strong>Pixelated video:</strong> Try lowering quality or enabling auto-adjustment</li>
                <li>• <strong>Lag/delay:</strong> Switch to audio-only mode temporarily</li>
                <li>• <strong>Choppy audio:</strong> Reduce video quality to prioritize audio</li>
                <li>• <strong>High data usage:</strong> Use 480p or lower quality settings</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-green-400 mb-3">Optimization Tips</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Close other applications using network</li>
                <li>• Use ethernet connection when possible</li>
                <li>• Position closer to WiFi router</li>
                <li>• Enable auto-adjustment for dynamic conditions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoQualityPage;
