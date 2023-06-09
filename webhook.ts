import { Hono } from "./deps.ts";
import { composeHintMessage, getAvailableHints } from "./hints.ts";
import { hmac } from "./hmac.ts";
import { replyMessage } from "./reply.ts";
import { MessageEvent, Webhook, WebhookEvent } from "./types.ts";

const CHANNEL_SECRET = Deno.env.get("CHANNEL_SECRET");
const CHANNEL_ACCESS_TOKEN = Deno.env.get("CHANNEL_ACCESS_TOKEN");
const HINT_TIMETABLE = Deno.env.get("HINTS_TIMETABLE")!.split(" ");

export const webhook = new Hono();

const isMessageEvent = (event: WebhookEvent): event is MessageEvent =>
  event.type === "message";

webhook.post("*", async (c) => {
  const body = await c.req.json<Webhook>();
  const digest = await hmac(CHANNEL_SECRET!, JSON.stringify(body));
  const signature = c.req.header("x-line-signature");
  const currentDatetime = (new Date()).toISOString();
  if (digest !== signature) {
    return c.text("Bad Request", 400);
  }
  const events = body.events;
  const messageEvents = events.filter(isMessageEvent);
  for (const messageEvent of messageEvents) {
    if (messageEvent.message.type !== "text") continue;
    if (messageEvent.message.text === "#ヒント") {
      const [availableHints, nextMilliSeconds] = getAvailableHints(
        currentDatetime,
        HINT_TIMETABLE,
      );
      const hintMessage = await composeHintMessage(
        availableHints,
        nextMilliSeconds,
      );
      await replyMessage(
        CHANNEL_ACCESS_TOKEN!,
        messageEvent.replyToken,
        [hintMessage],
      );
    }
  }
});
