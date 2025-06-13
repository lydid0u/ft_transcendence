import fp from 'fastify-plugin'

async function userRoutes(fastify, options)
{
    fastify.get('/', async (request, reply) => {
        console.log("route '/'");
    });

    fastify.get('/db/users', async (request, reply) => {
        const users = await fastify.db.showTableUsers()
        return (users);
    });
}

export default fp(userRoutes);