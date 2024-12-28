import { BookmarkDto } from "../dto/bookmark.dto";
import { Bookmark } from "../types/bookmark.type";
import { BaseApiService } from "./base-api.service";
export class BookmarksService extends BaseApiService {
  async createBookmark(dto: BookmarkDto): Promise<Bookmark | null> {
    return this.handleResponse<Bookmark>(
      this.authenticatedClient.post("/bookmarks", dto)
    );
  }

  async getBookmarks(): Promise<Bookmark[]> {
    const response = await this.handleResponse<Bookmark[]>(
      this.authenticatedClient.get("/bookmarks")
    );
    return response ?? [];
  }
}
