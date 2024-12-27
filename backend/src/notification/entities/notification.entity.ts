import { AbstractEntity } from 'src/db/abstract.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class NotificationEntity extends AbstractEntity<NotificationEntity> {
    @Column()
    message: string;

    @Column({ default: false })
    isRead: boolean;

    @ManyToOne(() => User)
    @JoinColumn()
    user: User;
}
