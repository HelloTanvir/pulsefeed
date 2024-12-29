import { NewsArticleEntity } from '../../news-storage/entities/news-article.entity';
import { AbstractEntity } from '../../db/abstract.entity';
import { User } from '../../user/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class NotificationEntity extends AbstractEntity<NotificationEntity> {
    @Column()
    message: string;

    @Column({ default: false })
    isRead: boolean;

    @ManyToOne(() => User)
    @JoinColumn()
    user: User;

    @OneToOne(() => NewsArticleEntity)
    @JoinColumn()
    article: NewsArticleEntity;
}
