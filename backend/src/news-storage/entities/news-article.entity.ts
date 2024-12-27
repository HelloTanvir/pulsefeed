import { AbstractEntity } from 'src/db/abstract.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { CommentEntity } from './comment.entity';

@Entity()
export class NewsArticleEntity extends AbstractEntity<NewsArticleEntity> {
    @Column()
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column()
    url: string;

    @Column({ nullable: true })
    author?: string;

    @Column()
    portal: string;

    @Column()
    section: string;

    @Column({ nullable: true })
    imageUrl?: string;

    @Column({ type: 'timestamp' })
    publishedAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    scrapedAt: Date;

    @ManyToMany(() => User)
    @JoinTable()
    likedBy: User[];

    @OneToMany(() => CommentEntity, (comment) => comment.article)
    comments: CommentEntity[];

    @Column({ default: false })
    createdByAdmin: boolean;
}
