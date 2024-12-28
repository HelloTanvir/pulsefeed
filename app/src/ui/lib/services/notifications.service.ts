import { Notification } from "../types/notification.type";
import { BaseApiService } from "./base-api.service";

export class NotificationsService extends BaseApiService {
  async getUserNotifications(): Promise<Notification[]> {
    const response = await this.handleResponse<Notification[]>(
      this.authenticatedClient.get("/notifications")
    );
    return response ?? [];
  }

  async markNotificationAsRead(
    notificationId: string
  ): Promise<Notification | null> {
    return this.handleResponse<Notification>(
      this.authenticatedClient.patch(`/notifications/${notificationId}`)
    );
  }
}
