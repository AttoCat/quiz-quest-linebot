import { Hono } from "./deps.ts";
export const webhook = new Hono();

webhook.post("*", (c) => {
  const data = JSON.stringify(c);
  console.log(data);
  return c.json(data);
});
