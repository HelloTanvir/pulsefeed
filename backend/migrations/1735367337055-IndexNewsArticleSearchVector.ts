import { Logger } from '@nestjs/common';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class IndexNewsArticleSearchVector1735367337055 implements MigrationInterface {
    private readonly logger = new Logger(IndexNewsArticleSearchVector1735367337055.name);

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add the search vector column
        await queryRunner.query(`
            ALTER TABLE news_article_entity 
            ADD COLUMN search_vector tsvector 
            GENERATED ALWAYS AS (
                to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
            ) STORED;
        `);

        // Create a GIN index for the search vector
        await queryRunner.query(`
            CREATE INDEX news_search_vector_idx 
            ON news_article_entity 
            USING GIN (search_vector);
        `);

        this.logger.log('Index created for search_vector column in news_article_entity table');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX news_search_vector_idx`);
        await queryRunner.query(`ALTER TABLE news_article_entity DROP COLUMN search_vector`);

        this.logger.log('Index removed for search_vector column in news_article_entity table');
    }
}
