import fastify from 'fastify';
import fp from 'fastify-plugin'
import db from './db.js';

async function utilsDbFunc(fastify, options)
{
    const utilsDb =
    {
        async checkEmail(email)
        {
            const user = await fastify.db.connection.get('SELECT * FROM users WHERE email = ?', email);
            return user
        },
        async checkUsername(username)
        {
            const user = await fastify.db.connection.get('SELECT * FROM users WHERE username = ?', username);
            return user;    
        }
    } 
    fastify.decorate('utilsDb', utilsDb);
}
export default fp(utilsDbFunc);