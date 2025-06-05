import fp from 'fastify-plugin'

async function userRoutes(fastify, options)
{
    fastify.get('/', async (request, reply) => {
        console.log("route '/'");
    });
}

export default fp(userRoutes);