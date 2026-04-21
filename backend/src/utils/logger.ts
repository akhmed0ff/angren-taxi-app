/**
 * Минимальный структурированный логгер без внешних зависимостей.
 *
 * Production: JSON-строки в stdout/stderr — готовы к отправке в любой агрегатор
 *             (Loki, CloudWatch, Datadog и т.д.) без дополнительной настройки.
 * Development: человекочитаемый формат с метками уровня.
 */

const isDev = (process.env.NODE_ENV ?? 'development') === 'development';

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (isDev) {
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
    const metaStr = meta ? ' ' + JSON.stringify(meta) : '';
    const out = `${prefix} ${message}${metaStr}`;
    level === 'error' ? console.error(out) : console.log(out);
  } else {
    // JSON в одну строку — каждая строка парсится независимо
    const stream = level === 'error' ? process.stderr : process.stdout;
    stream.write(JSON.stringify(entry) + '\n');
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write('error', message, meta),
};
