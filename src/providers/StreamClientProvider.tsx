"use client";

import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  User as StreamUser,
  VideoPreview,
} from "@stream-io/video-react-sdk";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { tokenProvider } from "@/actions/stream.actions";
import Loader from "@/components/Loader";
import { Chat } from "stream-chat-react";
import { StreamChat } from "stream-chat";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const chatApiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();

  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const [chatClient, setChatClient] = useState<StreamChat>();

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }

    if (!apiKey) {
      throw new Error("Stream API key missing");
    }

    // Initialize Video Client
    const client = new StreamVideoClient({
      apiKey,
      user: {
        id: user.id,
        name: user.username || user.id,
        image: user.imageUrl,
      },
      tokenProvider,
    });

    console.log("StreamVideoClient instance created", client);
    setVideoClient(client);

    // Initialize Chat Client
    if (!chatApiKey) {
      throw new Error("Stream Chat API key missing");
    }

    const initializeChatClient = async () => {
      try {
        const chatClient = StreamChat.getInstance(chatApiKey);

        // Connect user to chat client
        await chatClient.connectUser(
          {
            id: user.id,
            name: user.username || user.id,
            image: user.imageUrl,
          },
          tokenProvider
        );

        console.log("StreamChat client connected", chatClient);
        setChatClient(chatClient);
      } catch (error) {
        console.error("Failed to initialize chat client:", error);
      }
    };

    initializeChatClient();

    // Cleanup function
    return () => {
      client.disconnectUser();
      chatClient?.disconnectUser();
      setVideoClient(undefined);
      setChatClient(undefined);
    };
  }, [user, isLoaded]);

  if (!videoClient || !chatClient) {
    return <Loader />;
  }

  return (
    <StreamVideo client={videoClient}>
      <Chat client={chatClient}>
        {children}
      </Chat>
    </StreamVideo>
  );
};

export default StreamVideoProvider;
