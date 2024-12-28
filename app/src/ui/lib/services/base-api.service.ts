import { AxiosInstance, AxiosResponse } from "axios";
import { HttpClient } from "./axios-config";

export class BaseApiService {
  protected readonly authenticatedClient: AxiosInstance;
  protected readonly publicClient: AxiosInstance;

  constructor() {
    const httpClient = HttpClient.getInstance();
    this.authenticatedClient = httpClient.authenticatedClient;
    this.publicClient = httpClient.publicClient;
  }

  protected async handleResponse<T>(
    response: Promise<AxiosResponse>
  ): Promise<T | null> {
    try {
      const { data, status } = await response;
      return status >= 200 && status < 300 ? data : null;
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  }
}
