"use client";

import { useState, useEffect } from "react";
import {
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Window,
  useChatContext,
} from "stream-chat-react";
import { Channel as StreamChannel } from "stream-chat";
import { X } from "lucide-react";

interface ChatSidebarProps {
  callId: string;
  isVisible: boolean;
  onClose: () => void;
}

const ChatSidebar = ({ callId, isVisible, onClose }: ChatSidebarProps) => {
  const { client } = useChatContext();
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeChannel = async () => {
      if (!client || !callId || initialized) return;

      try {
        // Prefer watch() over create() to avoid permission issues on existing channels
        const meetingChannel = client.channel("messaging", `meeting-${callId}`, {
          name: `Meeting Chat`,
          members: [client.userID!],
        });

        // Try to watch (will create implicitly if allowed by policies)
        await meetingChannel.watch({ state: true, presence: true });
        setChannel(meetingChannel);
      } catch (err: any) {
        console.error("Error initializing meeting chat channel:", err);
        // Avoid retry loops, set error and stop initializing
        const msg =
          err?.message ||
          "Chat is not available for your account. Please contact the administrator.";
        setError(msg);
      } finally {
        setInitialized(true);
      }
    };

    initializeChannel();
  }, [client, callId, initialized]);

  if (!isVisible) return null;

  if (error) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">Meeting Chat</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error.includes("code 17") || error.toLowerCase().includes("not allowed")
            ? "You don't have permission to access meeting chat."
            : error}
        </div>
      </div>
    );
  }

  if (!client || !channel) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-lg">Meeting Chat</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Channel channel={channel}>
          <Window>
            <MessageList />
            <MessageInput />
          </Window>
        </Channel>
      </div>
    </div>
  );
};

export default ChatSidebar;
