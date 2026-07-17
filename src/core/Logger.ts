import Homey from 'homey';

export default class Logger {
  constructor(private readonly app: Homey.App) {}

  info(message: string): void {
    this.app.log(`[ModernForms] ${message}`);
  }

  warn(message: string): void {
    this.app.log(`[ModernForms][WARN] ${message}`);
  }

  error(message: string, error?: unknown): void {
    this.app.error(`[ModernForms][ERROR] ${message}`, error);
  }

  debug(message: string): void {
    this.app.log(`[ModernForms] ${message}`);
  }
}
