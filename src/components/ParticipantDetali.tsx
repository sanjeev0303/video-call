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
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LayoutList, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import EndCallButton from "./EndCallButton";
import Loader from "./Loader";
import Image from "next/image";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get("personal");

  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipents, setShowParticipents] = useState(false);

  const { useCallCallingState } = useCallStateHooks()

  const callingState = useCallCallingState();

  const router = useRouter()

  if (callingState !== CallingState.JOINED) return <Loader />;


  const CustomParticipantViewUI = () => {
    const { participant } = useParticipantViewContext();
    return (
      <div
        className=""
        style={{ position: "absolute", width: "100%", height: "100%" }}
      >
        <div className="bg-white w-full h-9 px-3 py-1 flex justify-between text-black">
          <div>
            <Image
              src="/icons/logo.svg"
              alt="logo"
              width={30}
              height={30}
              className="rounded-full"
            />
          </div>
          <div>
            <h1 className="uppercase">{participant.name}</h1>
          </div>
          <div>
            <h1 className="text-lg font-semibold">Narayani Award</h1>
          </div>
        </div>
      </div>
    );
  };




  const CallLayout = () => {
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;
        break;

      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />;

      default:
        return <SpeakerLayout participantsBarPosition="right" />;
        break;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative top-0 flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] ">
        <CallLayout />
        </div>
        <div
          className={cn("h-[calc(100vh-86px)] hidden ml-2  w-[300px] border-4 border-red-400", {
            "show-block": showParticipents,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipents(false)} />
        </div>

      </div>

      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 flex-wrap">
        <CallControls onLeave={() => {
          router.push("/")
        }} />

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent
            className="border-dark-1 bg-bark-1
           text-white"
          >
            {["Grid", "Speaker-Left", "Speaker-Right"].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setLayout(item.toLowerCase() as CallLayoutType);
                  }}
                >
                  {item}
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
        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;
