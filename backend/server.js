import Fastify from 'fastify';
import cors from '@fastify/cors'
import dbFunction from './db/db_auth.js';
import dbFunctionPatch from './db/db_patch.js';
import userRoutes from './routes/user.js';
import authGoogle from './routes/auth.js'
import fastifyJwt from '@fastify/jwt';
import utilsDbFunc from './db/utils.js'
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static';
import path from 'path'
import { fileURLToPath } from 'url';

const fastify = Fastify();

dotenv.config();

fastify.register(fastifyJwt, {
  secret: process.env.SECRET_KEY_JWT
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_2FA,
    pass: process.env.PASS_2FA
  }
});
fastify.decorate('nodemailer', transporter);

// Replace your current cors registration with this:
fastify.register(cors, {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Replace with your actual frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false
});

fastify.decorate('prevalidate', async function(request, reply) {
  try {
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


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
fastify.register(authGoogle);
fastify.register(fastifyStatic, {
  root: avatarDir,         // Le dossier où sont stockés tes avatars
  prefix: '/avatar/',      // L’URL publique pour accéder aux fichiers
});

const startServer = async() =>
{
  try
  {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Server listening on port 3000');
  }
  catch (error)
  {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();