import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HashService } from '../common/services/hash.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { RtStrategy } from './strategies/refresh-token.strategy';
import { AtStrategy } from './strategies/access-token.strategy';

@Module({
    imports: [JwtModule.register({}), TypeOrmModule.forFeature([Auth]), UserModule],
    controllers: [AuthController],
    providers: [AuthService, HashService, AtStrategy, RtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
