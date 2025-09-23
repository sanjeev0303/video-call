"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { Monitor } from "lucide-react";
import MeetingModal from "./MeetingModal";
import HomeCard from "./HomeCard";

const ScreenShareMeeting = () => {
  const router = useRouter();
  const client = useStreamVideoClient();
  const { user } = useUser();
  const { toast } = useToast();
  const [isScreenShareModalOpen, setIsScreenShareModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const createScreenShareMeeting = async () => {
    if (!client || !user) return;

    setIsCreating(true);
    try {
      const id = crypto.randomUUID();
      const call = client.call("default", id);

      if (!call) throw new Error("Failed to create meeting");

      await call.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
          custom: {
            description: "Screen Share Meeting",
            screenShare: true,
          },
        },
      });

      toast({
        title: "Screen Share Meeting Created",
        description: "You'll be able to start screen sharing immediately",
      });

      // Navigate to meeting and auto-start screen share
      router.push(`/meeting/${call.id}?screenShare=true`);
    } catch (error) {
      console.error("Error creating screen share meeting:", error);
      toast({
        title: "Failed to create Screen Share Meeting",
        description: "Please try again later",
      });
    } finally {
      setIsCreating(false);
      setIsScreenShareModalOpen(false);
    }
  };

  return (
    <>
      <HomeCard
        img="/icons/share.svg"
        title="Screen Share"
        description="Share your screen instantly"
        cardColor="bg-purple-1"
        handleClick={() => setIsScreenShareModalOpen(true)}
      />

      <MeetingModal
        isOpen={isScreenShareModalOpen}
        onClose={() => setIsScreenShareModalOpen(false)}
        title="Start Screen Share Meeting"
        className="text-center"
        buttonText={isCreating ? "Creating..." : "Start Screen Share"}
        handleClick={createScreenShareMeeting}
        image="/icons/share.svg"
      >
        <div className="flex flex-col items-center space-y-4">
          <Monitor className="w-16 h-16 text-blue-500" />
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Screen Share Meeting</h3>
            <p className="text-gray-400 text-sm">
              Create an instant meeting optimized for screen sharing.
              You'll be able to share your screen immediately after joining.
            </p>
          </div>

          <div className="bg-dark-3 rounded-lg p-4 w-full">
            <h4 className="font-medium mb-2">Features included:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• High-quality screen sharing</li>
              <li>• System audio capture (if supported)</li>
              <li>• Optimized for presentations</li>
              <li>• Up to 30 FPS sharing</li>
            </ul>
          </div>
        </div>
      </MeetingModal>
    </>
  );
};

export default ScreenShareMeeting;
