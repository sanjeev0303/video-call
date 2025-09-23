"use client";

import { useState } from "react";
import {
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import {
  Monitor,
  MonitorOff,
  Settings,
  Volume2,
  VolumeX
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ContentHintType = "motion" | "detail" | "text" | "";
type QualityPreset = "low" | "medium" | "high" | "ultra";

interface ScreenShareSettings {
  contentHint: ContentHintType;
  maxFramerate: number;
  maxBitrate: number;
  includeAudio: boolean;
  quality: QualityPreset;
}

const ScreenShareControls = () => {
  const call = useCall();
  const { useScreenShareState } = useCallStateHooks();
  const { status, screenShare } = useScreenShareState();

  const [settings, setSettings] = useState<ScreenShareSettings>({
    contentHint: "",
    maxFramerate: 15,
    maxBitrate: 1500000,
    includeAudio: false,
    quality: "medium"
  });

  const isScreenSharing = status === "enabled";

  const qualityPresets = {
    low: {
      video: { width: { max: 1280 }, height: { max: 720 }, frameRate: { ideal: 15 } },
      maxFramerate: 15,
      maxBitrate: 800000
    },
    medium: {
      video: { width: { max: 1920 }, height: { max: 1080 }, frameRate: { ideal: 25 } },
      maxFramerate: 25,
      maxBitrate: 1500000
    },
    high: {
      video: { width: { max: 2560 }, height: { max: 1440 }, frameRate: { ideal: 30 } },
      maxFramerate: 30,
      maxBitrate: 3000000
    },
    ultra: {
      video: { width: { max: 3840 }, height: { max: 2160 }, frameRate: { ideal: 30 } },
      maxFramerate: 30,
      maxBitrate: 5000000
    }
  };

  const contentHintOptions = [
    { value: "", label: "General Content" },
    { value: "motion", label: "Motion (Videos)" },
    { value: "detail", label: "Detail (Images/Art)" },
    { value: "text", label: "Text Content" }
  ];

  const applySettings = async () => {
    if (!call) return;

    try {
      // Set quality constraints
      const qualityConfig = qualityPresets[settings.quality];
      call.screenShare.setDefaultConstraints(qualityConfig);

      // Set content hint and bitrate
      call.screenShare.setSettings({
        contentHint: settings.contentHint,
        maxFramerate: settings.maxFramerate,
        maxBitrate: settings.maxBitrate,
      });

      // Handle audio
      if (settings.includeAudio) {
        call.screenShare.enableScreenShareAudio();
      } else {
        call.screenShare.disableScreenShareAudio();
      }
    } catch (error) {
      console.error("Failed to apply screen share settings:", error);
    }
  };

  const toggleScreenShare = async () => {
    if (!call) return;

    try {
      if (!isScreenSharing) {
        await applySettings();
      }
      await call.screenShare.toggle();
    } catch (error) {
      console.error("Failed to toggle screen share:", error);
    }
  };

  const updateSettings = (newSettings: Partial<ScreenShareSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Main Screen Share Toggle */}
      <button onClick={toggleScreenShare}>
        <div className={cn(
          "cursor-pointer rounded-2xl px-4 py-2 hover:bg-[#4c535b] flex items-center space-x-2",
          {
            "bg-blue-600": isScreenSharing,
            "bg-[#19232d]": !isScreenSharing,
          }
        )}>
          {isScreenSharing ? (
            <MonitorOff size={20} className="text-white" />
          ) : (
            <Monitor size={20} className="text-white" />
          )}
          {isScreenSharing && (
            <span className="text-white text-sm font-medium">Sharing</span>
          )}
        </div>
      </button>

      {/* Screen Share Settings */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button>
            <div className="cursor-pointer rounded-2xl bg-[#19232d] px-3 py-2 hover:bg-[#4c535b]">
              <Settings size={16} className="text-white" />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 border-dark-1 bg-[#19232d] text-white">
          <DropdownMenuLabel>Screen Share Settings</DropdownMenuLabel>
          <DropdownMenuSeparator className="border-dark-1" />

          {/* Quality Preset */}
          <DropdownMenuLabel className="text-sm font-normal text-gray-300">
            Quality Preset
          </DropdownMenuLabel>
          {Object.entries(qualityPresets).map(([key, preset]) => (
            <DropdownMenuItem
              key={key}
              className={cn(
                "cursor-pointer capitalize",
                settings.quality === key && "bg-blue-600"
              )}
              onClick={() => updateSettings({ quality: key as QualityPreset })}
            >
              {key} Quality
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator className="border-dark-1" />

          {/* Content Hint */}
          <DropdownMenuLabel className="text-sm font-normal text-gray-300">
            Content Optimization
          </DropdownMenuLabel>
          {contentHintOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className={cn(
                "cursor-pointer",
                settings.contentHint === option.value && "bg-blue-600"
              )}
              onClick={() => updateSettings({ contentHint: option.value as ContentHintType })}
            >
              {option.label}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator className="border-dark-1" />

          {/* Audio Toggle */}
          <DropdownMenuItem
            className="cursor-pointer flex items-center space-x-2"
            onClick={() => updateSettings({ includeAudio: !settings.includeAudio })}
          >
            {settings.includeAudio ? (
              <Volume2 size={16} className="text-green-500" />
            ) : (
              <VolumeX size={16} className="text-gray-400" />
            )}
            <span>Include System Audio</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="border-dark-1" />

          {/* Custom Settings */}
          <div className="px-2 py-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Max FPS:</label>
              <select
                value={settings.maxFramerate}
                onChange={(e) => updateSettings({ maxFramerate: Number(e.target.value) })}
                className="bg-dark-3 text-white text-sm rounded px-2 py-1"
              >
                {[5, 10, 15, 20, 25, 30].map(fps => (
                  <option key={fps} value={fps}>{fps}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Bitrate:</label>
              <select
                value={settings.maxBitrate}
                onChange={(e) => updateSettings({ maxBitrate: Number(e.target.value) })}
                className="bg-dark-3 text-white text-sm rounded px-2 py-1"
              >
                <option value={500000}>0.5 Mbps</option>
                <option value={1000000}>1 Mbps</option>
                <option value={1500000}>1.5 Mbps</option>
                <option value={2000000}>2 Mbps</option>
                <option value={3000000}>3 Mbps</option>
                <option value={5000000}>5 Mbps</option>
              </select>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Indicator */}
      {isScreenSharing && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-500 text-sm font-medium">LIVE</span>
        </div>
      )}
    </div>
  );
};

export default ScreenShareControls;
