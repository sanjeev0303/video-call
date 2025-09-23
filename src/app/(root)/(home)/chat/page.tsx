"use client";

import ChatComponent from "@/components/ChatComponent";

const ChatPage = () => {
  return (
    <section className="flex size-full flex-col gap-5 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chat</h1>
      </div>

      <div className="flex-1 bg-dark-1 rounded-lg overflow-hidden">
        <ChatComponent />
      </div>
    </section>
  );
};

export default ChatPage;
