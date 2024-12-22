import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { PASSWORD_MIN_LENGTH } from '../../common/constants/auth.constant';

export class LoginDto {
    /** @example test@test.com */
    @IsNotEmpty()
    @IsEmail()
    email: string;

    /** @example 12345678 */
    @IsNotEmpty()
    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH)
    password: string;

    @IsOptional()
    @IsNotEmpty()
    @IsBoolean()
    remember: boolean = false;
}
