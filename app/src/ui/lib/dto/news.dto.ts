export interface NewsQueryParamsDto {
  search?: string;
  portal?: string;
  section?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: "publishedAt" | "scrapedAt" | "title"; // default: 'publishedAt'
  sortOrder?: "ASC" | "DESC"; // default: 'DESC'
}

export interface CommentDto {
  content: string;
}
