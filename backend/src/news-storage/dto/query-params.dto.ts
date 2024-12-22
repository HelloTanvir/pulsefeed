import { IsOptional, IsString, IsDate, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class NewsQueryParamsDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    portal?: string;

    @IsOptional()
    @IsString()
    section?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    fromDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    toDate?: Date;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number = 0;

    @IsOptional()
    @IsString()
    sortBy?: 'publishedAt' | 'scrapedAt' | 'title' = 'publishedAt';

    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
