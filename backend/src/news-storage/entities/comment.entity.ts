import { AbstractEntity } from 'src/db/abstract.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { NewsArticleEntity } from './news-article.entity';

@Entity()
export class CommentEntity extends AbstractEntity<CommentEntity> {
    @Column()
    content: string;

    @ManyToOne(() => NewsArticleEntity, (article) => article.comments)
    article: NewsArticleEntity;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;
}
