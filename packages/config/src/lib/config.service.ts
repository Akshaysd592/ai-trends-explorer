import { configuration } from './configuration.js'


export class ConfigService {
    private readonly config = configuration();

    getConfig() {
        return this.config;
    }
}