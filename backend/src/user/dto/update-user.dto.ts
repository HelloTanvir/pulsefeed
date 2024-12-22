import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
    /** @example Tanvir */
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    name: string;

    /** @example test@test.com */
    @IsOptional()
    @IsNotEmpty()
    @IsEmail()
    email: string;
}
