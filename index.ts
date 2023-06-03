import { Hono, serve } from "./deps.ts";
import { webhook } from "./webhook.ts";
const app = new Hono();
app.get("*", (c) => c.text("Hello!"));
app.route("/api/webhook", webhook);

export default app;

serve(app.fetch);
