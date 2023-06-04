import { Hono } from "./deps.ts";
import { replyHintsMessage } from "./hints.ts";
import { hmac } from "./hmac.ts";
import { MessageEvent, Webhook } from "./types.ts";
export const webhook = new Hono();
const CHANNEL_SECRET = Deno.env.get("CHANNEL_SECRET");
const CHANNEL_ACCESS_TOKEN = Deno.env.get("CHANNEL_ACCESS_TOKEN");
const HINT_TIMETABLE = Deno.env.get("HINTS_TIMETABLE")!.split(" ");

webhook.post("*", async (c) => {
  const body = await c.req.json<Webhook>();
  const digest = await hmac(CHANNEL_SECRET!, JSON.stringify(body));
  const signature = c.req.header("x-line-signature");
  if (digest !== signature) {
    return c.text("Bad Request", 400);
  }
  const events = body.events;
  const messageEvents = events.filter((event) =>
    event.type === "message"
  ) as MessageEvent[];
  for (const messageEvent of messageEvents) {
    if (messageEvent.message.type !== "text") continue;
    if (messageEvent.message.text === "#ヒント") {
      await replyHintsMessage(
        (new Date()).toISOString(),
        CHANNEL_ACCESS_TOKEN!,
        messageEvent.replyToken,
        HINT_TIMETABLE,
      );
    }
  }
});
