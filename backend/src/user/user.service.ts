import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, QueryFailedError } from 'typeorm';
import { HashService } from '../common/services/hash.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { SubscribeToSectionDto } from './dto/subscribe-to-section.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly hashService: HashService
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const hashedPassword = await this.hashService.hashString(createUserDto.password);

        const user = new User({
            name: createUserDto.name,
            email: createUserDto.email,
            password: hashedPassword,
        });

        try {
            await this.entityManager.save(user);
        } catch (error) {
            if (error instanceof QueryFailedError) {
                if (
                    error.message?.includes(createUserDto.email) ||
                    error.driverError?.detail?.includes(createUserDto.email)
                ) {
                    throw new ForbiddenException({ email: 'email already exists' });
                }

                throw new ForbiddenException(error.driverError?.detail ?? 'user creation failed');
            }
        }

        return user;
    }

    async findOneUserById(userId: string): Promise<User> {
        const user = await this.entityManager.findOne(User, { where: { id: userId } });
        if (!user) {
            throw new ForbiddenException('user not found');
        }

        return user;
    }

    async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOneUserById(userId);

        if (updateUserDto.email) {
            user.email = updateUserDto.email;
        }

        if (updateUserDto.name) {
            user.name = updateUserDto.name;
        }

        await this.entityManager.save(user);

        return user;
    }

    async removeUser(userId: string): Promise<User> {
        const user = await this.findOneUserById(userId);
        await this.entityManager.remove(user);
        return user;
    }

    async subscribeToSection(
        userId: string,
        subscribeToSectionDto: SubscribeToSectionDto
    ): Promise<User> {
        const user = await this.findOneUserById(userId);

        const section = subscribeToSectionDto.name.toLowerCase();

        if (!user.subscribedSections.includes(section)) {
            user.subscribedSections.push(section);
            await this.entityManager.save(user);
        }

        return user;
    }
}
