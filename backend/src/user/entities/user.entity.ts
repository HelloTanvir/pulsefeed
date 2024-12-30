import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../db/abstract.entity';
import { SubscriptionEntity } from './subscription.entity';

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

    @OneToMany(() => SubscriptionEntity, (subscription) => subscription.user)
    subscriptions: SubscriptionEntity[];
}
