import fp from 'fastify-plugin'

async function tournamentLaunchRoute(fastify, options)
{
    fastify.get('/tournament/get-match', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
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
            console.error('Error in /tournament/get-match:', error);
            return reply.status(400).send({ error: 'Bad Request' });
        }
    });

    fastify.post('/tournament/send-match-results', {preValidation: [fastify.prevalidate]}, async (request, reply) =>
    {
        const match = request.body;
        const userId = request.user.id;
        try {
            const checkparticipants = await fastify.dbMatchData.checkParticipantsInMatch(match, userId);
            if (!checkparticipants) {
                return reply.status(404).send({ error: 'One or both players not found in tournament' });
            }
            const user_one = await fastify.utilsDb.getUserByUsername(match.player1_name);
            const user_two = await fastify.utilsDb.getUserByUsername(match.player2_name);
            if(!user_one && !user_two)
            {
                return reply.status(200).send({ message: 'Match results sent successfully' });
            }
            await fastify.dbMatchData.createMatch(match, user_one, user_two);
            return reply.send({ message: 'Match results sent successfully' });
        } catch (error) {
            console.error("Error in /tournament/send-match-results:", error);
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
            console.error("Error in /tournament/delete-losers:", error);
            return reply.status(400).send({ error: 'Bad Request' });
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
                return reply.status(200).send({ message: 'No winner found for this tournament' });
            }
        } catch (error) {
            console.error("Error in /tournament/find-winner:", error);
            return reply.status(400).send({ error: 'Bad Request' });
        }
    });
}

export default fp(tournamentLaunchRoute);