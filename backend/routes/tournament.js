import fp from 'fastify-plugin'

async function tournamentRoute(fastify, options)
{
    fastify.post('/tournament/join', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const { tournamentId } = request.body;
        const userId = request.user.id;
        try {
            await fastify.dbTournament.joinPlayerToTournament(tournamentId, userId);
            reply.status(200).send({ status: 'success', message: 'Joined tournament successfully' });
        } 
        catch (error) {
            // console.error('Error joining tournament:', error);
            return reply.status(400).send({ status: 'error', message: error.message });
        }
    });
    
    fastify.get('/tournament/get-open', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        try {
            const tournaments = await fastify.dbTournament.getAllOpenTournaments();
            reply.send(tournaments);
        } catch (error) {
            // console.error('Error fetching open tournaments:', error);
            reply.status(400).send({ status: 'error', message: 'Failed to fetch open tournaments' });
        }
    });

    fastify.post('/tournament/create', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const userId = request.user.id;
        try
        {
            const alreadyExists = await fastify.dbTournament.getTournamentByCreatorId(userId);
            if (alreadyExists) {
                console.log('User already has a tournament:', alreadyExists);
                return reply.status(400).send({ status: 'error', message: 'You already have a tournament' });
            }
            console.log('Creating tournament for user:', userId);
            const tournamentId = await fastify.dbTournament.createTournament(userId);
            reply.send({ status: 'success', data: { tournamentId } });
        }
        catch (error)
        {
            // console.error('Error creating tournament:', error);
            reply.status(400).send({ status: 'error', message: 'Failed to create tournament' });
        }
    });

    fastify.post('/tournament/add-player-alias', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const { tournamentId, alias } = request.body;
        const userId = request.user.id;
        try {
            const tournament = await fastify.dbTournament.getTournamentById(tournamentId);
            if (!tournament) {
                return reply.status(404).send({ status: 'error', message: 'Tournament not found' });
            }
            if (tournament.creator_id !== userId) {
                return reply.status(403).send({ 
                    status: 'error', 
                    message: 'Only the tournament creator can add players with aliases' 
                });
            }
            await fastify.dbTournament.addAliasToParticipant(tournamentId, alias);
            reply.status(200).send({ 
                status: 'success', 
                message: `Player with alias "${alias}" added to tournament successfully` 
            });
        } catch (error) {
            // console.error('Error adding player with alias to tournament:', error);
            return reply.status(400).send({ status: 'error', message: error.message });
        }
    });

    fastify.post('/tournament/add-player-email', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const { tournamentId, email } = request.body;
        const userId = request.user.id;
        try {
            const username = await fastify.dbTournament.getUsernameByEmail(email);
            if (!username) {
                return reply.status(404).send({ status: 'error', message: 'Username not found for the provided email' });
            }
            const tournament = await fastify.dbTournament.getTournamentById(tournamentId);
            if (!tournament) {
                return reply.status(404).send({ status: 'error', message: 'Tournament not found' });
            }
            if (tournament.creator_id !== userId) {
                return reply.status(403).send({ 
                    status: 'error', 
                    message: 'Only the tournament creator can add players with accounts' 
                });
            }
            await fastify.dbTournament.addUsernameToParticipant(tournamentId, username);
            reply.status(200).send({ 
                status: 'success', 
                message: `Player with username "${username}" added to tournament successfully` 
            });
        } catch (error) {
            // console.error('Error adding player with username to tournament:', error);
            return reply.status(400).send({ status: 'error', message: error.message });
        }
    });

    fastify.get('/tournament/get-participants', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const userId = request.user.id;
        try {
            const participants = await fastify.dbTournament.getAllParticipants(userId);
            reply.send({ participants });
        } catch (error) {
            // console.error('Error fetching tournament participants:', error);
            reply.status(400).send({ status: 'error', message: 'Failed to fetch participants' });
        }
    });

    fastify.delete('/tournament/delete', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const user_id = request.user.id;
        try
        {
            const tournaments = await fastify.dbTournament.getTournamentByCreatorId(user_id);
            await fastify.dbTournament.deleteTournament(tournaments.id);
            reply.send({ status: 'success', message: 'All tournaments cleared successfully' });
        }
        catch (error)
        {
            // console.error('Error clearing tournaments:', error);
            reply.status(400).send({ status: 'error', message: 'Failed to clear tournaments' });
        }
    });

    fastify.post('/tournament/login', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        try {
            const { email, password } = request.body;
            if (!email || !password) {
                return reply.status(400).send({
                    success: false, 
                    message: 'Email et mot de passe requis'
                });
            }
            const result = await fastify.db.loginUser(email, password);
            if (result) {
                return reply.send({ success: true, data: result });
            } else {
                return reply.status(401).send({
                    success: false, 
                    message: 'Identifiants incorrects'
                });
            }
        } catch (error) {
            // console.error('Error in tournament login:', error);
            return reply.status(400).send({
                success: false, 
                message: "Wrong mail or password"
            });
        }
    });
}

export default fp(tournamentRoute)