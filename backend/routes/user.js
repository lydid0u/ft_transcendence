import fp from 'fastify-plugin'

async function userRoutes(fastify, options)
{
    fastify.get('/user', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
    {
        try
        {
            const user = await fastify.utilsDb.getOneUser(request.user.email);
            if(user)
            {
                reply.send({user})
            }
            else
            {
                console.log("user not found");
                reply.status(404).send({error: "User not found"});
            }
        }
        catch (error)
        {
            console.error('Error fetching user:', error);
            reply.status(404).send({error: "Failed to fetch user"});
        }
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
        } catch (err) {
            return reply.status(400).send({ success: false, message: "Erreur lors de la mise à jour du statut 2FA", error: err.message });
        }
    })

    fastify.patch('/user/connection-status', {preValidation : [fastify.prevalidate]}, async (request, reply) => {
        try {
            const { status : isOnline } = request.body;
            console.log("status", isOnline);
            await fastify.dbPatch.changeOnlineStatus(request.user.email, isOnline);
            reply.send({ success: true, message: "Online status updated successfully"});
        } catch (err) {
            return reply.status(400).send({ success: false, message: "Erreur lors de la mise à jour du statut en ligne", error: err.message });
        }
    });

    fastify.get('/user/get-online-status', {preValidation : [fastify.prevalidate]}, async (request, reply) => {
        try {
            console.log("Checking online status for user:", request.query.friend_nickname);
            const user = await fastify.db.connection.get('SELECT status FROM users WHERE username = ?', request.query.friend_nickname);
            if (!user) {
                return reply.status(404).send({ success: false, message: "User not found" });
            }
            console.log("User found:", user);
            reply.send({ success: true, isOnline: user.status === 1 });
        } catch (err) {
            return reply.status(400).send({ success: false, message: "Erreur lors de la récupération du statut en ligne", error: err.message });
        }
    });

}

export default fp(userRoutes);