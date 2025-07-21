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
        const { friend_nickname } = request.body;
        await fastify.dbFriends.addFriends(request, friend_nickname);
        reply.send({ status: 'success' });
    })
}

export default fp(friendsRoute);