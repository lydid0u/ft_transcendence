import Fastify from 'fastify';
import { createTable } from './db/db.js';
import userRoutes from './routes/user.js';

const fastify = Fastify();

fastify.register(userRoutes);

const startServer = async() =>
{
  try
  {
    await createTable();
    console.log("Table has been init");
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