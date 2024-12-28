import { User } from "./user.type";

export interface News {
    id: string;
    title: string;
    content: string;
    url: string;
    author?: string;
    portal: string;
    section: string;
    imageUrl?: string;
    publishedAt: Date;
    scrapedAt: Date;
    likedBy: User[];
    comments: Comment[];
}

export interface Comment {
    id: string;
    content: string;
    user: User;
}