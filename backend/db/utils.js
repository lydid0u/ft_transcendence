import fp from 'fastify-plugin'

async function utilsDbFunc(fastify, options)
{
    const utilsDb =
    {
        async getOneUser(email)
        {
            try {
                const user = await fastify.db.connection.get('SELECT * FROM users WHERE email = ?', email);
                return user;
            } catch (error) {
                console.error('Error in getOneUser:', error);
                return null;
            }
        },

        async getUserByUsername(username)
        {
            try {
                const user = await fastify.db.connection.get('SELECT * FROM users WHERE username = ?', username);
                return user;
            } catch (error) {
                console.error('Error in getUserByUsername:', error);
                return null;
            }
        },

        async checkEmail(email)
        {
            try {
                const user = await fastify.db.connection.get('SELECT * FROM users WHERE email = ?', email);
                return user;
            } catch (error) {
                console.error('Error in checkEmail:', error);
                return null;
            }
        },

        async checkUsername(username)
        {
            try {
                const user = await fastify.db.connection.get('SELECT * FROM users WHERE username = ?', username);
                return user;    
            } catch (error) {
                console.error('Error in checkUsername:', error);
                return null;
            }
        }
    } 
    fastify.decorate('utilsDb', utilsDb);
}
export default fp(utilsDbFunc);