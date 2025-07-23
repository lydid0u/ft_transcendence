import fastify from 'fastify';
import fs from 'fs'
import fp from 'fastify-plugin'


async function tableMatches(fastify, options)
{
    const dbPong =
    {
        async findMatchesFromUser(userId, gameMode = 'pong')
        {
            try {
                // Récupérez les matchs filtrés par game_mode
                const matches = await fastify.db.connection.all(
                    'SELECT * FROM matches WHERE (player1_id = ? OR player2_id = ?) AND game_mode = ?', 
                    userId, userId, gameMode
                );
                
                return matches;
            } catch (error) {
                return [];
            }
        }

    }
    fastify.decorate('dbPong', dbPong);
};

export default fp(tableMatches);