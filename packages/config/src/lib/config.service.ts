import { configuration } from './configuration.js';

export class ConfigService {
  private readonly config = configuration();

  getConfig() {
    return this.config;
  }

  /**
   * Returns database configuration WITHOUT the password.
   * Use this for safe logging and debugging.
   */
  getDatabaseConfig() {
    const db = this.config.database;
    return {
      host: db.host,
      port: db.port,
      username: db.username,
      name: db.name,
    };
  }
}
