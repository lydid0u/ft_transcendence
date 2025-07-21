import fp from 'fastify-plugin'

async function userRoutes(fastify, options)
{
    fastify.get('/', async (request, reply) => {
        console.log("route '/'");
    });

    fastify.get('/user', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
    {
        const user = await fastify.utilsDb.getOneUser(request.user.email);
        if(user)
        {
            console.log("user found", user);
            reply.send({user})
        }
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
            const user = await fastify.utilsDb.getOneUser(request.user.email);
            if (!user.picture)
                return reply.status(400).send({success: false, message: "Erreur lors de l'ajout d'avatar, l'image est peut-être trop grande"});
            reply.send({success : true, message : "Votre avatar a bien été upload", newUser: user});
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
            const user = await fastify.utilsDb.getOneUser(request.user.email);
            reply.send({success : true, message : "Votre pseudo a bien été modifié", newUser: user});
        }
        catch (err)
        {
            return reply.status(400).send({success : false, message : "Erreur lors du changement d'username", error : err.message});
        }
    })

    fastify.patch('/user/2fa-activate', {preValidation : [fastify.prevalidate]}, async (request, reply) => {
        try {
            await fastify.dbPatch.activate2FA(request.user.email, request.body.isActivate);
            const user = await fastify.utilsDb.getOneUser(request.user.email);
            console.log("2FA status updated for user:", request.user.email, "isActivate:", request.body.isActivate);
            if (!user) {
                return reply.status(404).send({ success: false, message: "User not found" });
            }
            reply.send({ success: true, message: "2FA status updated successfully", user });
        }
        catch (err) {
            return reply.status(400).send({ success: false, message: "Erreur lors de la mise à jour du statut 2FA", error: err.message });
        }
    })

}

export default fp(userRoutes);