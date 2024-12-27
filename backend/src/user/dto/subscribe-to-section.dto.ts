import { IsNotEmpty, IsString } from 'class-validator';

export class SubscribeToSectionDto {
    /** @example Sports */
    @IsNotEmpty()
    @IsString()
    name: string;
}
