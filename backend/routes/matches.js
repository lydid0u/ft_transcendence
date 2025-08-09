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
    
    // Obtenir l'ID de l'utilisateur à partir du token JWT
    const userId = request.user.id;
    
    // Obtenir les informations de l'utilisateur via son ID
    const user = await fastify.db.connection.get('SELECT * FROM users WHERE id = ?', userId);
    if (!user) {
        return reply.status(404).send({ success: false, message: 'User not found' });
    }
    
    // Si player1 gagne, winner_id = userId, sinon winner_id = null (défaite)
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

    fastify.get('/match-history', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
    {
        const gameMode = request.query.game_mode || request.query.gameType || 'pong';
        
        // Filtrer les matchs par game_mode
        const match = await fastify.db.connection.all(
            'SELECT * FROM matches WHERE (player1_id = ? OR player2_id = ?)', 
            request.user.id, request.user.id
        );
        
        return match;
    })

    fastify.get('/history-details', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
    {
        // const gameMode = request.query.game_mode || request.query.gameType || 'pong';
        
        // Vérifier si dbPong est disponible
        if (!fastify.dbPong) {
            return { matchplayed: 0, victory: 0, defeats: 0, ratio: 0 };
        }
        
        let data;
        try {
            data = await fastify.dbPong.findMatchesFromUser(request.user.id);
        } catch (error) {
            return { matchplayed: 0, victory: 0, defeats: 0, ratio: 0 };
        }
        
        // Traitement des données
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
        // Vérifier si dbPong est disponible
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

    // SNAKE ROUTES

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
        
        // Obtenir l'ID de l'utilisateur à partir du token JWT
        const userId = request.user.id;
        
        // Obtenir les informations de l'utilisateur via son ID
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

    fastify.get('/snake/leaderboard', async (request, reply) => {
        try {
            const limit = request.query.limit || 10;
            const leaderboard = await fastify.dbSnake.getLeaderboard(limit);
            return reply.status(200).send({ success: true, leaderboard });
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return reply.status(500).send({ success: false, error: 'Failed to retrieve leaderboard' });
        }
    });
}
    
export default fp(matchesRoutes);