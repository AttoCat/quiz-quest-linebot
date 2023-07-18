import { Hono } from "./deps.ts";
import { composeHintMessage, getAvailableHints } from "./hints.ts";
import { hmac } from "./hmac.ts";
import { isQuestionsAvailable } from "./questions.ts";
import { replyMessage } from "./reply.ts";
import { MessageEvent, Webhook, WebhookEvent } from "./types.ts";

const CHANNEL_SECRET = Deno.env.get("CHANNEL_SECRET");
const CHANNEL_ACCESS_TOKEN = Deno.env.get("CHANNEL_ACCESS_TOKEN");
const HINT_TIMETABLE = Deno.env.get("HINTS_TIMETABLE")!.split(" ");
const QUESTION_OPEN_TIME = Deno.env.get("QUESTION_OPEN");
const FINAL_ANSWERS = Deno.env.get("FINAL_ANSWERS")!.split(" ");
const CELEBRATE_IMAGE = Deno.env.get("CELEBRATE_IMAGE");
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
      continue;
    }
    if (messageEvent.message.text === "#問題") {
      if (!isQuestionsAvailable(currentDatetime, QUESTION_OPEN_TIME!)) continue;
      await replyMessage(CHANNEL_ACCESS_TOKEN!, messageEvent.replyToken, [
        JSON.parse(await Deno.readTextFile("./templates/question.json")),
      ]);
    }
    if (
      messageEvent.message.text.includes(FINAL_ANSWERS![0]) &&
      messageEvent.message.text.includes(FINAL_ANSWERS![1])
    ) {
      const celebrateMessage = {
        type: "image",
        originalContentUrl: CELEBRATE_IMAGE!,
        previewImageUrl: CELEBRATE_IMAGE!,
      };
      await replyMessage(
        CHANNEL_ACCESS_TOKEN!,
        messageEvent.replyToken,
        [celebrateMessage],
      );
    }
    if (messageEvent.message.text === "#解答・解説") {
      await replyMessage(CHANNEL_ACCESS_TOKEN!, messageEvent.replyToken, [
        JSON.parse(await Deno.readTextFile("./templates/answer.json")),
      ]);
    }
  }
});
