import { UpdateUserDto } from "../dto/auth.dto";
import { SubscribeToSectionDto } from "../dto/subscribe.dto";
import { User } from "../types/user.type";
import { BaseApiService } from "./base-api.service";

export class UserService extends BaseApiService {
  async getCurrentUser(): Promise<User | null> {
    return this.handleResponse<User>(
      this.authenticatedClient.get("/user/current-user")
    );
  }

  async updateUser(userId: string, dto: UpdateUserDto): Promise<User | null> {
    return this.handleResponse<User>(
      this.authenticatedClient.patch(`/user/${userId}`, dto)
    );
  }

  async subscribeToSection(dto: SubscribeToSectionDto): Promise<User | null> {
    return this.handleResponse<User>(
      this.authenticatedClient.patch("/user/subscribe-to-section", dto)
    );
  }
}
