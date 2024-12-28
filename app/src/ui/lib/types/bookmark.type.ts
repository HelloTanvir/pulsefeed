import { News } from "./news.type";

export interface Bookmark {
    id: string;
    note?: string;
    article: News;
    createdAt: string;
}