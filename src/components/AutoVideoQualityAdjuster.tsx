"use client";

import { useEffect, useState } from "react";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { applyIncomingVideoSetting, incomingVideoSettingToResolution } from "./VideoQualitySelector";

type IncomingVideoSetting = "auto" | "1080p" | "720p" | "480p" | "360p" | "240p" | "off";

interface AutoQualitySettings {
  enabled: boolean;
  adaptiveMode: 'conservative' | 'balanced' | 'aggressive';
  minQuality: IncomingVideoSetting;
  maxQuality: IncomingVideoSetting;
}

// Component that automatically adjusts video quality based on network conditions and call metrics
export const AutoVideoQualityAdjuster = () => {
  const call = useCall();
  const { useCallStatsReport, useParticipants } = useCallStateHooks();
  const statsReport = useCallStatsReport();
  const participants = useParticipants();

  const [settings, setSettings] = useState<AutoQualitySettings>({
    enabled: true,
    adaptiveMode: 'balanced',
    minQuality: '240p',
    maxQuality: '1080p'
  });

  const [lastAdjustment, setLastAdjustment] = useState<Date>(new Date());
  const [currentQuality, setCurrentQuality] = useState<IncomingVideoSetting>('auto');

  // Auto-adjust quality based on network conditions and participant count
  useEffect(() => {
    if (!call || !settings.enabled) return;

    const adjustQuality = () => {
      const now = new Date();
      const timeSinceLastAdjustment = now.getTime() - lastAdjustment.getTime();

      // Only adjust every 10 seconds to avoid rapid changes
      if (timeSinceLastAdjustment < 10000) return;

      let recommendedQuality: IncomingVideoSetting = 'auto';

      // Adjust based on participant count
      const participantCount = participants.length;

      if (participantCount <= 2) {
        recommendedQuality = '720p';
      } else if (participantCount <= 4) {
        recommendedQuality = '480p';
      } else if (participantCount <= 8) {
        recommendedQuality = '360p';
      } else {
        recommendedQuality = '240p';
      }

      // Apply mode-specific adjustments
      switch (settings.adaptiveMode) {
        case 'conservative':
          // Always prefer lower quality for stability
          if (participantCount > 3) {
            recommendedQuality = '360p';
          }
          break;
        case 'aggressive':
          // Push for higher quality
          if (participantCount <= 4) {
            recommendedQuality = '1080p';
          }
          break;
        case 'balanced':
        default:
          // Keep the participant-based logic
          break;
      }

      // Respect min/max quality bounds
      const qualityOrder: IncomingVideoSetting[] = ['off', '240p', '360p', '480p', '720p', '1080p', 'auto'];
      const minIndex = qualityOrder.indexOf(settings.minQuality);
      const maxIndex = qualityOrder.indexOf(settings.maxQuality);
      const currentIndex = qualityOrder.indexOf(recommendedQuality);

      if (currentIndex < minIndex) {
        recommendedQuality = settings.minQuality;
      } else if (currentIndex > maxIndex) {
        recommendedQuality = settings.maxQuality;
      }

      // Only apply if quality has changed
      if (recommendedQuality !== currentQuality) {
        applyIncomingVideoSetting(call, recommendedQuality);
        setCurrentQuality(recommendedQuality);
        setLastAdjustment(now);

        console.log(`Auto-adjusted video quality to ${recommendedQuality} (${participantCount} participants)`);
      }
    };

    adjustQuality();
  }, [call, participants, settings, lastAdjustment, currentQuality]);

  // Settings interface (can be toggled on/off)
  return null; // This is a background component that doesn't render UI
};

// Settings panel for auto quality adjustment
export const AutoQualitySettings = ({
  settings,
  onSettingsChange
}: {
  settings: AutoQualitySettings;
  onSettingsChange: (settings: AutoQualitySettings) => void;
}) => {
  const qualityOptions: IncomingVideoSetting[] = ['240p', '360p', '480p', '720p', '1080p'];

  return (
    <div className="bg-[#2a2a2a] p-4 rounded-lg text-white">
      <h4 className="font-semibold mb-4">Auto Quality Adjustment</h4>

      <div className="space-y-4">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <label className="text-sm">Enable Auto Adjustment</label>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onSettingsChange({ ...settings, enabled: e.target.checked })}
            className="w-4 h-4"
          />
        </div>

        {settings.enabled && (
          <>
            {/* Adaptive Mode */}
            <div>
              <label className="text-sm block mb-2">Adjustment Mode</label>
              <select
                value={settings.adaptiveMode}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  adaptiveMode: e.target.value as AutoQualitySettings['adaptiveMode']
                })}
                className="w-full p-2 bg-[#1a1a1a] border border-gray-600 rounded text-white"
              >
                <option value="conservative">Conservative (Stability focused)</option>
                <option value="balanced">Balanced (Default)</option>
                <option value="aggressive">Aggressive (Quality focused)</option>
              </select>
            </div>

            {/* Quality Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm block mb-2">Min Quality</label>
                <select
                  value={settings.minQuality}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    minQuality: e.target.value as IncomingVideoSetting
                  })}
                  className="w-full p-2 bg-[#1a1a1a] border border-gray-600 rounded text-white"
                >
                  {qualityOptions.map(quality => (
                    <option key={quality} value={quality}>{quality}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm block mb-2">Max Quality</label>
                <select
                  value={settings.maxQuality}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    maxQuality: e.target.value as IncomingVideoSetting
                  })}
                  className="w-full p-2 bg-[#1a1a1a] border border-gray-600 rounded text-white"
                >
                  {qualityOptions.map(quality => (
                    <option key={quality} value={quality}>{quality}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Information */}
            <div className="text-xs text-gray-400 mt-4">
              <p><strong>Conservative:</strong> Prioritizes connection stability over video quality</p>
              <p><strong>Balanced:</strong> Balances quality and stability based on participant count</p>
              <p><strong>Aggressive:</strong> Pushes for highest possible quality within limits</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
