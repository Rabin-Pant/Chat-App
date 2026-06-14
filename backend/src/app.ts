import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import { ENV } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';
import { globalRateLimit } from './middleware/rate-limit.middleware';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import messageRoutes from './modules/messages/message.routes';
import groupRoutes from './modules/groups/group.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import reactionRoutes from './modules/reactions/reaction.routes';
import path from 'path';
import { upload } from './middleware/upload.middleware';
import { authMiddleware } from './middleware/auth.middleware';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors({
      origin: ENV.FRONTEND_URL,
      credentials: true,
    }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(passport.initialize());
    this.app.use(globalRateLimit);
  }

  private initializeRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', message: 'Server is running' });
    });

    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/chat', messageRoutes);
    this.app.use('/api/groups', groupRoutes);
    this.app.use('/api/notifications', notificationRoutes);
    this.app.use('/api/reactions', reactionRoutes);
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    this.app.post('/api/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }
  const url = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url });
});

this.app.use('/uploads', (req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, '../uploads')));
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  public registerRoutes(path: string, router: express.Router): void {
    this.app.use(path, router);
  }
}

export default App;