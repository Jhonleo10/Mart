type UploadLogContext = Record<string, string | number | boolean | undefined>;

function prefix(scope: string) {
  return `[upload:${scope}]`;
}

/** Safe structured logging — never log tokens or file contents. */
export function uploadLog(
  scope: string,
  level: "debug" | "info" | "warn" | "error",
  message: string,
  context?: UploadLogContext,
) {
  const payload = context ? ` ${JSON.stringify(context)}` : "";
  const line = `${prefix(scope)} ${message}${payload}`;

  if (level === "debug" && process.env.NODE_ENV !== "development") return;

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else if (level === "info") console.info(line);
  else console.debug(line);
}
