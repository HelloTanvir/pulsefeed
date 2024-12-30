import { IsNotEmpty, IsString } from 'class-validator';

export class AddArticleDto {
    /** @example Article title */
    @IsNotEmpty()
    @IsString()
    title: string;

    /** @example Article content */
    @IsNotEmpty()
    @IsString()
    content: string;

    /** @example Article section */
    @IsNotEmpty()
    @IsString()
    section: string;

    /** @example Article image url */
    @IsNotEmpty()
    @IsString()
    imageUrl?: string;
}
