import { Logger } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(NotificationGateway.name);
    private readonly userSockets = new Map<string, string>();

    afterInit() {
        this.logger.log('Notification WebSocket Gateway initialized');
    }

    handleConnection(client: Socket) {
        const userId = client.handshake.query.userId as string;
        if (userId) {
            this.userSockets.set(userId, client.id);
        }
    }

    sendNotification(userId: string, payload: any) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.server.to(socketId).emit('notification', payload);
        }
    }
}
