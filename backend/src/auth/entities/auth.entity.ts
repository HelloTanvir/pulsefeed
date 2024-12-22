import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../db/abstract.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Auth extends AbstractEntity<Auth> {
    @OneToOne(() => User, { onDelete: 'CASCADE', cascade: true })
    @JoinColumn()
    user: User;

    @Column({ default: null })
    refreshToken: string | null;
}
