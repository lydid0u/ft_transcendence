import Fastify from 'fastify';
import cors from '@fastify/cors'
import dbFunction from './db/db.js'
import userRoutes from './routes/user.js';
import authGoogle from './routes/auth.js'
import fastifyJwt from '@fastify/jwt';
import utilsDbFunc from './db/utils.js'
import dotenv from 'dotenv';

const fastify = Fastify();

dotenv.config();

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
fastify.register(fastifyJwt, {
  secret: process.env.SECRET_KEY_JWT
});

fastify.decorate('prevalidate', async function(request, reply) {
  try {
    // Verify JWT token from Authorization header
    await request.jwtVerify()
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or missing token' })
  }
});

fastify.register(dbFunction);
fastify.register(utilsDbFunc);
fastify.register(userRoutes);
fastify.register(authGoogle);


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