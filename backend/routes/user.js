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

    fastify.get('/profile', {preValidation : [fastify.prevalidate]}, async(request, reply) =>
    {
        const user = request.user
        console.log(user);
        return ({
            name : "test",
            email : "test@test.com",
            gamesPlayed : "4",
            wins : "4",
            losses : "0"
        })
    });

}

export default fp(userRoutes);