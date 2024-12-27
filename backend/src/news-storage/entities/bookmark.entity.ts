import { AbstractEntity } from 'src/db/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { NewsArticleEntity } from './news-article.entity';

@Entity('bookmarks')
@Unique(['userId', 'article']) // Prevent duplicate bookmarks
export class BookmarkEntity extends AbstractEntity<BookmarkEntity> {
    @Column()
    userId: string;

    @ManyToOne(() => NewsArticleEntity)
    @JoinColumn()
    article: NewsArticleEntity;

    @Column({ type: 'text', nullable: true })
    note?: string;
}
