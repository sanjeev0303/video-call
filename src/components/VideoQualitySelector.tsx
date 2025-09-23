"use client"

import { useEffect, useState, type FormEvent } from "react";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import type { Call } from "@stream-io/video-react-sdk";
import { Settings, Wifi, WifiOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const incomingVideoSettings = ["auto", "1080p", "720p", "480p", "360p", "240p", "off"] as const;
type IncomingVideoSetting = (typeof incomingVideoSettings)[number];
type VideoDimension = { width: number; height: number };

// Outgoing video quality settings (for publishing)
const outgoingVideoSettings = ["auto", "1080p", "720p", "480p", "360p", "240p"] as const;
type OutgoingVideoSetting = (typeof outgoingVideoSettings)[number];

export function applyIncomingVideoSetting(call: Call, setting: IncomingVideoSetting) {
  if (setting === "auto") {
    call.setIncomingVideoEnabled(true);
  } else if (setting === "off") {
    call.setIncomingVideoEnabled(false);
  } else {
    call.setPreferredIncomingVideoResolution(
      incomingVideoSettingToResolution(setting),
    );
  }
}

function applyOutgoingVideoSetting(call: Call, setting: OutgoingVideoSetting) {
  if (setting === "auto") {
    // Remove constraints to let the system choose optimal settings
    call.camera.enable();
  } else {
    const resolution = outgoingVideoSettingToResolution(setting);
    // Note: Stream.io handles outgoing quality automatically based on network conditions
    // This is more for UI feedback and potential future API extensions
    call.camera.enable();
  }
}

export function incomingVideoSettingToResolution(
  setting: Exclude<IncomingVideoSetting, "auto" | "off">,
): VideoDimension {
  switch (setting) {
    case "1080p":
      return { width: 1920, height: 1080 };
    case "720p":
      return { width: 1280, height: 720 };
    case "480p":
      return { width: 640, height: 480 };
    case "360p":
      return { width: 640, height: 360 };
    case "240p":
      return { width: 320, height: 240 };
  }
}

function outgoingVideoSettingToResolution(
  setting: Exclude<OutgoingVideoSetting, "auto">,
): VideoDimension {
  switch (setting) {
    case "1080p":
      return { width: 1920, height: 1080 };
    case "720p":
      return { width: 1280, height: 720 };
    case "480p":
      return { width: 640, height: 480 };
    case "360p":
      return { width: 640, height: 360 };
    case "240p":
      return { width: 320, height: 240 };
  }
}

function incomingVideoResolutionToSetting(
  resolution: VideoDimension,
): IncomingVideoSetting {
  switch (true) {
    case resolution.height >= 1080:
      return "1080p";
    case resolution.height >= 720:
      return "720p";
    case resolution.height >= 480:
      return "480p";
    case resolution.height >= 360:
      return "360p";
    case resolution.height >= 240:
      return "240p";
    default:
      return "auto";
  }
}

// Get quality label with bandwidth indication
function getQualityLabel(setting: IncomingVideoSetting | OutgoingVideoSetting): string {
  const labels = {
    "auto": "Auto (Adaptive)",
    "1080p": "1080p HD (High bandwidth)",
    "720p": "720p HD (Medium bandwidth)",
    "480p": "480p SD (Low bandwidth)",
    "360p": "360p (Very low bandwidth)",
    "240p": "240p (Minimal bandwidth)",
    "off": "Off (Audio only)"
  };
  return labels[setting] || setting;
}

// Get quality icon
function getQualityIcon(setting: IncomingVideoSetting | OutgoingVideoSetting) {
  if (setting === "off") return <WifiOff className="w-4 h-4" />;
  return <Wifi className="w-4 h-4" />;
}

export const IncomingVideoQualitySelector = () => {
  const call = useCall();
  const { useIncomingVideoSettings } = useCallStateHooks();

  // Default values
  let enabled = false;
  let preferredResolution = null;

  // Safely get video settings
  try {
    if (call) {
      const videoSettings = useIncomingVideoSettings();
      enabled = videoSettings?.enabled || false;
      preferredResolution = videoSettings?.preferredResolution || null;
    }
  } catch (error) {
    console.error("Error getting incoming video settings:", error);
  }

  let currentSetting: IncomingVideoSetting;
  if (!preferredResolution) {
    currentSetting = enabled ? "auto" : "off";
  } else {
    currentSetting = incomingVideoResolutionToSetting(preferredResolution);
  }

  // Return early if no call
  if (!call) {
    return null;
  }

  const handleIncomingQualityChange = (setting: IncomingVideoSetting) => {
    if (call) {
      applyIncomingVideoSetting(call, setting);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] text-white flex items-center gap-2">
        {getQualityIcon(currentSetting)}
        <span className="hidden sm:inline">Quality</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-dark-1 bg-[#19232d] text-white min-w-[250px]">
        <DropdownMenuLabel>Incoming Video Quality</DropdownMenuLabel>
        <DropdownMenuSeparator className="border-dark-1" />
        {incomingVideoSettings.map((setting) => (
          <DropdownMenuItem
            key={setting}
            className={`cursor-pointer ${
              currentSetting === setting ? "bg-blue-600" : ""
            }`}
            onClick={() => handleIncomingQualityChange(setting)}
          >
            <div className="flex items-center gap-3 w-full">
              {getQualityIcon(setting)}
              <span>{getQualityLabel(setting)}</span>
              {currentSetting === setting && (
                <span className="ml-auto text-xs text-blue-300">✓</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Enhanced Video Quality Settings Component
export const VideoQualitySettings = () => {
  const call = useCall();
  const { useIncomingVideoSettings, useParticipants } = useCallStateHooks();

  // State variables
  const [incomingSetting, setIncomingSetting] = useState<IncomingVideoSetting>("auto");
  const [outgoingSetting, setOutgoingSetting] = useState<OutgoingVideoSetting>("auto");
  const [perParticipantMode, setPerParticipantMode] = useState(false);

  // Safely get video settings with error handling
  let enabled = false;
  let preferredResolution = null;
  let participants: any[] = [];

  try {
    if (call) {
      const videoSettings = useIncomingVideoSettings();
      enabled = videoSettings?.enabled || false;
      preferredResolution = videoSettings?.preferredResolution || null;
      participants = useParticipants() || [];
    }
  } catch (error) {
    console.error("Error getting video settings:", error);
  }

  // Update incoming setting state when settings change
  useEffect(() => {
    if (!call) return;

    if (!preferredResolution) {
      setIncomingSetting(enabled ? "auto" : "off");
    } else {
      setIncomingSetting(incomingVideoResolutionToSetting(preferredResolution));
    }
  }, [call, enabled, preferredResolution]);

  // Guard against missing call context - after hooks
  if (!call) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400 text-sm">Video quality settings require an active call</p>
      </div>
    );
  }

  const handleIncomingQualityChange = (setting: IncomingVideoSetting) => {
    if (call) {
      applyIncomingVideoSetting(call, setting);
      setIncomingSetting(setting);
    }
  };

  const handleOutgoingQualityChange = (setting: OutgoingVideoSetting) => {
    if (call) {
      applyOutgoingVideoSetting(call, setting);
      setOutgoingSetting(setting);
    }
  };

  const applyHighQualityToDominantSpeaker = () => {
    if (call && participants.length > 0) {
      const [dominantParticipant] = participants;
      if (dominantParticipant) {
        call.setPreferredIncomingVideoResolution(
          incomingVideoSettingToResolution("1080p"),
          [dominantParticipant.sessionId],
        );
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] text-white flex items-center gap-2">
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Video Settings</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-dark-1 bg-[#19232d] text-white min-w-[300px]">
        <DropdownMenuLabel>Incoming Video Quality</DropdownMenuLabel>
        <DropdownMenuSeparator className="border-dark-1" />
        {incomingVideoSettings.map((setting) => (
          <DropdownMenuItem
            key={`incoming-${setting}`}
            className={`cursor-pointer ${
              incomingSetting === setting ? "bg-blue-600" : ""
            }`}
            onClick={() => handleIncomingQualityChange(setting)}
          >
            <div className="flex items-center gap-3 w-full">
              {getQualityIcon(setting)}
              <span className="text-sm">{getQualityLabel(setting)}</span>
              {incomingSetting === setting && (
                <span className="ml-auto text-xs text-blue-300">✓</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="border-dark-1" />
        <DropdownMenuLabel>Outgoing Video Quality</DropdownMenuLabel>
        <DropdownMenuSeparator className="border-dark-1" />
        {outgoingVideoSettings.map((setting) => (
          <DropdownMenuItem
            key={`outgoing-${setting}`}
            className={`cursor-pointer ${
              outgoingSetting === setting ? "bg-green-600" : ""
            }`}
            onClick={() => handleOutgoingQualityChange(setting)}
          >
            <div className="flex items-center gap-3 w-full">
              {getQualityIcon(setting)}
              <span className="text-sm">{getQualityLabel(setting)}</span>
              {outgoingSetting === setting && (
                <span className="ml-auto text-xs text-green-300">✓</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}

        {participants.length > 1 && (
          <>
            <DropdownMenuSeparator className="border-dark-1" />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={applyHighQualityToDominantSpeaker}
            >
              <div className="flex items-center gap-3 w-full">
                <Settings className="w-4 h-4" />
                <span className="text-sm">HD for dominant speaker</span>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
