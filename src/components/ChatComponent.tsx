"use client";

import { useEffect, useState } from "react";
import {
  Channel,
  ChannelHeader,
  ChannelList,
  MessageList,
  MessageInput,
  Window,
  useChatContext,
} from "stream-chat-react";
import {
  CallingState,
  useCall,
  useCalls,
  useCallStateHooks,
  Call,
} from "@stream-io/video-react-sdk";
import { StreamChat, Channel as StreamChannel } from "stream-chat";

// Ring Call Controls Component
const RingingCallControls = ({ call }: { call: Call }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.RINGING) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Incoming Call</h3>
        <p className="mb-4">Call from {call?.state.createdBy?.name || "Unknown"}</p>
        <div className="flex space-x-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => call?.join()}
          >
            Accept
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={() => call?.reject()}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

// Channel Preview with Call Controls
const ChannelPreviewCallControls = ({
  channel,
  call
}: {
  channel: StreamChannel;
  call?: Call | undefined;
}) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = call ? useCallCallingState() : null;

  const startCall = async () => {
    if (call) {
      await call.join();
    }
  };

  return (
    <div className="p-3 border-b border-gray-200 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{channel.data?.name || 'Direct Message'}</h4>
          <p className="text-sm text-gray-600">
            {channel.state.members && Object.keys(channel.state.members).length} members
          </p>
        </div>
        {call && (
          <div className="flex space-x-2">
            {callingState === CallingState.RINGING && (
              <span className="text-sm text-orange-600">Ringing...</span>
            )}
            {callingState === CallingState.JOINED && (
              <span className="text-sm text-green-600">In Call</span>
            )}
            <button
              onClick={startCall}
              className="text-blue-500 hover:text-blue-700 text-sm"
              disabled={callingState === CallingState.JOINING}
            >
              {callingState === CallingState.JOINED ? 'Rejoin' : 'Call'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Call Panel Component
const CallPanel = ({ call }: { call: Call }) => {
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();

  if (callingState !== CallingState.JOINED) return null;

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Video Call Active</h3>
        <span className="text-sm text-gray-300">
          {participants.length} participant{participants.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => call.camera.toggle()}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
        >
          Toggle Camera
        </button>
        <button
          onClick={() => call.microphone.toggle()}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
        >
          Toggle Mic
        </button>
        <button
          onClick={() => call.leave()}
          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
        >
          Leave
        </button>
      </div>
    </div>
  );
};

// Main Chat Component with Video Integration
const ChatComponent = ({ callId }: { callId?: string }) => {
  const { client } = useChatContext();
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [isChannelListVisible, setIsChannelListVisible] = useState(true);

  // Get all calls including ringing ones
  const calls = useCalls();
  const currentCall = useCall();

  // Find any ringing calls
  const ringingCalls = calls.filter(call =>
    call.state.callingState === CallingState.RINGING
  );

  useEffect(() => {
    const initializeChannel = async () => {
      if (!client) return;

      try {
        let targetChannel;

        if (callId) {
          // Create or get a channel specific to the call
          targetChannel = client.channel("messaging", `call-${callId}`, {
            name: `Meeting Chat - ${callId}`,
            members: [client.userID!],
          });
        } else {
          // Default to general channel
          targetChannel = client.channel("messaging", "general", {
            name: "General Chat",
            members: [client.userID!],
          });
        }

        await targetChannel.create();
        setChannel(targetChannel);
      } catch (error) {
        console.error("Error initializing chat channel:", error);
      }
    };

    initializeChannel();
  }, [client, callId]);

  if (!client || !channel) {
    return <div className="p-4">Loading chat...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Render ringing call controls */}
      {ringingCalls.map(call => (
        <RingingCallControls key={call.id} call={call} />
      ))}

      {/* Active call panel */}
      {currentCall && <CallPanel call={currentCall} />}

      <div className="flex flex-1 overflow-hidden">
        {/* Channel List Sidebar */}
        {isChannelListVisible && (
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold">Channels</h2>
              <button
                onClick={() => setIsChannelListVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <ChannelList
              filters={{ members: { $in: [client.userID!] } }}
              sort={{ last_message_at: -1 }}
              Preview={(props) => (
                <div
                  onClick={() => setChannel(props.channel)}
                  className="cursor-pointer"
                >
                  <ChannelPreviewCallControls
                    channel={props.channel}
                    call={currentCall}
                  />
                </div>
              )}
            />
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <Channel channel={channel}>
            <Window>
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                {!isChannelListVisible && (
                  <button
                    onClick={() => setIsChannelListVisible(true)}
                    className="text-blue-500 hover:text-blue-700 mr-4"
                  >
                    ☰ Channels
                  </button>
                )}
                <ChannelHeader />
                {callId && (
                  <span className="text-sm text-gray-500">
                    Meeting: {callId}
                  </span>
                )}
              </div>
              <MessageList />
              <MessageInput />
            </Window>
          </Channel>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
