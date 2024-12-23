import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateBookmarkDto {
    /** @example 1 */
    @IsNotEmpty()
    @IsString()
    articleId: string;

    /** @example this is a test note */
    @IsOptional()
    @IsString()
    note?: string;
}

export class BookmarkResponseDto {
    /** @example 1 */
    id: string;
    article: {
        /** @example 1 */
        id: string;
        /** @example Article title */
        title: string;
        /** @example Article content */
        url: string;
        /** @example Article author */
        portal: string;
        /** @example Article section */
        section: string;
        /** @example 2021-01-01T00:00:00.000Z */
        publishedAt: Date;
    };
    /** @example 2021-01-01T00:00:00.000Z */
    createdAt: Date;
    /** @example this is a test note */
    note?: string;
}
