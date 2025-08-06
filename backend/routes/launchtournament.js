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
        const {player1_name: name_player1, player2_name: name_player2, player1_score: score_player1, player2_score: score_player2 } = request.body;
        const userId = request.user.id;
        console.log("Received match results:", name_player1, name_player2, score_player1, score_player2);
        try {
            const tournament = await fastify.dbTournament.getTournamentByCreatorId(userId);
            if (!tournament) {
                return reply.status(404).send({ error: 'Tournament not found' });
            }
            if (score_player1 > score_player2) {
                console.log ("Player 1 wins");
                    const user_one = await fastify.utilsDb.getUserByUsername(name_player1);
                    const user_two = await fastify.utilsDb.getUserByUsername(name_player2);
                    if (!user_one && !user_two) {
                        return reply.status(200).send({ message: 'Users are not registered' });
                    }
                    await fastify.db.connection.run('INSERT INTO matches (player1_id, player2_id, player1_name, player2_name, score_player1, score_player2, winner_id, game_mode) VALUES (?, ?, ?, ?, ?, ?, ?)', user_one.id, user_two.id, user_one.username, user_two.username, score_player1, score_player2, user_one.id, tournament.game_mode);
                }
            else if (score_player2 > score_player1) {
                    const user_one = await fastify.utilsDb.getUserByUsername(name_player1);
                    const user_two = await fastify.utilsDb.getUserByUsername(name_player2);
                    if (!user_one && !user_two) {
                        return reply.status(404).send({ error: 'Users not found' });
                    }
                    await fastify.db.connection.run('INSERT INTO matches (player1_id, player2_id, player1_name, player2_name, score_player1, score_player2, winner_id, game_mode) VALUES (?, ?, ?, ?, ?, ?, ?)', user_one.id, user_two.id, user_one.username, user_two.username, score_player1, score_player2, user_two.id, tournament.game_mode);
                } else {
                    return reply.status(400).send({ error: 'Scores cannot be equal' });
                }
        } catch (error) {
            return reply.status(400).send({ error: 'Bad Request' });
        }
    });
}

export default fp(tournamentLaunchRoute)