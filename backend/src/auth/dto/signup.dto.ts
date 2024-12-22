import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { PASSWORD_MIN_LENGTH } from '../../common/constants/auth.constant';

export class SignUpDto {
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

    /** @example 12345678 */
    @IsNotEmpty()
    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH)
    confirmPassword: string;
}
