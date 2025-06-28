import fp from 'fastify-plugin'

async function friendsRoute(fastify, options)
{
    fastify.get('/friends', async (request, reply) =>
    {
        console.log("Route friends");
        const table = await fastify.dbFriends.showTableFriends();
        return table;
    }),

    fastify.post('/friends-add', async (request, reply) =>
    {
        console.log("Add friends");
        
    })
}

export default fp(friendsRoute);