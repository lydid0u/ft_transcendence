import fp from 'fastify-plugin'

async function matchesRoutes(fastify, options)
{
    fastify.get('/matches', async (request, reply) =>
    {
        const history = await fastify.db.connection.all('SELECT * FROM matches');
        console.log("HERE TRYING");
        return history;
    })

    fastify.post('/add-match', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
    {
        const data = request.body;
        console.log(data);
        await fastify.db.connection.run('INSERT INTO matches(uuid, player1_id, player2_id, winner_id, score_player1, score_player2) VALUES (?, ?, ?, ?, ?, ?)',
            data.uuid, data.player1_id, data.player2_id, data.winner_id, data.score_player1, data.score_player2);
    })

    fastify.get('/match-history', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
    {
        const data = request.body;
        console.log(data)
        const match = await fastify.db.connection.all('SELECT * FROM matches WHERE player1_id = ? OR player2_id', request.user.id, request.user.id);
        return match;
    })

    fastify.get('/history-details', {preValidation : [fastify.prevalidate]}, async (request, reply) =>
    {
        const data = await fastify.db.connection.all('SELECT * FROM matches WHERE player1_id = ? OR player2_id', request.user.id, request.user.id);
        const victory = data.filter(m => m.winner_id === request.user.id).length; 
        const defeats = data.length - victory;
        const matchplayed = data.length;
        const ratio = (victory / data.length) * 100;
        return ({matchplayed, victory, defeats, ratio});
    })
}
    
export default fp(matchesRoutes);