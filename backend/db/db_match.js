import fastify from 'fastify';
import fs from 'fs'
import fp from 'fastify-plugin'

async function tableMatches(fastify, options)
{
    const dbMatches = 
    {
        async createTableMatches()
        {
            try {
                await fastify.db.connection.run(
                    `CREATE TABLE IF NOT EXISTS matches (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        player1_id INTEGER,
                        player2_id INTEGER,
                        player1_name TEXT,
                        player2_name TEXT,
                        winner_id INTEGER,
                        score_player1 INTEGER,
                        score_player2 INTEGER,
                        game_mode TEXT,
                        played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (player1_id) REFERENCES users(id),
                        FOREIGN KEY (player2_id) REFERENCES users(id),
                        FOREIGN KEY (winner_id) REFERENCES users(id));`
                );
            } catch (error) {
                console.error('Error creating matches table:', error);
            }
        }, 

        async createTableSnake()
        {
            try {
                await fastify.db.connection.run(
                    `CREATE TABLE IF NOT EXISTS snake (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        player_id INTEGER,
                        player_name TEXT,
                        score INTEGER,
                        game_mode TEXT,
                        played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (player_id) REFERENCES users(id));`
                );
            } catch (error) {
                console.error('Error creating snake table:', error);
            }
        }
    };
    fastify.decorate('dbMatches', dbMatches);
    await dbMatches.createTableMatches();
    await dbMatches.createTableSnake();
};

export default fp(tableMatches)