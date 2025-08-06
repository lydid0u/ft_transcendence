import fp from 'fastify-plugin'

async function tournamentLaunchRoute(fastify, options)
{
    fastify.get('/tournament/get-match', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        // const { tournamentId } = request.body;
        const userId = request.user.id;
        try {
            const tournament = await fastify.dbTournament.getTournamentByCreatorId(userId);
            console.log(tournament);
            if (!tournament) {
                return reply.status(404).send({ error: 'Tournament not found' });
            }
            const match = await fastify.dbMatchData.getMatchNamesForTournament(tournament.id);
            if (!match) {
                return reply.status(404).send({ error: 'No matches found for this tournament' });
            }
            return reply.send({ match });
        } catch (error) {
            return reply.status(450).send({ error: 'Bad Request' });
        }
    });
}

export default fp(tournamentLaunchRoute)