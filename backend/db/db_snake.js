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
                const highScore = await this.findHighScoreOfUser(userId);
                const result = await fastify.db.connection.get(
                    'SELECT MIN(s.max_score) as next_score FROM (SELECT player_id, MAX(score) as max_score FROM snake GROUP BY player_id) s WHERE s.max_score > ?',
                    highScore
                );
                console.log('Nearest score to beat:', result);
                return result?.next_score || 0;
            } 
            catch (error) {
                console.error('Error finding nearest score to beat:', error);
                return 0;
            }
        },

        async getPlayerRank(userId) {
            try {
                const rank = await fastify.db.connection.get(
                    `SELECT COUNT(*) as rank FROM 
                     (SELECT player_id, MAX(score) as max_score FROM snake GROUP BY player_id) 
                     WHERE max_score > (SELECT MAX(score) FROM snake WHERE player_id = ?)`,
                    userId
                );
                console.log('Player rank:', rank);
                return rank?.rank + 1 || 0;            
            }
            catch (error) {
                console.error('Error getting player rank:', error);
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
                const currentDate = new Date().toISOString();

                await fastify.db.connection.run(
                    'INSERT INTO snake (player_id, player_name, score, game_mode, played_at) VALUES (?, ?, ?, ?, ?)',
                    userId, userName, score, gameMode, currentDate
                );
            } catch (error) {
                console.error('Error adding score to database:', error);
            }
        },

        async getLeaderboard(limit = 10) {
            try {
                const leaderboard = await fastify.db.connection.all(
                    `SELECT player_id, player_name, MAX(score) as score 
                     FROM snake 
                     GROUP BY player_id 
                     ORDER BY score DESC 
                     LIMIT ?`,
                    limit
                );
                return leaderboard;
            } catch (error) {
                console.error('Error getting leaderboard:', error);
                return [];
            }
        }
    }
    fastify.decorate('dbSnake', dbSnake);
};

export default fp(tableSnake);