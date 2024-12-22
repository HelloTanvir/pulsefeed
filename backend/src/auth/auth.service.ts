import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, QueryFailedError } from 'typeorm';
import { HashService } from '../common/services/hash.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignUpDto } from './dto/signup.dto';
import { Auth } from './entities/auth.entity';
import { Tokens } from './types/token.type';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly hashService: HashService,
        @InjectEntityManager()
        private readonly entityManager: EntityManager
    ) {}

    async signup(signUpDto: SignUpDto): Promise<Tokens> {
        if (signUpDto.password !== signUpDto.confirmPassword) {
            throw new ForbiddenException({ confirmPassword: 'passwords do not match' });
        }

        const user = await this.userService.createUser({
            name: signUpDto.name,
            email: signUpDto.email,
            password: signUpDto.password,
            isAdmin: false,
        });

        const tokens = await this.getTokens(user.id);
        const hashedRefreshToken = await this.hashService.hashString(tokens.refresh_token);

        const auth = new Auth({ user, refreshToken: hashedRefreshToken });

        try {
            await this.entityManager.save(auth);
        } catch (error) {
            if (error instanceof QueryFailedError) {
                throw new ForbiddenException(error.driverError?.detail ?? 'signup failed');
            }
        }

        return tokens;
    }

    async login(loginDto: LoginDto): Promise<Tokens> {
        const auth = await this.entityManager.findOne(Auth, {
            where: { user: { email: loginDto.email } },
            select: {
                user: {
                    id: true,
                    password: true,
                },
            },
            relations: { user: true },
        });
        if (!auth) {
            throw new ForbiddenException('invalid credentials');
        }

        const { user } = auth;

        const isPasswordMatch = await this.hashService.compareWithHash(
            loginDto.password,
            user.password
        );
        if (!isPasswordMatch) {
            throw new ForbiddenException('invalid credentials');
        }

        const expiresIn = loginDto.remember ? '30d' : '15m';
        const tokens = await this.getTokens(user.id, expiresIn);
        const hashedRefreshToken = await this.hashService.hashString(tokens.refresh_token);

        auth.refreshToken = hashedRefreshToken;
        await this.entityManager.save(auth);

        return tokens;
    }

    async logout(userId: string): Promise<Tokens> {
        await this.entityManager.update(Auth, { user: { id: userId } }, { refreshToken: null });

        return {
            access_token: '',
            refresh_token: '',
        };
    }

    async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<Tokens> {
        const extractedData = this.extractDataFromToken(
            refreshTokenDto.refreshToken,
            'refresh'
        ) as { userId: string };

        const userId = extractedData.userId;

        const auth = await this.entityManager.findOne(Auth, {
            where: { user: { id: userId } },
            relations: { user: true },
        });
        if (!auth?.refreshToken) {
            throw new ForbiddenException('invalid credentials');
        }

        const isRefreshTokenMatch = await this.hashService.compareWithHash(
            refreshTokenDto.refreshToken,
            auth.refreshToken
        );
        if (!isRefreshTokenMatch) {
            throw new ForbiddenException('invalid refresh token');
        }

        const tokens = await this.getTokens(userId);
        const hashedRefreshToken = await this.hashService.hashString(tokens.refresh_token);

        auth.refreshToken = hashedRefreshToken;
        await this.entityManager.save(auth);

        return tokens;
    }

    async findByUserId(userId: string): Promise<Auth> {
        const auth = await this.entityManager.findOne(Auth, {
            where: { user: { id: userId } },
            relations: { user: true },
            select: {
                id: true,
                refreshToken: true,
                user: {
                    id: true,
                    name: true,
                    email: true,
                    isAdmin: true,
                },
            },
        });

        return auth;
    }

    private async getTokens(userId: string, expiresIn?: string): Promise<Tokens> {
        const [at, rt] = await Promise.all([
            // access token
            this.jwtService.signAsync(
                {
                    userId,
                },
                {
                    secret: this.configService.getOrThrow('AT_SECRET_KEY'),
                    expiresIn: expiresIn || '15m', // 15 minutes
                }
            ),

            // refresh token
            this.jwtService.signAsync(
                {
                    userId,
                },
                {
                    secret: this.configService.getOrThrow('RT_SECRET_KEY'),
                    expiresIn: '7d', // 1 week
                }
            ),
        ]);

        return {
            access_token: at,
            refresh_token: rt,
        };
    }

    private extractDataFromToken(token: string, type: 'access' | 'refresh'): any {
        try {
            const data = this.jwtService.verify(token, {
                secret: this.configService.getOrThrow(
                    type === 'access' ? 'AT_SECRET_KEY' : 'RT_SECRET_KEY'
                ),
            });
            return data;
        } catch (error) {
            throw new ForbiddenException('invalid token');
        }
    }
}
