import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import reviewRoutes from './routes/review.routes';
import rewardRoutes from './routes/reward.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import contactRoutes from './routes/contact.routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Express = express();
const port = env.PORT;

// Security Middlewares
app.use(helmet()); // Sets various HTTP headers for security
app.use(compression()); // Gzip compression
app.use(express.json());

// Rate Limiting: Prevent brute force and DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'production' ? 100 : 10000, // much higher limit for dev
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all routes
if (env.NODE_ENV === 'production') {
  app.use('/api/', limiter);
} else {
  console.log('Rate limiter disabled for development');
}

// CORS Configuration
app.use(cors({
  origin: env.NODE_ENV === 'production' ? env.FRONTEND_URL : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// Request Logger
app.use((req, res, next) => {
  if (env.NODE_ENV !== 'production') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.send('Drop Best API is running');
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    env: env.NODE_ENV,
    time: new Date().toISOString() 
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contacts', contactRoutes);

// Error Handler
app.use(errorHandler);

if (process.env.VERCEL !== '1') {
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
    if (env.NODE_ENV !== 'production') {
      console.log(`Development URL: http://localhost:${port}`);
    }
  });
}

export default app;

