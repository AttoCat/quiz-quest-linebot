import { Hono } from "./deps.ts";
import { hmac } from "./hmac.ts";
import { MessageEvent, Webhook } from "./types.ts";
export const webhook = new Hono();
const CHANNEL_SECRET = Deno.env.get("CHANNEL_SECRET");

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
    if (messageEvent.message.text !== "#ヒント") continue;
    console.log(Deno.env.get("HINTS")!.split(" ")[0]);
    console.log("Get right request");
  }
});
