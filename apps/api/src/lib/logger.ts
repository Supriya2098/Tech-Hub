/* eslint-disable no-console */
type LogMeta = Record<string, unknown>;

function format(level: string, message: string, meta?: LogMeta) {
  const timestamp = new Date().toISOString();
  return meta ? `[${timestamp}] ${level}: ${message} ${JSON.stringify(meta)}` : `[${timestamp}] ${level}: ${message}`;
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    console.log(format('INFO', message, meta));
  },
  warn(message: string, meta?: LogMeta) {
    console.warn(format('WARN', message, meta));
  },
  error(message: string, meta?: LogMeta) {
    console.error(format('ERROR', message, meta));
  },
};
