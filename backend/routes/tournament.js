import fp from 'fastify-plugin'

async function tournamentRoute(fastify, options)
{
    fastify.post('/tournament/join', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const { tournamentId } = request.body;
        const userId = request.user.id;

        // Logic to join the tournament
        try {
            await fastify.dbTournament.joinPlayerToTournament(tournamentId, userId);
            reply.status(200).send({ status: 'success', message: 'Joined tournament successfully' });
        } 
        catch (error) {
            console.error('Error joining tournament:', error);
            return reply.status(400).send({ status: 'error', message: error.message });
        }
    });
    
    fastify.get('/tournament/get-open', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const tournaments = await fastify.dbTournament.getAllOpenTournaments();
        reply.send(tournaments);
    });

    // Nouveau endpoint pour récupérer les détails du tournoi de l'utilisateur
    fastify.get('/tournament/get-my-tournament', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const userId = request.user.id;
        
        try {
            // Récupérer le tournoi créé par l'utilisateur
            const tournament = await fastify.dbTournament.getTournamentByCreatorId(userId);
            
            if (!tournament) {
                return reply.status(404).send({ status: 'error', message: 'No tournament found' });
            }
            
            // Récupérer les participants du tournoi
            const participants = await fastify.dbTournament.getTournamentParticipantsWithDetails(tournament.id);
            
            // Retourner les détails du tournoi avec la liste des participants
            reply.send({
                id: tournament.id,
                creator_id: tournament.creator_id,
                status: tournament.status,
                created_at: tournament.created_at,
                participants: participants || []
            });
        } catch (error) {
            console.error('Error fetching tournament details:', error);
            return reply.status(500).send({ status: 'error', message: 'Failed to fetch tournament details' });
        }
    });

    fastify.post('/tournament/create', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        // const { name } = request.body;
        const userId = request.user.id;

        // Logic to create a tournament
        const alreadyExists = await fastify.dbTournament.getTournamentByCreatorId(userId);
        if (alreadyExists) {
            console.log('User already has a tournament:', alreadyExists);
            return reply.status(400).send({ status: 'error', message: 'You already have a tournament' });
        }
        const tournamentId = await fastify.dbTournament.createTournament(userId);
        reply.send({ status: 'success', data: { tournamentId } });
    });

    fastify.post('/tournament/add-player-alias', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const { tournamentId, alias } = request.body;
        const userId = request.user.id; // L'utilisateur qui fait la demande (créateur du tournoi)

        try {
            // Vérifier si l'utilisateur est le créateur du tournoi
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

            // Ajouter un joueur avec un alias au tournoi
            await fastify.dbTournament.addAliasToParticipant(tournamentId, alias);
            
            reply.status(200).send({ 
                status: 'success', 
                message: `Player with alias "${alias}" added to tournament successfully` 
            });
        } catch (error) {
            console.error('Error adding player with alias to tournament:', error);
            return reply.status(400).send({ status: 'error', message: error.message });
        }
    });

    fastify.post('/tournament/add-player-email', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const { tournamentId, email } = request.body;
        console.log('Adding player with email:', email);
        const userId = request.user.id; // L'utilisateur qui fait la demande (créateur du tournoi)

        try {
            const username = await fastify.dbTournament.getUsernameByEmail(email);
            if (!username) {
                return reply.status(404).send({ status: 'error', message: 'Username not found for the provided email' });
            }
            // Vérifier si l'utilisateur est le créateur du tournoi
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

            // Ajouter un joueur avec un username au tournoi
            await fastify.dbTournament.addUsernameToParticipant(tournamentId, username);
            
            reply.status(200).send({ 
                status: 'success', 
                message: `Player with username "${username}" added to tournament successfully` 
            });
        } catch (error) {
            console.error('Error adding player with username to tournament:', error);
            return reply.status(400).send({ status: 'error', message: error.message });
        }
    });

    fastify.get('/tournament/get-all-tournaments', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const tournaments = await fastify.dbTournament.getAllTournaments();
        reply.send(tournaments);
    });

    fastify.get('/tournament/get-participants', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const participants = await fastify.dbTournament.getAllParticipants();
        reply.send({ participants });
    });

    fastify.delete('/tournament/delete', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        // Logic to clear all tournaments and participants
        const user_id = request.user.id;
        const tournaments = await fastify.dbTournament.getTournamentByCreatorId(user_id);
        await fastify.dbTournament.deleteTournament(tournaments.id);
        reply.send({ status: 'success', message: 'All tournaments cleared successfully' });
    });

    fastify.put('/tournament/clear-participants', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const { tournamentId } = request.body;

        // Logic to clear participants from a tournament
        await fastify.dbTournament.clearTournamentParticipants(tournamentId);
        reply.send({ status: 'success', message: 'Participants cleared successfully' });
    });

    fastify.post('/tournament/login', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
{
    try {
        console.log('Login request received for tournament');
        const { email, password } = request.body;
        
        // Validation des entrées
        if (!email || !password) {
            return reply.status(400).send({
                success: false, 
                message: 'Email et mot de passe requis'
            });
        }

        // Logic to authenticate the player and join the tournament
        const result = await fastify.db.loginUser(email, password);
        if (result) {
            return reply.send({ success: true, data: result });
        } else {
            // Utiliser 401 pour authentification échouée
            return reply.status(401).send({
                success: false, 
                message: 'Identifiants incorrects'
            });
        }
    } catch (error) {
        console.error('Error in tournament login:', error);
        // Utiliser 400 pour les erreurs de requête client au lieu de 500
        return reply.status(400).send({
            success: false, 
            message: "Wrong mail or password"
        });
    }
});
}

export default fp(tournamentRoute)