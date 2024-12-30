import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../db/abstract.entity';
import { User } from './user.entity';

@Entity()
export class SubscriptionEntity extends AbstractEntity<SubscriptionEntity> {
    @Column()
    section: string;

    @ManyToOne(() => User, (user) => user.subscriptions)
    user: User;
}
