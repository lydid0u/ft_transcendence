import fastify from 'fastify'
import fp from 'fastify-plugin';
import fs from 'fs'

async function tableFriends(fastify, options)
{
    const dbFriends = {

        async createTableFriends()
        {
            await fastify.db.connection.run(
                `CREATE TABLE IF NOT EXISTS friends (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    friend_id INTEGER,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (friend_id) REFERENCES users(id)
                )`)
        },

       async showTableFriends() 
       {
            console.log("Récupération de tous les amis");
    
            const friends = await fastify.db.connection.all(`
                SELECT 
                    f.id, 
                    f.user_id, 
                    f.friend_id,
                    u.username, 
                    u.email
                FROM 
                    friends f
                JOIN 
                    users u ON f.friend_id = u.id
            `);
    
            console.log("Amis trouvés:", friends.length);
            return { status: 'success', friends: friends };
        },

        async addFriends(request, friend_nickname)
        {
            const friend_id = await fastify.db.connection.get('SELECT id FROM users WHERE nickname = ?', friend_nickname);
            await fastify.db.connection.run('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)', request.user.id, friend_id.id);
        },

        async deletefriend(request, friend_delete)
        {
            const friend_id = await fastify.db.connection.get('SELECT id FROM users WHERE nickname = ?', friend_delete);
            if (friend_id) {
                await fastify.db.connection.run('DELETE FROM friends WHERE user_id = ? AND friend_id = ?', request.user.id, friend_id.id);
            } else {
                console.error(`Friend with nickname ${friend_delete} not found.`);
            }
        }
    }
    fastify.decorate('dbFriends', dbFriends);
    await dbFriends.createTableFriends();
}
export default fp(tableFriends);