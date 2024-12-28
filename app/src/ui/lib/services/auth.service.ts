import { LoginDto, SignUpDto } from "../dto/auth.dto";
import { BaseApiService } from "./base-api.service";

export class AuthService extends BaseApiService {
  async signup(dto: SignUpDto): Promise<{ success: boolean }> {
    const response = await this.handleResponse<{
      access_token: string;
      refresh_token: string;
    }>(this.publicClient.post("/auth/signup", dto));

    if (!response) return { success: false };

    this.storeToken(response.access_token, response.refresh_token);
    return { success: true };
  }

  async login(dto: LoginDto): Promise<{ success: boolean }> {
    const response = await this.handleResponse<{
      access_token: string;
      refresh_token: string;
    }>(this.publicClient.post("/auth/login", dto));

    if (!response) return { success: false };

    this.storeToken(response.access_token, response.refresh_token);
    return { success: true };
  }

  async logout(): Promise<void> {
    await this.authenticatedClient.delete("/auth/logout");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  private storeToken(accessToken: string, refreshToken: string): void {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  }
}
