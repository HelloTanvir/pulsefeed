import {
    Controller,
    Get,
    Param,
    Query,
    NotFoundException,
    ValidationPipe,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { NewsStorageService } from '../services/news-storage.service';
import { NewsQueryParamsDto } from '../dto/query-params.dto';
import { NewsArticleResponseDto, NewsArticlesResponseDto } from '../dto/news-response.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('News')
@Controller('news')
export class NewsController {
    constructor(private readonly newsStorageService: NewsStorageService) {}

    @Public()
    @Get()
    @HttpCode(HttpStatus.OK)
    async getArticles(
        @Query(new ValidationPipe({ transform: true })) queryParams: NewsQueryParamsDto
    ): Promise<NewsArticlesResponseDto> {
        return this.newsStorageService.findArticles(queryParams);
    }

    @Public()
    @Get('portals')
    @HttpCode(HttpStatus.OK)
    async getPortals(): Promise<string[]> {
        return this.newsStorageService.getPortals();
    }

    @Public()
    @Get('sections')
    @HttpCode(HttpStatus.OK)
    async getSections(): Promise<string[]> {
        return this.newsStorageService.getSections();
    }

    @Public()
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getArticleById(@Param('id') id: string): Promise<NewsArticleResponseDto> {
        const article = await this.newsStorageService.getArticleById(id);
        if (!article) {
            throw new NotFoundException(`Article with ID ${id} not found`);
        }
        return article;
    }
}
