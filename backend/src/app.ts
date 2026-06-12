import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import { ENV } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import messageRoutes from './modules/messages/message.routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
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
  }

  private initializeRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', message: 'Server is running' });
    });
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/chat', messageRoutes);
  }

  public registerRoutes(path: string, router: express.Router): void {
    this.app.use(path, router);
  }
}

export default App;