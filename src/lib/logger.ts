type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  meta?: Record<string, unknown>;
}

function write(entry: LogEntry) {
  const line = JSON.stringify(entry);
  switch (entry.level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "debug":
      if (process.env.NODE_ENV === "development") console.debug(line);
      break;
    default:
      console.log(line);
  }
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>, context?: string) {
    write({ level: "debug", message, timestamp: new Date().toISOString(), context, meta });
  },
  info(message: string, meta?: Record<string, unknown>, context?: string) {
    write({ level: "info", message, timestamp: new Date().toISOString(), context, meta });
  },
  warn(message: string, meta?: Record<string, unknown>, context?: string) {
    write({ level: "warn", message, timestamp: new Date().toISOString(), context, meta });
  },
  error(message: string, meta?: Record<string, unknown>, context?: string) {
    write({ level: "error", message, timestamp: new Date().toISOString(), context, meta });
  },
};
