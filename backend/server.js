import Fastify from 'fastify';
import cors from '@fastify/cors'
import dbFunction from './db/db_auth.js';
import dbFunctionPatch from './db/db_patch.js';
import userRoutes from './routes/user.js';
import authGoogle from './routes/auth.js'
import tableFriends from './db/db_friends.js'
import friendsRoutes from './routes/friends.js'
import matchesRoutes from './routes/matches.js'
import matchesTable from './db/db_match.js';
import tournamentRoutes from './routes/tournament.js';
import tournamentLaunchRoute from './routes/launchtournament.js';
import dbTournament from './db/db_tournament.js';
import dbPong from './db/db_pong.js';
import fastifyJwt from '@fastify/jwt';
import utilsDbFunc from './db/utils.js'
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static';
import path from 'path'
import tableSnake from './db/db_snake.js';
import MatchData from './db/db_tournament_match.js';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if HTTPS is enabled
const httpsEnabled = process.env.HTTPS_ENABLED === 'true';

// HTTPS options (only if enabled and certificates exist)
let httpsOptions = undefined;
if (httpsEnabled) {
  try {
    const keyPath = path.join(__dirname, './certs/server.key');
    const certPath = path.join(__dirname, './certs/server.crt');
    
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
      console.log('✅ HTTPS certificates loaded successfully');
    } else {
      console.warn('⚠️  HTTPS enabled but certificates not found, falling back to HTTP');
    }
  } catch (error) {
    console.error('❌ Error loading HTTPS certificates:', error.message);
    console.log('📝 Falling back to HTTP');
  }
}

// Create Fastify instance with optional HTTPS
const fastify = Fastify({
  logger: {
    level: 'info'
  },
  ...(httpsOptions && { https: httpsOptions })
});

// JWT registration
fastify.register(fastifyJwt, {
  secret: process.env.SECRET_KEY_JWT,
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_2FA,
    pass: process.env.PASS_2FA
  }
});
fastify.decorate('nodemailer', transporter);

// CORS registration with HTTPS support
fastify.register(cors, {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      // HTTP origins (fallback)
      'http://localhost:5173', 
      'http://127.0.0.1:5173',
      // HTTPS origins
      'https://localhost:5173', 
      'https://127.0.0.1:5173',
      // Docker container names
      'http://vite-frontend:5173',
      'https://vite-frontend:5173',
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false
});

fastify.decorate('prevalidate', async function(request, reply) {
  try {
    console.log("Verifying JWT token JSPR CA MARCHE ICI ...");
    await request.jwtVerify()
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or missing token' })
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.error('Erreur de configuration Nodemailer:', error);
  } else {
    console.log('Nodemailer est prêt à envoyer des messages');
  }
});

const avatarDir = path.join(__dirname, 'avatar');

fastify.register(multipart, {
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 Mo
  }
});
fastify.register(dbFunction);
fastify.register(utilsDbFunc);
fastify.register(dbFunctionPatch);
fastify.register(userRoutes);
fastify.register(friendsRoutes);
fastify.register(authGoogle);
fastify.register(tableFriends);
fastify.register(MatchData);
fastify.register(matchesTable);
fastify.register(dbPong);
fastify.register(matchesRoutes);
fastify.register(tableSnake);
fastify.register(tournamentRoutes);
fastify.register(tournamentLaunchRoute);
fastify.register(dbTournament);
fastify.register(fastifyStatic, {
  root: avatarDir,
  prefix: '/avatar/',
});
// Graceful shutdown handlers
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down gracefully`);
  try {
    await fastify.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server function
const startServer = async () => {
  try {
    const port = process.env.PORT || 3000;
    const protocol = httpsOptions ? 'https' : 'http';
    
    await fastify.listen({ port: parseInt(port), host: '0.0.0.0' });
    
    console.log(`🚀 Server listening on ${protocol}://localhost:${port}`);
    console.log(`📋 Health check: ${protocol}://localhost:${port}/api/health`);
    console.log(`🔒 HTTPS: ${httpsOptions ? 'Enabled' : 'Disabled'}`);
    
    if (!httpsOptions && httpsEnabled) {
      console.log('💡 To enable HTTPS, make sure certificates exist in ./certs/ directory');
    }
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();