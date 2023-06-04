const encoder = new TextEncoder();
const algorithm = { name: "HMAC", hash: "SHA-256" };
export const hmac = async (secret: string, body: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    algorithm,
    false,
    ["sign", "verify"],
  );
  const signature = await crypto.subtle.sign(
    algorithm.name,
    key,
    encoder.encode(body),
  );
  const digest = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return digest;
};
