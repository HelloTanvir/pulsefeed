import { Controller, Get, Param, Query, NotFoundException, ValidationPipe } from '@nestjs/common';
import { NewsStorageService } from './services/news-storage.service';
import { NewsQueryParamsDto } from './dto/query-params.dto';
import { NewsArticleResponseDto, NewsArticlesResponseDto } from './dto/news-response.dto';

@Controller('api/news')
export class NewsController {
    constructor(private readonly newsStorageService: NewsStorageService) {}

    @Get()
    async getArticles(
        @Query(new ValidationPipe({ transform: true })) queryParams: NewsQueryParamsDto
    ): Promise<NewsArticlesResponseDto> {
        return this.newsStorageService.findArticles(queryParams);
    }

    @Get('portals')
    async getPortals(): Promise<string[]> {
        return this.newsStorageService.getPortals();
    }

    @Get('sections')
    async getSections(): Promise<string[]> {
        return this.newsStorageService.getSections();
    }

    @Get(':id')
    async getArticleById(@Param('id') id: string): Promise<NewsArticleResponseDto> {
        const article = await this.newsStorageService.getArticleById(id);
        if (!article) {
            throw new NotFoundException(`Article with ID ${id} not found`);
        }
        return article;
    }
}
