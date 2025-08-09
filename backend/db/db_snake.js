import fp from 'fastify-plugin'


async function tableSnake(fastify, options)
{
    const dbSnake =
    {
        async findHighScoreOfUser(userId)
        {
            try {
                const result = await fastify.db.connection.get(
                    'SELECT MAX(score) as score FROM snake WHERE player_id = ?',
                    userId
                );
                return result.score || 0;
            } catch (error) {
                return 0;
            }
        },

        async findNearestScoreToBeat(userId) {
            try {
                // Trouver le meilleur score du joueur
                const highScore = await this.findHighScoreOfUser(userId);
                
                // Trouver le score le plus bas qui est supérieur au meilleur score du joueur
                const result = await fastify.db.connection.get(
                    'SELECT MIN(s.score) as next_score FROM (SELECT MAX(score) as score FROM snake GROUP BY player_id) s WHERE s.score > ?',
                    highScore
                );
                
                return result?.next_score || 0;
            } 
            catch (error) {
                console.error('Error finding nearest score to beat:', error);
                return 0;
            }
        },

        async addScoreToDB(game)
        {
            try {
                const userId = game.playerId;
                const userName = game.playerName;
                const score = game.score;
                const gameMode = game.gameMode;

                // Insérer le score dans la base de données
                await fastify.db.connection.run(
                    'INSERT INTO snake (player_id, player_name, score, game_mode) VALUES (?, ?, ?, ?)',
                    userId, userName, score, gameMode
                );
            } catch (error) {
                console.error('Error adding score to database:', error);
            }
        }
    }
    fastify.decorate('dbSnake', dbSnake);
};

export default fp(tableSnake);