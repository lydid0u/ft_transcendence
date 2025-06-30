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
                    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (friend_id) REFERENCES users(id)
                )`)
        },

        async showTableFriends()
        {
            console.log("HERE");
            const friends = await fastify.db.connection.all('SELECT * FROM friends;')
            return friends;
        },

        async addFriends(request, friend_nickname)
        {
            const friend_id = await fastify.db.connection.get('SELECT id FROM users WHERE nickname = ?', friend_nickname);
            await fastify.db.connection.run('INSERT INTO friends (user_id, friend_id, played_at) VALUES (?, ?, ?)', request.user.id, friend_id.id, new Date().toISOString());
        }
    }
    fastify.decorate('dbFriends', dbFriends);
    await dbFriends.createTableFriends();
}

export default fp(tableFriends);