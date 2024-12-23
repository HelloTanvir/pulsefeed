import { AbstractEntity } from 'src/db/abstract.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { NewsArticleEntity } from './news-article.entity';

@Entity('bookmarks')
@Unique(['userId', 'article']) // Prevent duplicate bookmarks
export class BookmarkEntity extends AbstractEntity<BookmarkEntity> {
    @Column()
    userId: string;

    @ManyToOne(() => NewsArticleEntity)
    @JoinColumn()
    article: NewsArticleEntity;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'text', nullable: true })
    note?: string;
}
