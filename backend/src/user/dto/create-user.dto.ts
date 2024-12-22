import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { PASSWORD_MIN_LENGTH } from '../../common/constants/auth.constant';

export class CreateUserDto {
    /** @example Tanvir */
    @IsNotEmpty()
    @IsString()
    name: string;

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
    isAdmin: boolean = false;
}
