"use client";

import { useEffect } from "react";
import {
  CallingState,
  useCalls,
  useCallStateHooks,
  Call,
} from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { Phone, PhoneOff } from "lucide-react";

const RingCallHandler = () => {
  const calls = useCalls();
  const router = useRouter();

  // Get all ringing calls
  const ringingCalls = calls.filter(call =>
    call.state.callingState === CallingState.RINGING
  );

  useEffect(() => {
    // Play a notification sound for incoming calls
    if (ringingCalls.length > 0) {
      // You could add audio notification here
      console.log("Incoming call detected");
    }
  }, [ringingCalls.length]);

  if (ringingCalls.length === 0) return null;

  return (
    <>
      {ringingCalls.map((call) => (
        <IncomingCallModal key={call.id} call={call} />
      ))}
    </>
  );
};

const IncomingCallModal = ({ call }: { call: Call }) => {
  const router = useRouter();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.RINGING) return null;

  const acceptCall = async () => {
    try {
      await call.join();
      // Navigate to the meeting room
      router.push(`/meeting/${call.id}`);
    } catch (error) {
      console.error("Failed to accept call:", error);
    }
  };

  const rejectCall = async () => {
    try {
      await call.reject();
    } catch (error) {
      console.error("Failed to reject call:", error);
    }
  };

  const caller = call.state.createdBy;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
        {/* Caller Info */}
        <div className="mb-6">
          {caller?.image && (
            <img
              src={caller.image}
              alt={caller.name || "Caller"}
              className="w-20 h-20 rounded-full mx-auto mb-4"
            />
          )}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Incoming Call
          </h2>
          <p className="text-gray-600">
            {caller?.name || "Unknown User"} is calling you
          </p>
        </div>

        {/* Call Actions */}
        <div className="flex justify-center space-x-6">
          <button
            onClick={rejectCall}
            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
          <button
            onClick={acceptCall}
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full transition-colors"
          >
            <Phone className="w-6 h-6" />
          </button>
        </div>

        {/* Call details */}
        <div className="mt-6 text-sm text-gray-500">
          <p>Call ID: {call.id}</p>
          {call.state.createdAt && (
            <p>Started: {new Date(call.state.createdAt).toLocaleTimeString()}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RingCallHandler;
