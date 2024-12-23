import { IsOptional, IsString, IsDate, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class NewsQueryParamsDto {
    /** @example Any text */
    @IsOptional()
    @IsString()
    search?: string;

    /** @example Article portal */
    @IsOptional()
    @IsString()
    portal?: string;

    /** @example Article section */
    @IsOptional()
    @IsString()
    section?: string;

    /** @example 2021-01-01T00:00:00.000Z */
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    fromDate?: Date;

    /** @example 2021-01-01T00:00:00.000Z */
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    toDate?: Date;

    /** @example 20 */
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    /** @example 0 */
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number = 0;

    /** @example publishedAt */
    @IsOptional()
    @IsString()
    sortBy?: 'publishedAt' | 'scrapedAt' | 'title' = 'publishedAt';

    /** @example DESC */
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
