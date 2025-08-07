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
        
        // Utiliser game_type du client mais stocker comme game_mode dans la base
        const gameMode = data.game_type || data.game_mode || 'pong';
        
        try {
            await fastify.db.connection.run('INSERT INTO matches(player1_id, player2_id, winner_id, score_player1, score_player2, game_mode) VALUES (?, ?, ?, ?, ?, ?)',
                data.player1_id, data.player2_id, data.winner_id, data.score_player1, data.score_player2, gameMode);
            
            return { success: true, message: 'Match added successfully' };
        } catch (error) {
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
        const ratio = (victory / data.length) * 100;
        
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
}
    
export default fp(matchesRoutes);