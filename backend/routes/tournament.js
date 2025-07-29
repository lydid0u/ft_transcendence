import fp from 'fastify-plugin'

async function tournamentRoute(fastify, options)
{
    fastify.post('/tournament/join', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const { tournamentId } = request.body;
        const userId = request.user.id;

        // Logic to join the tournament
        await fastify.dbTournament.joinTournament(userId, tournamentId);
        reply.send({ status: 'success', message: 'Joined tournament successfully' });
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
        const tournamentId = await fastify.dbTournament.createTournament(userId);
        reply.send({ status: 'success', data: { tournamentId } });
    });
}

export default fp(tournamentRoute)