import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HashService } from '../common/services/hash.service';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SubscriptionEntity } from './entities/subscription.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, SubscriptionEntity])],
    controllers: [UserController],
    providers: [UserService, HashService],
    exports: [UserService],
})
export class UserModule {}
