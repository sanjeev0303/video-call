"use client";

import { useCallStateHooks } from "@stream-io/video-react-sdk";
import { Monitor, X } from "lucide-react";
import { useState } from "react";

const ScreenShareNotification = () => {
  const { useParticipants, useScreenShareState } = useCallStateHooks();
  const participants = useParticipants();
  const { status } = useScreenShareState();
  const [isVisible, setIsVisible] = useState(true);

  // Find participants who are screen sharing
  const screenSharingParticipants = participants.filter(
    participant => participant.screenShareStream !== undefined
  );

  // Don't show if no one is screen sharing or if dismissed
  if (status !== "enabled" || screenSharingParticipants.length === 0 || !isVisible) {
    return null;
  }

  const sharer = screenSharingParticipants[0];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-3">
        <Monitor size={20} />
        <div className="flex-1">
          <p className="font-medium">
            {sharer.name || sharer.userId} is sharing their screen
          </p>
          <p className="text-sm opacity-90">
            {screenSharingParticipants.length > 1 &&
              `+${screenSharingParticipants.length - 1} others sharing`
            }
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="hover:bg-blue-700 rounded p-1"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ScreenShareNotification;
