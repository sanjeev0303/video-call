"use client";

import {
  useCallStateHooks,
  ParticipantView,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";
import { CustomParticipantViewUI } from "./custom/CustomParticipantViewUI";
import { CustomParticipantViewUIBar } from "./custom/CustomParticipantViewUIBar";

const ScreenShareLayout = () => {
  const { useParticipants, useScreenShareState } = useCallStateHooks();
  const participants = useParticipants();
  const { status } = useScreenShareState();

  // Find participants who are screen sharing
  const screenSharingParticipants = participants.filter(
    participant => participant.screenShareStream !== undefined
  );

  const regularParticipants = participants.filter(
    participant => participant.screenShareStream === undefined
  );

  // If no one is screen sharing, return null (use default layout)
  if (status !== "enabled" || screenSharingParticipants.length === 0) {
    return null;
  }

  const screenSharer = screenSharingParticipants[0];

  return (
    <div className="flex h-full">
      {/* Main screen share area */}
      <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden">
        <ParticipantView
          participant={screenSharer}
          trackType="screenShareTrack"
          ParticipantViewUI={CustomParticipantViewUI}
        />
      </div>

      {/* Side panel with regular participants */}
      {regularParticipants.length > 0 && (
        <div className="w-80 ml-4 flex flex-col space-y-2 max-h-full overflow-y-auto">
          {regularParticipants.slice(0, 6).map((participant) => (
            <div key={participant.sessionId} className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
              <ParticipantView
                participant={participant}
                ParticipantViewUI={CustomParticipantViewUIBar}
              />
            </div>
          ))}
          {regularParticipants.length > 6 && (
            <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">
                +{regularParticipants.length - 6} more
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScreenShareLayout;
