import fp from 'fastify-plugin'

async function matchesRoutes(fastify, options)
{
    fastify.get('/matches', async (request, reply) =>
    {

    })

    fastify.post('/add-match', async (request, reply) =>
    {

    })
}

export default fp(matchesRoutes);