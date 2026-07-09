const HTML_TAG_RE = /<[^>]*>/g;
const SCRIPT_BLOCK_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_HANDLER_RE = /\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_PROTOCOL_RE = /javascript:/gi;

/** Strip HTML tags — safe on Node.js serverless (no jsdom / ESM deps). */
export function sanitizeText(input: string): string {
  return input.replace(HTML_TAG_RE, "").trim();
}

/** Basic HTML sanitization for trusted admin content — server-safe. */
export function sanitizeHtml(dirty: string): string {
  return dirty
    .replace(SCRIPT_BLOCK_RE, "")
    .replace(EVENT_HANDLER_RE, "")
    .replace(JS_PROTOCOL_RE, "");
}
