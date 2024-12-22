import {
    Body,
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignUpDto } from './dto/signup.dto';
import { RtGuard } from './guards/refresh-token.guard';
import { Tokens } from './types/token.type';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    signup(@Body() signUpDto: SignUpDto): Promise<Tokens> {
        return this.authService.signup(signUpDto);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() loginDto: LoginDto): Promise<Tokens> {
        return this.authService.login(loginDto);
    }

    @Delete('logout')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    logout(@GetCurrentUser('userId') id: string): Promise<Tokens> {
        return this.authService.logout(id);
    }

    @Public()
    @UseGuards(RtGuard)
    @Patch('refresh-token')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<Tokens> {
        return this.authService.refreshTokens(refreshTokenDto);
    }
}
