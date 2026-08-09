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

  getGithubApiUrl(): string {
    return this.config.github.apiUrl;
  }

  getGithubToken(): string | undefined {
    return this.config.github.token;
  }

  getHuggingFaceApiUrl(): string {
    return this.config.huggingface.apiUrl;
  }

  getHuggingFaceToken(): string | undefined {
    return this.config.huggingface.token;
  }
}
