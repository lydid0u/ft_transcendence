import fp from 'fastify-plugin'

async function matchesRoutes(fastify, options)
{
    fastify.get('/matches', async (request, reply) =>
    {
        const history = await fastify.db.connection.all('SELECT * FROM matches');
        return history;
    })

    fastify.post('/add-match', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
{
    const data = request.body;
    
    const userId = request.user.id;
    
    const user = await fastify.db.connection.get('SELECT * FROM users WHERE id = ?', userId);
    if (!user) {
        return reply.status(404).send({ success: false, message: 'User not found' });
    }
    
    let winner_id = data.winner === "player1" ? userId : null;
    
    try {
        await fastify.db.connection.run('INSERT INTO matches(player1_id, player1_name, winner_id, score_player1, score_player2, game_mode) VALUES (?, ?, ?, ?, ?, ?)',
            userId, user.username, winner_id, data.player1_score, data.player2_score, data.game_type);
        
        if (winner_id === null) {
            console.log('Match recorded as a defeat for player1');
        } else {
            console.log('Match recorded as a victory for player1');
        }
        
        return reply.status(200).send({ 
            success: true, 
            message: winner_id ? 'Victory recorded successfully' : 'Defeat recorded successfully' 
        });
    } catch (error) {
        console.error('Error adding match:', error);
        return reply.status(400).send({ success: false, error: error.message });
    }
})

    fastify.get('/match-history', {preValidation: [fastify.prevalidate]}, async (request, reply) => {
    
        const matches = await fastify.db.connection.all(
                'SELECT * FROM matches WHERE (player1_id = ? OR player2_id = ?)', 
                request.user.id, request.user.id);
        console.log("Matchs récupérés:", matches);
        return matches;
    })

    fastify.get('/history-details', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
    {
        if (!fastify.dbPong) {
            return { matchplayed: 0, victory: 0, defeats: 0, ratio: 0 };
        }
        
        let data;
        try {
            data = await fastify.dbPong.findMatchesFromUser(request.user.id);
        } catch (error) {
            return { matchplayed: 0, victory: 0, defeats: 0, ratio: 0 };
        }

        if (!data || data.length === 0) {
            return { matchplayed: 0, victory: 0, defeats: 0, ratio: 0 };
        }
        
        const victory = data.filter(m => m.winner_id === request.user.id).length; 
        const defeats = data.length - victory;
        const matchplayed = data.length;
        const ratio = Math.round((victory / data.length) * 100);
        
        return { matchplayed, victory, defeats, ratio };
    })

    fastify.delete('/delete-all', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
    {
        if (!fastify.dbPong) {
            return { success: false, message: 'Database not available' };
        }
        
        try {
            await fastify.dbPong.deleteAllMatchesFromUser(request.user.id);
            return { success: true, message: 'All matches deleted successfully' };
        } catch (error) {
            return reply.status(400).send({ success: false, error: error.message });
        }
    });


    fastify.get('/snake/high-score', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
    {
        try {
            const highScore = await fastify.dbSnake.findHighScoreOfUser(request.user.id);
            return reply.status(200).send({ highScore });
        } catch (error) {
            return reply.status(500).send({ error: 'Failed to retrieve high score' });
        }
    });

    fastify.get('/snake/nearest-score', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
    {
        // globalBest
        // nextScore
        // playerRank
        console.log('Fetching nearest score to beat for user:', request.user.id);
        try {
            const nextScore = await fastify.dbSnake.findNearestScoreToBeat(request.user.id);
            const globalBest = await fastify.dbSnake.findHighScoreOfUser(request.user.id);
            const playerRank = await fastify.dbSnake.getPlayerRank(request.user.id);
            return reply.status(200).send({ nextScore, globalBest, playerRank });
        } catch (error) {
            return reply.status(500).send({ error: 'Failed to retrieve nearest score' });
        }
    });

    fastify.post('/snake/add-score', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
    {
        const game = request.body;
        
        const userId = request.user.id;
        
        const user = await fastify.db.connection.get('SELECT * FROM users WHERE id = ?', userId);
        if (!user) {
            return reply.status(404).send({ success: false, message: 'User not found' });
        }
        
        try {
            await fastify.dbSnake.addScoreToDB({
                playerId: userId,
                playerName: user.username,
                score: game.score,
                gameMode: game.gameMode
            });
            return reply.status(200).send({ success: true, message: 'Score added successfully' });
        } catch (error) {
            console.error('Error adding score:', error);
            return reply.status(400).send({ success: false, error: error.message });
        }
    });

    fastify.get('/snake/player-stats/:userId', async (request, reply) => {
        try {
            const userId = parseInt(request.params.userId);
            
            const user = await fastify.db.connection.get('SELECT username FROM users WHERE id = ?', userId);
            if (!user) {
                return reply.status(404).send({ success: false, message: 'User not found' });
            }
            
            const playCount = await fastify.db.connection.get(
                'SELECT COUNT(*) as count FROM snake WHERE player_id = ?',
                userId
            );
            
            const bestScore = await fastify.dbSnake.findHighScoreOfUser(userId);
            
            const rank = await fastify.dbSnake.getPlayerRank(userId);
            
            const nextScoreToBeat = await fastify.dbSnake.findNearestScoreToBeat(userId);
            
            return reply.status(200).send({
                player_id: userId,
                username: user.username,
                best_score: bestScore,
                play_count: playCount.count,
                rank: rank,
                next_score_to_beat: nextScoreToBeat
            });
        } catch (error) {
            console.error('Error getting player stats:', error);
            return reply.status(500).send({ success: false, error: 'Failed to retrieve player stats' });
        }
    });

    fastify.get('/snake/player-history/:userId', async (request, reply) => {
        try {
            const userId = parseInt(request.params.userId);
            
            const history = await fastify.db.connection.all(
                'SELECT player_id, score, played_at as played_at FROM snake WHERE player_id = ? ORDER BY played_at DESC LIMIT 10',
                userId
            );
            
            return reply.status(200).send(history);
        } catch (error) {
            console.error('Error getting player history:', error);
            return reply.status(500).send({ success: false, error: 'Failed to retrieve player history' });
        }
    });

    fastify.get('/snake/leaderboard', async (request, reply) => {
        try {
            const leaderboard = await fastify.db.connection.all(
                `SELECT s.player_id, u.username, s.max_score as best_score, 
                (SELECT COUNT(*) FROM (SELECT player_id, MAX(score) as max_score FROM snake GROUP BY player_id) s2 
                WHERE s2.max_score > s.max_score) + 1 as rank
                FROM (SELECT player_id, MAX(score) as max_score FROM snake GROUP BY player_id) s
                JOIN users u ON s.player_id = u.id
                ORDER BY s.max_score DESC
                LIMIT 10`
            );
            
            return reply.status(200).send(leaderboard);
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return reply.status(500).send({ success: false, error: 'Failed to retrieve leaderboard' });
        }
    });
}
    
export default fp(matchesRoutes);