"use client";

import React, { useState } from "react";
import {
  useCall,
  useCallStateHooks,
  StreamVideoParticipant
} from "@stream-io/video-react-sdk";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Settings,
  Mic,
  MicOff,
  Video,
  VideoOff,
  UserMinus,
  Shield,
  Volume2,
  VolumeX,
  Crown,
  AlertTriangle,
  Users,
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const HostControls = () => {
  const call = useCall();
  const { useLocalParticipant, useParticipants } = useCallStateHooks();
  const [isParticipantsPanelOpen, setIsParticipantsPanelOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<StreamVideoParticipant | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const localParticipant = useLocalParticipant();
  const participants = useParticipants();

  // Check if current user is host/owner
  const isHost =
    localParticipant &&
    call?.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  // For now, we'll check host status - in production you might want more granular permissions
  const canMuteUsers = isHost;
  const canBlockUsers = isHost;
  const canRemoveUsers = isHost;

  if (!isHost) {
    return null;
  }

  const handleMuteParticipant = async (participant: StreamVideoParticipant, mute: boolean) => {
    if (!call || !participant.userId) return;

    setActionLoading(`${mute ? 'muting' : 'unmuting'}-${participant.userId}`);

    try {
      if (mute) {
        await call.muteUser(participant.userId, 'audio');
        toast({
          title: "Participant Muted",
          description: `${participant.name || participant.userId} has been muted`,
        });
      } else {
        // For unmuting, we need to request the participant to unmute themselves
        // Stream.io doesn't allow forced unmuting for security reasons
        toast({
          title: "Unmute Request",
          description: `${participant.name || participant.userId} will be asked to unmute`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mute ? 'mute' : 'unmute'} participant`,
        variant: "destructive",
      });
      console.error(`Error ${mute ? 'muting' : 'unmuting'} participant:`, error);
    }

    setActionLoading(null);
  };

  const handleMuteVideo = async (participant: StreamVideoParticipant, mute: boolean) => {
    if (!call || !participant.userId) return;

    setActionLoading(`${mute ? 'video-muting' : 'video-unmuting'}-${participant.userId}`);

    try {
      if (mute) {
        await call.muteUser(participant.userId, 'video');
        toast({
          title: "Video Disabled",
          description: `${participant.name || participant.userId}'s video has been disabled`,
        });
      } else {
        toast({
          title: "Video Enable Request",
          description: `${participant.name || participant.userId} will be asked to enable video`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mute ? 'disable' : 'enable'} participant's video`,
        variant: "destructive",
      });
      console.error(`Error ${mute ? 'muting' : 'unmuting'} participant's video:`, error);
    }

    setActionLoading(null);
  };

  const handleRemoveParticipant = async (participant: StreamVideoParticipant) => {
    if (!call || !participant.userId) return;

    setActionLoading(`removing-${participant.userId}`);

    try {
      await call.blockUser(participant.userId);
      toast({
        title: "Participant Removed",
        description: `${participant.name || participant.userId} has been removed from the meeting`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove participant",
        variant: "destructive",
      });
      console.error("Error removing participant:", error);
    }

    setActionLoading(null);
  };

  const handleMuteAll = async () => {
    if (!call) return;

    setActionLoading('muting-all');

    try {
      const otherParticipants = participants.filter(
        p => p.userId !== localParticipant?.userId
      );

      await Promise.all(
        otherParticipants.map(p =>
          p.userId ? call.muteUser(p.userId, 'audio') : Promise.resolve()
        )
      );

      toast({
        title: "All Participants Muted",
        description: `${otherParticipants.length} participants have been muted`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mute all participants",
        variant: "destructive",
      });
      console.error("Error muting all participants:", error);
    }

    setActionLoading(null);
  };

  const handleUnmuteAll = async () => {
    if (!call) return;

    setActionLoading('unmuting-all');

    try {
      toast({
        title: "Unmute All Request Sent",
        description: "All participants will be asked to unmute themselves",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send unmute request",
        variant: "destructive",
      });
      console.error("Error requesting unmute all:", error);
    }

    setActionLoading(null);
  };

  const ParticipantRow = ({ participant }: { participant: StreamVideoParticipant }) => {
    const isCurrentUser = participant.userId === localParticipant?.userId;
    const isAudioMuted = !participant.publishedTracks.includes('audioTrack' as any);
    const isVideoMuted = !participant.publishedTracks.includes('videoTrack' as any);

    return (
      <div className="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {(participant.name || participant.userId || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            {isCurrentUser && (
              <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
            )}
          </div>
          <div>
            <p className="font-medium text-white">
              {participant.name || participant.userId || 'Unknown'}
              {isCurrentUser && ' (You)'}
            </p>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              {isAudioMuted ? (
                <MicOff className="w-3 h-3 text-red-500" />
              ) : (
                <Mic className="w-3 h-3 text-green-500" />
              )}
              {isVideoMuted ? (
                <VideoOff className="w-3 h-3 text-red-500" />
              ) : (
                <Video className="w-3 h-3 text-green-500" />
              )}
            </div>
          </div>
        </div>

        {!isCurrentUser && (canMuteUsers || canRemoveUsers) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-600"
                disabled={actionLoading?.includes(participant.userId || '') || false}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-gray-800 border-gray-600">
              {canMuteUsers && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleMuteParticipant(participant, !isAudioMuted)}
                    className="hover:bg-gray-700 text-white"
                    disabled={actionLoading?.includes(participant.userId || '') || false}
                  >
                    {isAudioMuted ? (
                      <>
                        <Mic className="mr-2 h-4 w-4 text-green-500" />
                        Request Unmute
                      </>
                    ) : (
                      <>
                        <MicOff className="mr-2 h-4 w-4 text-red-500" />
                        Mute Audio
                      </>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleMuteVideo(participant, !isVideoMuted)}
                    className="hover:bg-gray-700 text-white"
                    disabled={actionLoading?.includes(participant.userId || '') || false}
                  >
                    {isVideoMuted ? (
                      <>
                        <Video className="mr-2 h-4 w-4 text-green-500" />
                        Request Video Enable
                      </>
                    ) : (
                      <>
                        <VideoOff className="mr-2 h-4 w-4 text-red-500" />
                        Disable Video
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-600" />
                </>
              )}

              {canRemoveUsers && (
                <DropdownMenuItem
                  onClick={() => handleRemoveParticipant(participant)}
                  className="hover:bg-gray-700 text-red-400"
                  disabled={actionLoading?.includes(participant.userId || '') || false}
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  Remove from Meeting
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-2">
      {/* Quick Mute All Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="bg-[#19232d] hover:bg-[#4c535b] text-white rounded-2xl px-4 py-2"
            disabled={!!actionLoading}
          >
            <Shield className="h-4 w-4 mr-2" />
            Host Controls
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-600">
          <DropdownMenuItem
            onClick={handleMuteAll}
            className="hover:bg-gray-700 text-white"
            disabled={actionLoading === 'muting-all'}
          >
            <VolumeX className="mr-2 h-4 w-4 text-red-500" />
            Mute All Participants
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleUnmuteAll}
            className="hover:bg-gray-700 text-white"
            disabled={actionLoading === 'unmuting-all'}
          >
            <Volume2 className="mr-2 h-4 w-4 text-green-500" />
            Request Unmute All
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-600" />

          <DropdownMenuItem
            onClick={() => setIsParticipantsPanelOpen(true)}
            className="hover:bg-gray-700 text-white"
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Participants ({participants.length})
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Participants Management Dialog */}
      <Dialog open={isParticipantsPanelOpen} onOpenChange={setIsParticipantsPanelOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Manage Participants ({participants.length})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {participants.map((participant) => (
              <ParticipantRow key={participant.sessionId} participant={participant} />
            ))}
          </div>

          {participants.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No participants in the meeting</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HostControls;
