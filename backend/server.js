import Fastify from 'fastify';
import dbFunction from './db/db.js'
import userRoutes from './routes/user.js';
import authGoogle from './routes/auth.js'
import fastifyJwt from '@fastify/jwt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify();

dotenv.config({ path: path.join(__dirname, '.env') });

fastify.register(fastifyJwt, {
  secret: process.env.SECRET_KEY_JWT
});

fastify.register(dbFunction);
fastify.register(userRoutes);
fastify.register(authGoogle);


// CORS simple
fastify.addHook('preHandler', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*')
  reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  reply.header('Access-Control-Allow-Headers', 'Content-Type')
  
  if (request.method === 'OPTIONS') {
    return reply.send()
  }
})

// Routes
// fastify.get('/', async () => {
//   return { message: 'Backend OK!' }
// })


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