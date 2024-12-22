import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
    /** @example hwughffuiewehdqiwhduguiwegwieue */
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}
