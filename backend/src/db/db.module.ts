import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => {
                const options: DataSourceOptions = {
                    type: 'postgres',
                    host: configService.getOrThrow('POSTGRES_HOST'),
                    port: configService.getOrThrow('POSTGRES_PORT'),
                    database: configService.getOrThrow('POSTGRES_DB'),
                    username: configService.getOrThrow('POSTGRES_USER'),
                    password: configService.getOrThrow('POSTGRES_PASSWORD'),
                };

                // const isDebug = configService.get('DEBUG') === 'true';

                return {
                    ...options,
                    autoLoadEntities: true,
                    // synchronize: isDebug,
                };
            },
            inject: [ConfigService],
        }),
    ],
})
export class DBModule {}
