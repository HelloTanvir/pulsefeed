import { AbstractEntity } from '../../db/abstract.entity';
import { User } from '../../user/entities/user.entity';
import { Entity, Column, ManyToMany, JoinTable, OneToMany, Index } from 'typeorm';
import { CommentEntity } from './comment.entity';

@Entity()
@Index('news_search_vector_idx', { synchronize: false })
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

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
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

    @Column({
        type: 'tsvector',
        select: false,
        generatedType: 'STORED',
        asExpression: `to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))`,
    })
    searchVector: any;
}
