import { BullModule, BullRootModuleOptions } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        BullModule.forRootAsync({
            useFactory: (configService: ConfigService) => {
                const options: BullRootModuleOptions = {
                    connection: {
                        host: configService.getOrThrow('REDIS_HOST'),
                        port: configService.getOrThrow('REDIS_PORT'),
                    },
                };

                return options;
            },
            inject: [ConfigService],
        }),
    ],
})
export class BullMQModule {}
