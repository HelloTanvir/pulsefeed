import { AbstractEntity } from '../../db/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { NewsArticleEntity } from './news-article.entity';
import { User } from '../../user/entities/user.entity';

@Entity('bookmarks')
export class BookmarkEntity extends AbstractEntity<BookmarkEntity> {
    @Column()
    user: User;

    @ManyToOne(() => NewsArticleEntity)
    @JoinColumn()
    article: NewsArticleEntity;

    @Column({ type: 'text', nullable: true })
    note?: string;
}
