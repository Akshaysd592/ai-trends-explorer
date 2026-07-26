import {configuration} from './configuration.js'


export class ConfigService{
    private readonly config = configuration();

    get app(){
        return this.config.app;
    }
}