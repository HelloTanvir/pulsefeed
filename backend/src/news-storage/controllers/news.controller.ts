import {
    Controller,
    Get,
    Param,
    Query,
    ValidationPipe,
    HttpStatus,
    HttpCode,
    Body,
    Patch,
    Post,
} from '@nestjs/common';
import { NewsStorageService } from '../services/news-storage.service';
import { NewsQueryParamsDto } from '../dto/query-params.dto';
import { NewsArticleResponseDto, NewsArticlesResponseDto } from '../dto/news-response.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { CommentDto } from '../dto/comment.dto';
import { AddArticleDto } from '../dto/add-article.dto';

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

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    async addArticle(
        @GetCurrentUser('userId') userId: string,
        @Body() articleDto: AddArticleDto
    ): Promise<NewsArticleResponseDto> {
        return this.newsStorageService.addArticle(userId, articleDto);
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
        return this.newsStorageService.getArticleById(id);
    }

    @Public()
    @Get(':id/similar')
    @HttpCode(HttpStatus.OK)
    async getSimilarArticles(@Param('id') id: string): Promise<NewsArticlesResponseDto> {
        return this.newsStorageService.getSimilarArticles(id);
    }

    @Patch('like/:id')
    @HttpCode(HttpStatus.OK)
    async likeArticle(
        @Param('id') id: string,
        @GetCurrentUser('userId') userId: string
    ): Promise<NewsArticleResponseDto> {
        return this.newsStorageService.likeArticle(id, userId);
    }

    @Patch('comment/:id')
    @HttpCode(HttpStatus.OK)
    async commentOnArticle(
        @Param('id') id: string,
        @GetCurrentUser('userId') userId: string,
        @Body() commentDto: CommentDto
    ): Promise<NewsArticleResponseDto> {
        return this.newsStorageService.commentOnArticle(id, userId, commentDto);
    }
}
