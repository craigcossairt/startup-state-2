const MAX_TEXT_CHARS = 12_000;

export function normalizeWebsiteUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isPublicHttpUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:/i.test(trimmed)) {
    return false;
  }
  try {
    const url = new URL(normalizeWebsiteUrl(trimmed));
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (url.username || url.password) return false;
    return !isPrivateHostname(url.hostname);
  } catch {
    return false;
  }
}

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "::1" ||
    host === "0.0.0.0"
  ) {
    return true;
  }
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return false;
  const octets = ipv4.slice(1).map(Number);
  if (octets.some((part) => part > 255)) return true;
  const [a, b] = octets;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

export function extractWebsiteText(html: string): string {
  const withoutChrome = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ");

  const title = decodeEntities(
    withoutChrome.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "",
  );
  const meta =
    attr(withoutChrome, "meta", "name", "description", "content") ||
    attr(withoutChrome, "meta", "property", "og:description", "content");

  const body = decodeEntities(
    withoutChrome
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );

  const parts = [title, meta, body].map((part) => part.trim()).filter(Boolean);
  return parts.join("\n").slice(0, MAX_TEXT_CHARS);
}

function attr(
  html: string,
  tag: string,
  keyName: string,
  keyValue: string,
  attrName: string,
): string {
  const regex = new RegExp(
    `<${tag}\\s[^>]*${keyName}=["']${keyValue}["'][^>]*>`,
    "i",
  );
  const tagMatch = html.match(regex)?.[0];
  if (!tagMatch) {
    const swapped = html.match(
      new RegExp(
        `<${tag}\\s[^>]*${attrName}=["']([^"']+)["'][^>]*${keyName}=["']${keyValue}["'][^>]*>`,
        "i",
      ),
    );
    return decodeEntities(swapped?.[1] ?? "");
  }
  return decodeEntities(tagMatch.match(new RegExp(`${attrName}=["']([^"']+)["']`, "i"))?.[1] ?? "");
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

const MAX_HTML_BYTES = 1_000_000;

export async function fetchWebsiteText(rawUrl: string): Promise<{
  url: string;
  title: string;
  text: string;
}> {
  const url = normalizeWebsiteUrl(rawUrl);
  if (!isPublicHttpUrl(url)) {
    throw new Error("Enter a public http or https website URL.");
  }
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent":
        "StartupState2/0.1 (https://startup-state-2.vercel.app)",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(8000),
  });
  const finalUrl = response.url || url;
  if (!isPublicHttpUrl(finalUrl)) {
    throw new Error("That website redirected to an address we cannot read.");
  }
  if (!response.ok) {
    throw new Error(`Could not read that website (${response.status}).`);
  }
  const buffer = new Uint8Array(await response.arrayBuffer());
  const html = new TextDecoder("utf-8").decode(buffer.slice(0, MAX_HTML_BYTES));
  const text = extractWebsiteText(html);
  if (!text) {
    throw new Error("That website did not return readable text.");
  }
  const title = text.split("\n")[0] ?? "";
  return { url: finalUrl, title, text };
}
