"use client"
import { cn } from "@/lib/utils";
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  ParticipantView,
  SpeakerLayout,
  useCallStateHooks,
  useParticipantViewContext,
} from "@stream-io/video-react-sdk";
import { useState, useEffect } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutList, User, MessageCircle, Grid3x3, Users, Monitor } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import EndCallButton from "./EndCallButton";
import HostControls from "./HostControls";
import Loader from "./Loader";
import Image from "next/image";
import { CompactVideoQualityControls } from "./VideoQualityDashboard";
import { AutoVideoQualityAdjuster } from "./AutoVideoQualityAdjuster";
import { SpeakerView } from "./test/screen-view/SpeakerView";
import { CustomParticipantViewUI } from "./custom/CustomParticipantViewUI";
import { CustomParticipantViewUIBar } from "./custom/CustomParticipantViewUIBar";
import ChatSidebar from "./ChatSidebar";
import ScreenShareControls from "./ScreenShareControls";
import ScreenShareLayout from "./ScreenShareLayout";
import ScreenShareNotification from "./ScreenShareNotification";
import ResponsiveGridLayout from "./ResponsiveGridLayout";
import ZoomLikeSpeakerLayout from "./ZoomLikeSpeakerLayout";
import ErrorBoundary from "./ErrorBoundary";

type CallLayoutType = "responsive-grid" | "zoom-speaker" | "speaker-center" | "screen-share" | "classic-grid";


const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get("personal");

  const [layout, setLayout] = useState<CallLayoutType>("zoom-speaker");
  const [showParticipents, setShowParticipents] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const { useCallCallingState, useScreenShareState, useParticipants } = useCallStateHooks();

  const callingState = useCallCallingState();
  const { status: screenShareStatus } = useScreenShareState();
  const participants = useParticipants();

  const router = useRouter();

  // Get the meeting ID from URL
  const meetingId = searchParams.get("id") || window.location.pathname.split('/').pop() || "default";

  // Auto-switch to screen share layout when someone starts screen sharing
  useEffect(() => {
    if (screenShareStatus === "enabled" && layout !== "screen-share") {
      setLayout("screen-share");
    } else if (screenShareStatus !== "enabled" && layout === "screen-share") {
      setLayout("zoom-speaker");
    }
  }, [screenShareStatus]); // Removed layout from dependencies to prevent infinite loop

  // Auto-switch to appropriate layout based on participant count
  useEffect(() => {
    if (layout !== "screen-share") {
      const participantCount = participants.length;
      if (participantCount <= 2 && layout !== "zoom-speaker") {
        setLayout("zoom-speaker");
      } else if (participantCount > 4 && layout === "speaker-center") {
        // For larger meetings, default to responsive grid
        setLayout("responsive-grid");
      }
    }
  }, [participants.length]); // Removed layout from dependencies to prevent infinite loop

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case "responsive-grid":
        return <ResponsiveGridLayout />;

      case "zoom-speaker":
        return <ZoomLikeSpeakerLayout />;

      case "classic-grid":
        return (
          <PaginatedGridLayout ParticipantViewUI={CustomParticipantViewUI} mirrorLocalParticipantVideo={false} />
        );

      case "speaker-center":
        return <SpeakerView />;

      case "screen-share":
        return <ScreenShareLayout />;

      default:
        return <ZoomLikeSpeakerLayout />;
    }
  };

  return (
    <section className="relative h-dvh w-full text-white flex overflow-y-auto flex-col">
      {/* Status Bar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <ScreenShareNotification />
      </div>

      <div className="top-0 flex size-full items-center justify-center">
        <div className={cn("flex size-full lg:max-w-[1000px] p-2", {
          "lg:max-w-[700px]": showChat // Reduce video area when chat is open
        })}>
          <ErrorBoundary fallbackMessage="Video layout encountered an error. Please try switching to a different layout.">
            <CallLayout />
          </ErrorBoundary>
        </div>
        <div
          className={cn(
            "h-[calc(100vh-86px)] hidden ml-2  w-[300px] border-4 border-red-400",
            {
              "show-block": showParticipents,
            }
          )}
        >
          <CallParticipantsList onClose={() => setShowParticipents(false)} />
        </div>

        {/* Chat Sidebar */}
        <ChatSidebar
          callId={meetingId}
          isVisible={showChat}
          onClose={() => setShowChat(false)}
        />
      </div>

      <div className="max-md:pt-10">
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 flex-wrap">
        <CallControls
          onLeave={() => {
            router.push("/");
          }}
        />

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent
            className="border-dark-1 bg-[#19232d]
           text-white"
          >
            {[
              { name: "Smart Grid", value: "responsive-grid", icon: Grid3x3 },
              { name: "Speaker View", value: "zoom-speaker", icon: Users },
              { name: "Classic Grid", value: "classic-grid", icon: LayoutList },
              { name: "Gallery", value: "speaker-center", icon: Monitor }
            ].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  className="cursor-pointer flex items-center"
                  onClick={() => {
                    setLayout(item.value as CallLayoutType);
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                  {layout === item.value && (
                    <span className="ml-auto text-blue-400">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-1" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CallStatsButton />
        <button onClick={() => setShowParticipents((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <User size={20} className="text-white" />
          </div>
        </button>

        {/* Chat Toggle Button */}
        <button onClick={() => setShowChat((prev) => !prev)}>
          <div className={cn(
            "cursor-pointer rounded-2xl px-4 py-2 hover:bg-[#4c535b]",
            {
              "bg-blue-600": showChat,
              "bg-[#19232d]": !showChat,
            }
          )}>
            <MessageCircle size={20} className="text-white" />
          </div>
        </button>

        {/* Host Controls */}
        <HostControls />

        {/* Enhanced Video Quality Controls */}
        <CompactVideoQualityControls />

        {/* Auto Quality Adjuster (background component) */}
        <AutoVideoQualityAdjuster />

         <EndCallButton />
      </div>
      </div>
    </section>
  );
};

export default MeetingRoom;
