import { Hono } from "./deps.ts";
export const webhook = new Hono();

webhook.post("*", (c) => {
  const data = JSON.stringify(c);
  console.log(data);
  console.log(Deno.env.get("HINTS")!.split(" ")[0]);
  return c.json(data);
});
