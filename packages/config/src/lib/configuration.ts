import { envSchema } from "./env.schema.js";


export function configuration(){
    const env = envSchema.parse(process.env);

    return{
        app:{
            nodeEnv: env.NODE_ENV,
            port: env.PORT
        },
    };

}