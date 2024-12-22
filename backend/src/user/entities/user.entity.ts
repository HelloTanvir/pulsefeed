import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../db/abstract.entity';

@Entity()
export class User extends AbstractEntity<User> {
    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column({ select: false, default: false })
    isAdmin: boolean;
}
