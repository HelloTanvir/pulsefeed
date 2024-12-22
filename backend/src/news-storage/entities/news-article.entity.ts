import { AbstractEntity } from 'src/db/abstract.entity';
import { Entity, Column, CreateDateColumn } from 'typeorm';

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

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    scrapedAt: Date;
}
