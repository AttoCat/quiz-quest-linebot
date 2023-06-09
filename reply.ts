import { BaseMessage } from "./types.ts";

export const replyMessage = async (
  channelAccessToken: string,
  replyToken: string,
  body: BaseMessage[],
) => {
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    body: JSON.stringify({ replyToken: replyToken, messages: body }),
    headers: {
      "Authorization": `Bearer ${channelAccessToken}`,
      "Content-Type": "application/json",
    },
  });
};
