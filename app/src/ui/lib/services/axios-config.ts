/* eslint-disable @typescript-eslint/ban-ts-comment */
import axios, { AxiosInstance, AxiosError } from "axios";

export class HttpClient {
  private static instance: HttpClient;
  private readonly axiosWithAuth: AxiosInstance;
  private readonly axiosWithoutAuth: AxiosInstance;
  private readonly API_URL: string;

  private constructor() {
    this.API_URL = import.meta.env.VITE_API_BASE_URL;
    this.axiosWithoutAuth = this.createAxiosInstance();
    this.axiosWithAuth = this.createAuthenticatedAxiosInstance();
    this.setupInterceptors();
  }

  static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: `${this.API_URL}`,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private createAuthenticatedAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: `${this.API_URL}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
    });
  }

  private setupInterceptors(): void {
    this.axiosWithAuth.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          // @ts-ignore
          !originalRequest._retry
        ) {
          // @ts-ignore
          originalRequest._retry = true;

          try {
            const { data } = await this.axiosWithoutAuth.patch(
              "/auth/refresh-token",
              {
                refreshToken: localStorage.getItem("refresh_token"),
              }
            );

            if (data) {
              this.updateTokens(data.access_token, data.refresh_token);
              return this.axiosWithAuth(originalRequest);
            }
          } catch (refreshError) {
            this.clearTokens();
            throw refreshError;
          }
        }

        throw error;
      }
    );
  }

  private updateTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    this.axiosWithAuth.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  }

  private clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  get authenticatedClient(): AxiosInstance {
    return this.axiosWithAuth;
  }

  get publicClient(): AxiosInstance {
    return this.axiosWithoutAuth;
  }
}
