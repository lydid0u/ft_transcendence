import Fastify from 'fastify';
import dbFunction from './db/db.js'
import userRoutes from './routes/user.js';
import authGoogle from './routes/auth.js'
import fastifyJwt from '@fastify/jwt';



const fastify = Fastify();

fastify.register(fastifyJwt, {
  secret: 'ma_cle_secreeeeteuh_ultra_puissanteeuuuh'
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