"use client";

import React, { useState, useCallback } from "react";
import {
  useCallStateHooks,
  StreamVideoParticipant,
  ParticipantView,
} from "@stream-io/video-react-sdk";
import { cn } from "@/lib/utils";

interface ZoomLikeSpeakerLayoutProps {
  showParticipantStrip?: boolean;
  className?: string;
  maxStripParticipants?: number;
}

const ZoomLikeSpeakerLayout: React.FC<ZoomLikeSpeakerLayoutProps> = ({
  showParticipantStrip = true,
  className,
  maxStripParticipants = 8,
}) => {
  const { useParticipants, useLocalParticipant, useDominantSpeaker } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const dominantSpeaker = useDominantSpeaker();

  // Simplify state management to avoid infinite loops
  const [forcedMainParticipant, setForcedMainParticipant] = useState<StreamVideoParticipant | null>(null);

  // Determine main participant with simple logic
  const mainParticipant = forcedMainParticipant || dominantSpeaker || participants.find(p => p.userId !== localParticipant?.userId) || localParticipant || participants[0] || null;

  // Simple strip calculation
  const stripParticipants = participants.filter(p => p.sessionId !== mainParticipant?.sessionId);

  const handleParticipantClick = useCallback((participant: StreamVideoParticipant) => {
    setForcedMainParticipant(participant);
  }, []);

  if (!mainParticipant) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-gray-900 rounded-lg", className)}>
        <div className="text-center text-gray-400">
          <div className="text-6xl mb-4">📹</div>
          <p className="text-lg">No participants in the meeting</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Main participant view - using basic ParticipantView without custom UI to eliminate loop sources */}
      <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden mb-4">
        <ParticipantView
          participant={mainParticipant}
          className="w-full h-full"
        />

        <div className="absolute bottom-4 left-4">
          <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
            <p className="font-semibold">{mainParticipant.name || mainParticipant.userId || "Unknown"}</p>
            {dominantSpeaker?.sessionId === mainParticipant.sessionId && (
              <p className="text-sm text-green-400">Speaking</p>
            )}
          </div>
        </div>

        <div className="absolute top-4 left-4">
          <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
            {participants.length} participant{participants.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Strip - simplified without scrolling to avoid state update loops */}
      {stripParticipants.length > 0 && (
        <div className="relative">
          <div className="flex items-center space-x-3 py-2 overflow-x-auto">
            {stripParticipants.slice(0, maxStripParticipants).map((participant) => (
              <div
                key={participant.sessionId}
                className="flex-shrink-0 w-24 h-16 md:w-32 md:h-20 rounded-lg overflow-hidden cursor-pointer border-2 border-gray-600 hover:border-blue-400 transition-all duration-200"
                onClick={() => handleParticipantClick(participant)}
              >
                <ParticipantView
                  participant={participant}
                  className="w-full h-full"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1">
                  <p className="text-white text-xs font-medium truncate text-center">
                    {participant.name || participant.userId || "Unknown"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {stripParticipants.length > maxStripParticipants && (
            <div className="text-center text-gray-400 text-sm mt-2">
              Showing {Math.min(maxStripParticipants, stripParticipants.length)} of {stripParticipants.length} participants
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ZoomLikeSpeakerLayout;
