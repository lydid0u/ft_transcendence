import fp from 'fastify-plugin'

async function userRoutes(fastify, options) {
    // fastify.get('/', async (request, reply) => {
    //     console.log("route '/'");
    // });

    fastify.get('/user', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
    {
        try
        {
            const user = await fastify.utilsDb.getOneUser(request.user.email);
            if(user)
            {
                console.log("user found", user);
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

    // fastify.get('/db/users', async (request, reply) => {
    //     const users = await fastify.db.showTableUsers()
    //     return (users);
    // });

    // fastify.get('/profile', {preValidation : [fastify.prevalidate]}, async(request, reply) =>
    // {
    //     const user = request.user
    //     console.log(user);
    //     return ({
    //         name : "test",
    //         email : "test@test.com",
    //         gamesPlayed : "4",
    //         wins : "4",
    //         losses : "0"
    //     })
    // });

    fastify.patch('/user/language', { preValidation: [fastify.prevalidate] }, async (request, reply) => {
        try {
            const { newlanguage } = request.body;
            const allowedLanguages = ['fr', 'es', 'en'];
            if (!allowedLanguages.includes(newlanguage)) {
                return reply.status(400).send({ success: false, message: "Langue non supportée. Choisissez parmi: fr, es, en." });
            }
            const user = await fastify.utilsDb.getOneUser(request.user.email);
            if (user.language === newlanguage)
                return reply.status(400).send({ success: false, message: "Vous avez déjà cette langue." });

            await fastify.dbPatch.changeLanguage(newlanguage, request.user.email);
            reply.send({ success: true, message: "Votre langue a bien été modifiée", newUser: user });
        }
        catch (err) {
            return reply.status(400).send({ success: false, message: "Erreur lors du changement de langue", error: err.message });
        }
    })

    fastify.patch('/user/avatar', { preValidation: [fastify.prevalidate] }, async (request, reply) => {
        try {
            await fastify.dbPatch.addOrChangeAvatar(request);
            const user = await fastify.utilsDb.getOneUser(request.user.email);
            if (!user.picture)
                return reply.status(400).send({ success: false, message: "Erreur lors de l'ajout d'avatar, l'image est peut-être trop grande" });
            reply.send({ success: true, message: "Votre avatar a bien été upload", newUser: user });
        }
        catch (err) {
            return reply.status(400).send({ success: false, message: "Erreur lors de l'ajout d'avatar", error: err.message });
        }
    })

    fastify.patch('/user/username', { preValidation: [fastify.prevalidate] }, async (request, reply) => {
        try {
            const { newusername } = request.body;
            await fastify.dbPatch.changeUsername(newusername, request.user.email);
            const user = await fastify.utilsDb.getOneUser(request.user.email);
            reply.send({ success: true, message: "Votre pseudo a bien été modifié", newUser: user });
        }
        catch (err) {
            return reply.status(400).send({ success: false, message: "Erreur lors du changement d'username", error: err.message });
        }
    })

    fastify.patch('/user/2fa-activate', { preValidation: [fastify.prevalidate] }, async (request, reply) => {
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

    fastify.patch('/user/connection-status', { preValidation: [fastify.prevalidate] }, async (request, reply) => {
        try {
            const { status: isOnline } = request.body;
            console.log("status", isOnline);
            // const user = await fastify.utilsDb.getOneUser(request.user.email);
            // if (!user) {
            //     return reply.status(404).send({ success: false, message: "User not found" });
            // }
            await fastify.dbPatch.changeOnlineStatus(request.user.email, isOnline);
            reply.send({ success: true, message: "Online status updated successfully" });
        } catch (err) {
            return reply.status(400).send({ success: false, message: "Erreur lors de la mise à jour du statut en ligne", error: err.message });
        }
    });

    // fastify.get('/get-all-friends', {preValidation : [fastify.prevalidate]}, async (request, reply) => {
    //     try {
    //         const userId = request.user.id;
    //         const friends = await fastify.dbFriends.showTableFriends(userId);
    //         if (friends.status === 'success') {
    //             reply.send(friends);
    //         } else {
    //             reply.status(404).send({ status: 'error', message: 'No friends found' });
    //         }
    //     } catch (err) {
    //         console.error("Error retrieving friends:", err);
    //         reply.status(500).send({ status: 'error', message: 'Internal server error', error: err.message });
    //     }
    // });

    fastify.get('/user/get-online-status', { preValidation: [fastify.prevalidate] }, async (request, reply) => {
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