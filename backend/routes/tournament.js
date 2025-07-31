import fp from 'fastify-plugin'

async function tournamentRoute(fastify, options)
{
    fastify.post('/tournament/join', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const { tournamentId } = request.body;
        const userId = request.user.id;

        // Logic to join the tournament
        console.log('User ID:', userId, 'Tournament ID:', tournamentId);
        try {
            await fastify.dbTournament.addPlayerToTournament(tournamentId, userId);
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

    fastify.get('/tournament/get-all-tournaments', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const tournaments = await fastify.dbTournament.getAllTournaments();
        reply.send(tournaments);
    });

    fastify.get('/tournament/get-participants', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const participants = await fastify.dbTournament.getAllParticipants();
        reply.send(participants);
    });

    fastify.delete('/tournament/clear-all', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        // Logic to clear all tournaments and participants
        const tournamentId = request.body.tournamentId;
        await fastify.dbTournament.deleteTournament(tournamentId);
        reply.send({ status: 'success', message: 'All tournaments cleared successfully' });
    });

    fastify.put('/tournament/clear-participants', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const { tournamentId } = request.body;

        // Logic to clear participants from a tournament
        await fastify.dbTournament.clearTournamentParticipants(tournamentId);
        reply.send({ status: 'success', message: 'Participants cleared successfully' });
    });
}

export default fp(tournamentRoute)