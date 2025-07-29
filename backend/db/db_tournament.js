import fastify from 'fastify';
import fs from 'fs'
import fp from 'fastify-plugin'


async function tableMatches(fastify, options)
{
    const dbTournament = 
    {
        async createTournamentTable()
        {
            await fastify.db.connection.run(
                `CREATE TABLE IF NOT EXISTS tournaments (
                    id TEXT PRIMARY KEY, -- UUID comme identifiant unique
                    creator_id INTEGER NOT NULL,
                    status TEXT DEFAULT 'open', -- 'open', 'ongoing', 'completed'
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (creator_id) REFERENCES users(id));`)
        },
        
        async createTournamentParticipantsTable()
        {
            await fastify.db.connection.run(
                `CREATE TABLE IF NOT EXISTS tournament_participants (
                    tournament_id TEXT,
                    user_id INTEGER,
                    PRIMARY KEY (tournament_id, user_id),
                    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
                    FOREIGN KEY (user_id) REFERENCES users(id));`)
        },

        async createTournament(creatorId)
        {
            await fastify.db.connection.run(
                `INSERT INTO tournaments (creator_id)
                 VALUES (?);`, [creatorId]);
            return await fastify.db.connection.get('SELECT id FROM tournaments WHERE creator_id = ?', [creatorId]);
        },

        async addPlayertoTournament(tournamentId, userId)
        {
            await fastify.db.connection.run(
                `INSERT INTO tournament_participants (tournament_id, user_id)
                 VALUES (?, ?);`, [tournamentId, userId]);
        },

        async removePlayerFromTournament(tournamentId, userId)
        {
            await fastify.db.connection.run(
                `DELETE FROM tournament_participants
                 WHERE tournament_id = ? AND user_id = ?;`, [tournamentId, userId]);
        },

        async clearTournamentParticipants(tournamentId)
        {
            await fastify.db.connection.run(
                `DELETE FROM tournament_participants
                 WHERE tournament_id = ?;`, [tournamentId]);
        },

        async getTournamentParticipants(tournamentId)
        {
            return await fastify.db.connection.all(
                `SELECT user_id FROM tournament_participants
                 WHERE tournament_id = ?;`, [tournamentId]);
        },
        async getTournamentById(tournamentId)
        {
            return await fastify.db.connection.get(
                `SELECT * FROM tournaments
                 WHERE id = ?;`, [tournamentId]);
        },
        async getAllOpenTournaments()
        {
            return await fastify.db.connection.all(
                `SELECT * FROM tournaments
                 WHERE status = 'open';`);
        }
    };
    fastify.decorate('dbTournament', dbTournament);
    await dbTournament.createTournamentTable();
    await dbTournament.createTournamentParticipantsTable();
};

export default fp(tableMatches);