// "base64url(JSON).base64url(HMAC-SHA256)" 형식. 서버가 발급한 값이 바뀌지 않았는지만 보장하고 내용을 숨기지 않는다.
const encoder = new TextEncoder();

const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function fromBase64Url(text: string) {
  const binary = atob(text.replaceAll("-", "+").replaceAll("_", "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function importKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signToken(payload: unknown, secret: string) {
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await importKey(secret), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

// 서명이 맞으면 payload를, 형식이 틀리거나 서명이 다르면 null을 돌려준다.
export async function verifyToken(token: string, secret: string): Promise<unknown> {
  const [body, signature, ...rest] = token.split(".");
  if (!body || !signature || rest.length > 0) {
    return null;
  }
  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await importKey(secret),
      fromBase64Url(signature),
      encoder.encode(body),
    );
    return valid ? JSON.parse(decoder.decode(fromBase64Url(body))) : null;
  } catch {
    return null;
  }
}
