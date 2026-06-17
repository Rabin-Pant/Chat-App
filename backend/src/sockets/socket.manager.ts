import 'reflect-metadata';
import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { ENV } from '../config/env';
import { TokenService } from '../modules/auth/token.service';
import { PresenceService } from '../modules/presence/presence.service';
import { UserConversationEntity } from '../modules/conversations/user-conversation.entity';
import { AppDataSource } from '../config/database';

const tokenService = new TokenService();
const presenceService = new PresenceService();

export class SocketManager {
  private static instance: SocketManager;
  public io: SocketServer;

  private constructor(server: HttpServer) {
   this.io = new SocketServer(server, {
  cors: {
    origin: ENV.FRONTEND_URL,
    credentials: true,
  },
  transports: ['websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e6,
});

    this.io.use(this.authMiddleware);
    this.io.on('connection', this.handleConnection.bind(this));
  }

  public static getInstance(server?: HttpServer): SocketManager {
    if (!SocketManager.instance) {
      if (!server) throw new Error('Server required for first initialization');
      SocketManager.instance = new SocketManager(server);
    }
    return SocketManager.instance;
  }

  private authMiddleware = async (socket: Socket, next: (err?: Error) => void): Promise<void> => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) throw new Error('No token provided');

      const payload = tokenService.verifyAccessToken(token);
      socket.data.userId = payload.userId;
      socket.data.email = payload.email;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  };

  private handleConnection = async (socket: Socket): Promise<void> => {
  const userId = socket.data.userId as string;
  console.log(`🔌 User connected: ${userId}`);

  socket.join(`user:${userId}`);
  await presenceService.setOnline(userId);
  socket.broadcast.emit('presence:update', { userId, isOnline: true });

  try {
    const { AppDataSource } = await import('../config/database');
   const ucRepo = AppDataSource.getRepository(UserConversationEntity);
const userConvs = await ucRepo.find({ where: { userId } });
for (const uc of userConvs) {
  socket.join(`conversation:${uc.conversationId}`);
}
  } catch (err) {
    console.error('Failed to join conversation rooms:', err);
  }

  socket.on('join:conversation', (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on('leave:conversation', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on('message:read', async (conversationId: string) => {
  socket.to(`conversation:${conversationId}`).emit('message:read', {
    conversationId,
    userId,
  });
});

  socket.on('typing:start', (conversationId: string) => {
    socket.to(`conversation:${conversationId}`).emit('typing:start', {
      userId,
      conversationId,
    });
  });

  socket.on('typing:stop', (conversationId: string) => {
    socket.to(`conversation:${conversationId}`).emit('typing:stop', {
      userId,
      conversationId,
    });
  });

  socket.on('disconnect', async () => {
    console.log(`🔌 User disconnected: ${userId}`);
    await presenceService.setOffline(userId);
    socket.broadcast.emit('presence:update', { userId, isOnline: false });
  });
};

  public emitToConversation(conversationId: string, event: string, data: any): void {
    this.io.to(`conversation:${conversationId}`).emit(event, data);
  }

  public emitToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }
}