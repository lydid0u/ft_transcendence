import fastify from 'fastify'
import fp from 'fastify-plugin';
import fs from 'fs'

async function tableFriends(fastify, options)
{
    const dbFriends = {

        async createTableFriends()
        {
            try {
                await fastify.db.connection.run(
                    `CREATE TABLE IF NOT EXISTS friends (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER,
                        friend_id INTEGER,
                        FOREIGN KEY (user_id) REFERENCES users(id),
                        FOREIGN KEY (friend_id) REFERENCES users(id)
                    )`
                );
            } catch (error) {
                console.error('Error creating friends table:', error);
            }
        },

       async showTableFriends(userId) 
       {
            try {
                console.log("Récupération de tous les amis");
                console.log("User ID:", userId);
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
                    WHERE
                        f.user_id = ?
                `, [userId]);
                console.log("Amis trouvés:", friends.length);
                return { status: 'success', friends: friends };
            } catch (error) {
                console.error('Error fetching friends:', error);
                return { status: 'error', message: 'Failed to fetch friends' };
            }
        },

        async addFriends(request, friend_nickname)
        {
            try {
            console.log("Ajout d'un ami avec le pseudo:", friend_nickname);
            const friend_id = await fastify.db.connection.get('SELECT id FROM users WHERE username = ?', friend_nickname);
            if (!friend_id) {
                return reply.status(404).send({ status: 'error', message: 'Friend not found' });
            }
            const existingFriendship = await fastify.db.connection.get(
                'SELECT * FROM friends WHERE user_id = ? AND friend_id = ?',
                request.user.id, friend_id.id
            );
            if (existingFriendship) {
                return reply.status(409).send({ status: 'error', message: 'Friendship already exists' });
            }
            if (request.user.id === friend_id.id) {
                return reply.status(400).send({ status: 'error', message: 'Cannot add yourself as a friend' });
            }
            await fastify.db.connection.run('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)', request.user.id, friend_id.id);
        } catch (error) {
            console.error('Error adding friend:', error);
            return reply.status(500).send({ status: 'error', message: 'Failed to add friend' });
        }
        }
    }
    fastify.decorate('dbFriends', dbFriends);
    await dbFriends.createTableFriends();
}
export default fp(tableFriends);