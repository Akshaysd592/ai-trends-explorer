import { Controller } from '@nestjs/common';
import { HealthService } from './health.service';
import { Get } from '@nestjs/common';

@Controller('health')
export class HealthController {

    constructor(private readonly healthService: HealthService){}

    @Get()
    getHealth(){
         return {
            status:"Ok",
            service: this.healthService.getService(),
            version: "0.0.1",
         }
    }



}
