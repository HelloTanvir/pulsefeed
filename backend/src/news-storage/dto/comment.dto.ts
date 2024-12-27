import { IsNotEmpty, IsString } from 'class-validator';

export class CommentDto {
    /** @example very informative news */
    @IsNotEmpty()
    @IsString()
    content: string;
}
