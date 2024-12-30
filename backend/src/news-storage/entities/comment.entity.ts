import { AbstractEntity } from '../../db/abstract.entity';
import { User } from '../../user/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { NewsArticleEntity } from './news-article.entity';

@Entity()
export class CommentEntity extends AbstractEntity<CommentEntity> {
    @Column()
    content: string;

    @ManyToOne(() => NewsArticleEntity, (article) => article.comments)
    article: NewsArticleEntity;

    @ManyToOne(() => User)
    @JoinColumn()
    user: User;
}
