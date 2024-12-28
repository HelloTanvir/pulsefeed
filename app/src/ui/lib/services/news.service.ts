import { NewsQueryParamsDto } from "../dto/news.dto";
import { News } from "../types/news.type";
import { BaseApiService } from "./base-api.service";

export interface NewsResponse {
  data: News[];
  total: number;
  limit: number;
  offset: number;
}

export class NewsService extends BaseApiService {
  async getArticles(query: NewsQueryParamsDto): Promise<NewsResponse> {
    const response = await this.handleResponse<NewsResponse>(
      this.authenticatedClient.get("/news", { params: query })
    );
    return response ?? { data: [], total: 0, limit: 0, offset: 0 };
  }

  async getSections(): Promise<string[]> {
    const response = await this.handleResponse<string[]>(
      this.authenticatedClient.get("/news/sections")
    );
    return response ?? [];
  }

  async getArticleById(articleId: string): Promise<News | null> {
    return this.handleResponse<News>(
      this.authenticatedClient.get(`/news/${articleId}`)
    );
  }

  async getSimilarArticles(articleId: string): Promise<NewsResponse> {
    const response = await this.handleResponse<NewsResponse>(
      this.authenticatedClient.get(`/news/${articleId}/similar`)
    );
    return response ?? { data: [], total: 0, limit: 0, offset: 0 };
  }

  async likeArticle(articleId: string): Promise<News | null> {
    return this.handleResponse<News>(
      this.authenticatedClient.patch(`/news/like/${articleId}`)
    );
  }

  async commentOnArticle(articleId: string): Promise<News | null> {
    return this.handleResponse<News>(
      this.authenticatedClient.patch(`/news/comment/${articleId}`)
    );
  }
}
