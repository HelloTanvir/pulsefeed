import { CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export class AbstractEntity<T> {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    createdAt: Date;

    constructor(entity: Partial<T>) {
        Object.assign(this, entity);
    }
}
