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

    fastify.post('/tournament/send-match-results', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        // const {player1_name: name_player1, player2_name: name_player2, player1_score: score_player1, player2_score: score_player2 } = request.body;
        const match = request.body;
        console
        const userId = request.user.id;
        try {
            const user_one = await fastify.utilsDb.getUserByUsername(match.player1_name);
            const user_two = await fastify.utilsDb.getUserByUsername(match.player2_name);

            await fastify.dbMatchData.createMatch(match, user_one, user_two);
            return reply.send({ message: 'Match results sent successfully' });
        } catch (error) {
            return reply.status(400).send({ error: 'Bad Request' });
        }
    });

    fastify.delete('/tournament/delete-losers', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const match = request.body;
        try {
            const deleted = await fastify.dbMatchData.deleteLosers(match);
            if (deleted) {
                return reply.send({ message: 'Losers deleted successfully' });
            } else {
                return reply.status(404).send({ error: 'No losers found to delete' });
            }
        } catch (error) {
            return reply.status(450).send({ error: 'Bad Request' });
        }
    });

    fastify.get('/tournament/find-winner', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const {tournament_id} = request.query;
        console.log("Finding winner for tournament ID:", tournament_id);
        try {
            const winner = await fastify.dbMatchData.findWinnerOfTournament(tournament_id);
            if (winner) {
                return reply.send({ winner });
            } else {
                return reply.status(404).send({ error: 'No winner found for this tournament' });
            }
        } catch (error) {
            return reply.status(450).send({ error: 'Bad Request' });
        }
    });
}

export default fp(tournamentLaunchRoute)