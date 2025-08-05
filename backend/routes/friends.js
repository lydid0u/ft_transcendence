import fp from 'fastify-plugin'

async function friendsRoute(fastify, options)
{
    fastify.get('/get-all-friends', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
    {
        const table = await fastify.dbFriends.showTableFriends(request.user.id);
        return table;
    }),

    fastify.patch('/friends', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
    {
        const {friend_delete} = request.body
        fastify.dbFriends.deletefriend(request, friend_delete);
        reply.send({ status: 'success' });
    }),

    fastify.post('/friends-add', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
    {
        try
        {
            const { friend_nickname } = request.body;
            await fastify.dbFriends.addFriends(request, friend_nickname);
            reply.send({ status: 'success' });
        }
        catch (error)
        {
            console.error('Error adding friend:', error);
            reply.status(400).send({ error: 'Failed to add friend' });
        }
    })
}

export default fp(friendsRoute);