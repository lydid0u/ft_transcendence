// import fastify from 'fastify';
// import fs from 'fs'


// async function tableMatches(fastify, options)
// {
//     const dbMatches = 
//     {
//         async createTableMatches()
//         {
//             await fastify.db.connection.run(
//                 `CREATE TABLE matches (
//                     id INTEGER PRIMARY KEY AUTOINCREMENT,
//                     player1_id INTEGER,
//                     player2_id INTEGER,
//                     winner_id INTEGER,
//                     score_player1 INTEGER,
//                     score_player2 INTEGER,
//                     played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//                     FOREIGN KEY (player1_id) REFERENCES users(id),
//                     FOREIGN KEY (player2_id) REFERENCES users(id),
//                     FOREIGN KEY (winner_id) REFERENCES users(id));`)
//         }
//     }
//     fastify.decorate('dbMatches', dbMatches);
//     await dbMatches.createTableMatches();
// };

// export default fp(tableMatches);