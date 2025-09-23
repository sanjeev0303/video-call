"use server";

import { currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export const tokenProvider = async () => {
    // console.log("Checkpoint 1: Starting tokenProvider function");

    const user = await currentUser();
    // console.log("Checkpoint 2: Retrieved current user", user);

    if (!user) {
        // console.error("Checkpoint 3: User does not exist!");
        throw new Error("User does not exist!");
    }

    if (!apiKey) {
        console.error("Checkpoint 4: No API key");
        throw new Error("No API key");
    }

    if (!apiSecret) {
        // console.error("Checkpoint 5: No API secret");
        throw new Error("No API secret");
    }

    // console.log("Checkpoint 6: API key and secret are available");

    const client = new StreamClient(apiKey, apiSecret);
    // console.log("Checkpoint 7: StreamClient initialized");

    const exp = Math.round(new Date().getTime() / 1000) + 60 * 60;
    const issued = Math.floor(Date.now() / 1000) - 60;

    // console.log("Checkpoint 8: Token expiration and issued times calculated", { exp, issued });

    const token = client.createToken(user.id, exp, issued);
    // console.log("Checkpoint 9: Token created", token);

    return token;
};
