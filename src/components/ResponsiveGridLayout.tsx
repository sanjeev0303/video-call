"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useCallStateHooks,
  StreamVideoParticipant,
  ParticipantView,
} from "@stream-io/video-react-sdk";
import { cn } from "@/lib/utils";

interface ResponsiveGridLayoutProps {
  showParticipantCount?: boolean;
  maxVisibleParticipants?: number;
  className?: string;
}

interface GridConfig {
  columns: number;
  rows: number;
  aspectRatio: string;
  gap: string;
  participantHeight: string;
}

const ResponsiveGridLayout: React.FC<ResponsiveGridLayoutProps> = ({
  showParticipantCount = true,
  maxVisibleParticipants = 25,
  className
}) => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Calculate optimal grid configuration based on participant count
  const gridConfig = useMemo((): GridConfig => {
    const participantCount = Math.min(participants.length, maxVisibleParticipants);

    if (participantCount === 0) {
      return { columns: 1, rows: 1, aspectRatio: "16/9", gap: "0.5rem", participantHeight: "100%" };
    }

    if (participantCount === 1) {
      return { columns: 1, rows: 1, aspectRatio: "16/9", gap: "0.5rem", participantHeight: "100%" };
    }

    if (participantCount === 2) {
      return { columns: 2, rows: 1, aspectRatio: "16/9", gap: "0.75rem", participantHeight: "100%" };
    }

    if (participantCount <= 4) {
      return { columns: 2, rows: 2, aspectRatio: "4/3", gap: "0.5rem", participantHeight: "auto" };
    }

    if (participantCount <= 6) {
      return { columns: 3, rows: 2, aspectRatio: "4/3", gap: "0.5rem", participantHeight: "auto" };
    }

    if (participantCount <= 9) {
      return { columns: 3, rows: 3, aspectRatio: "4/3", gap: "0.5rem", participantHeight: "auto" };
    }

    if (participantCount <= 12) {
      return { columns: 4, rows: 3, aspectRatio: "4/3", gap: "0.25rem", participantHeight: "auto" };
    }

    if (participantCount <= 16) {
      return { columns: 4, rows: 4, aspectRatio: "4/3", gap: "0.25rem", participantHeight: "auto" };
    }

    if (participantCount <= 20) {
      return { columns: 5, rows: 4, aspectRatio: "4/3", gap: "0.25rem", participantHeight: "auto" };
    }

    // For 21+ participants
    return { columns: 5, rows: 5, aspectRatio: "4/3", gap: "0.125rem", participantHeight: "auto" };
  }, [participants.length, maxVisibleParticipants]);

  // Handle responsive container sizing
  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('responsive-grid-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate participants to display
  const visibleParticipants = participants.slice(0, maxVisibleParticipants);
  const hiddenCount = Math.max(0, participants.length - maxVisibleParticipants);

  // Generate grid style
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
    gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
    gap: gridConfig.gap,
    width: '100%',
    height: '100%',
    aspectRatio: gridConfig.aspectRatio,
  };

  const ParticipantTile = ({ participant, index }: { participant: StreamVideoParticipant; index: number }) => {
    const isLastTile = index === visibleParticipants.length - 1 && hiddenCount > 0;

    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-gray-900 border border-gray-700",
          "min-h-0", // Allow flex children to shrink
          {
            "aspect-video": gridConfig.columns <= 2,
            "aspect-[4/3]": gridConfig.columns > 2,
          }
        )}
        style={{
          height: gridConfig.participantHeight,
        }}
      >
        {!isLastTile ? (
          <ParticipantView
            participant={participant}
            className="w-full h-full"
          />
        ) : (
          <>
            <ParticipantView
              participant={participant}
              className="w-full h-full opacity-50"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  +{hiddenCount}
                </div>
                <div className="text-sm text-gray-300">
                  more participants
                </div>
              </div>
            </div>
          </>
        )}

        {/* Participant info overlay */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="bg-black bg-opacity-50 rounded px-2 py-1">
            <p className="text-white text-xs font-medium truncate">
              {participant.name || participant.userId || 'Unknown'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (participants.length === 0) {
    return (
      <div
        id="responsive-grid-container"
        className={cn("flex items-center justify-center h-full bg-gray-900 rounded-lg", className)}
      >
        <div className="text-center text-gray-400">
          <div className="text-6xl mb-4">📹</div>
          <p className="text-lg">Waiting for participants to join...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="responsive-grid-container"
      className={cn("relative w-full h-full p-4", className)}
    >
      {/* Participant count indicator */}
      {showParticipantCount && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Responsive Grid */}
      <div style={gridStyle} className="mx-auto">
        {visibleParticipants.map((participant, index) => (
          <ParticipantTile
            key={participant.sessionId}
            participant={participant}
            index={index}
          />
        ))}
      </div>

      {/* Additional info for large meetings */}
      {participants.length > 20 && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="bg-blue-600 bg-opacity-90 text-white px-4 py-2 rounded-lg text-center">
            <p className="text-sm">
              Large meeting detected ({participants.length} participants).
              Layout optimized for performance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveGridLayout;
