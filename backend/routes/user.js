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

    fastify.patch('/user/avatar', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
    {
        try
        {
            await fastify.dbPatch.addOrChangeAvatar(request);
            reply.send({success : true, message : "Votre avatar a bien été upload"})
        }
        catch (err)
        {
            return reply.status(400).send({success: false, message: "Erreur lors de l'ajout d'avatar", error: err.message});
        }        
    })

    fastify.patch('/user/username', {preValidation : [fastify.prevalidate]}, async (request, reply) => {
        try
        {
            const {newusername} = request.body;
            await fastify.dbPatch.changeUsername(newusername, request.user.email);
            reply.send({success : true, message : "Votre pseudo a bien été modifié"});
        }
        catch (err)
        {
            return reply.status(400).send({success : false, message : "Erreur lors du changement d'username", error : err.message});
        }
    })

}

export default fp(userRoutes);