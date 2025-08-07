import fastify from 'fastify';
import fs from 'fs'
import fp from 'fastify-plugin'


async function tableMatches(fastify, options)
{
    const dbPong =
    {
        async findMatchesFromUser(userId)
        {
            try {
                // Récupérez les matchs filtrés par game_mode
                const matches = await fastify.db.connection.all(
                    'SELECT * FROM matches WHERE (player1_id = ? OR player2_id = ?)', 
                    userId, userId
                );
                
                return matches;
            } catch (error) {
                return [];
            }
        },

        async deleteAllMatchesFromUser(userId)
        {
            try {
                // Supprimer tous les matchs de l'utilisateur
                await fastify.db.connection.run(
                    'DELETE FROM matches WHERE player1_id = ? OR player2_id = ?', 
                    userId, userId
                );
            } catch (error) {
                throw new Error('Failed to delete matches: ' + error.message);
            }
        }
    }
    fastify.decorate('dbPong', dbPong);
};

export default fp(tableMatches);