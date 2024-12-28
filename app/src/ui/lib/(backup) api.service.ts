import Axios, { AxiosInstance } from "axios";
import { LoginDto, SignUpDto, UpdateUserDto } from "./dto/auth.dto";
import { User } from "./types/user.type";
import { SubscribeToSectionDto } from "./dto/subscribe.dto";
import { News } from "./types/news.type";
import { NewsQueryParamsDto } from "./dto/news.dto";
import { Bookmark } from "./types/bookmark.type";
import { BookmarkDto } from "./dto/bookmark.dto";
import { Notification } from "./types/notification.type";

export class APIService {
  private readonly axiosWithAuth: AxiosInstance;
  private readonly axiosWithoutAuth: AxiosInstance;
  private readonly API_URL = import.meta.env.VITE_API_BASE_URL;

  constructor() {
    this.axiosWithoutAuth = Axios.create({
      baseURL: `${this.API_URL}`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.axiosWithAuth = Axios.create({
      baseURL: `${this.API_URL}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
    });

    this.axiosWithAuth.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const { data } = await this.axiosWithoutAuth.patch(
            "/auth/refresh-token",
            {
              refresh_token: localStorage.getItem("refresh_token"),
            }
          );

          if (data) {
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);

            this.axiosWithAuth.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;

            return this.axiosWithAuth(originalRequest);
          }
        }

        return Promise.reject(error as Error);
      }
    );
  }

  async signup(dto: SignUpDto): Promise<{ success: boolean }> {
    const res = await this.axiosWithoutAuth.post("/auth/signup", dto);

    console.log(res.data);

    if (res.status !== 201) {
      return { success: false };
    }

    const { access_token, refresh_token } = res.data;
    this.storeToken(access_token, refresh_token);

    return { success: true };
  }

  async login(dto: LoginDto): Promise<{ success: boolean }> {
    const res = await this.axiosWithoutAuth.post("/auth/login", dto);

    if (res.status !== 200) {
      return { success: false };
    }

    const { access_token, refresh_token } = res.data;
    this.storeToken(access_token, refresh_token);

    return { success: true };
  }

  private storeToken(access_token: string, refresh_token: string) {
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
  }

  async logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    await this.axiosWithAuth.delete("/auth/logout");
  }

  async getCurrentUser(): Promise<User | null> {
    const res = await this.axiosWithAuth.get("/user/current-user");

    if (res.status !== 200) {
      return null;
    }

    return res.data;
  }

  async updateUser(userId: string, dto: UpdateUserDto): Promise<User | null> {
    const res = await this.axiosWithAuth.patch(`/user/${userId}`, dto);

    if (res.status !== 200) {
      return null;
    }

    return res.data;
  }

  async subscribeToSection(dto: SubscribeToSectionDto): Promise<User | null> {
    const res = await this.axiosWithAuth.patch(
      "/user/subscribe-to-section",
      dto
    );

    if (res.status !== 200) {
      return null;
    }

    return res.data;
  }

  async getArticles(query: NewsQueryParamsDto): Promise<{
    data: News[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const res = await this.axiosWithAuth.get("/news", {
      params: query,
    });

    if (res.status !== 200) {
      return { data: [], total: 0, limit: 0, offset: 0 };
    }

    return res.data;
  }

  async getSections(): Promise<string[]> {
    const res = await this.axiosWithAuth.get("/news/sections");

    if (res.status !== 200) {
      return [];
    }

    return res.data;
  }

  async getArticleById(articleId: string): Promise<News | null> {
    const res = await this.axiosWithAuth.get(`/news/${articleId}`);

    if (res.status !== 200) {
      return null;
    }

    return res.data;
  }

  async getSimilarArticles(articleId: string): Promise<{
    data: News[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const res = await this.axiosWithAuth.get(`/news/${articleId}/similar`);

    if (res.status !== 200) {
      return { data: [], total: 0, limit: 0, offset: 0 };
    }

    return res.data;
  }

  async likeArticle(articleId: string): Promise<News | null> {
    const res = await this.axiosWithAuth.patch(`/news/like/${articleId}`);

    if (res.status !== 200) {
      return null;
    }

    return res.data;
  }

  async commentOnArticle(articleId: string): Promise<News | null> {
    const res = await this.axiosWithAuth.patch(`/news/comment/${articleId}`);

    if (res.status !== 200) {
      return null;
    }

    return res.data;
  }

  async createBookmark(dto: BookmarkDto): Promise<Bookmark | null> {
    const res = await this.axiosWithAuth.post("/bookmarks", dto);

    if (res.status !== 201) {
      return null;
    }

    return res.data;
  }

  async getBookmarks(): Promise<Bookmark[]> {
    const res = await this.axiosWithAuth.get("/bookmarks");

    if (res.status !== 200) {
      return [];
    }

    return res.data;
  }

  async getUserNotifications(): Promise<Notification[]> {
    const res = await this.axiosWithAuth.get("/notifications");

    if (res.status !== 200) {
      return [];
    }

    return res.data;
  }

  async markNotificationAsRead(
    notificationId: string
  ): Promise<Notification | null> {
    const res = await this.axiosWithAuth.patch(
      `/notifications/${notificationId}`
    );

    if (res.status !== 200) {
      return null;
    }

    return res.data;
  }
}
