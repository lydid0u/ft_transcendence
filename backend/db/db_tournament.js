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
                    id INTEGER PRIMARY KEY AUTOINCREMENT, -- UUID comme identifiant unique
                    creator_id INTEGER NOT NULL,
                    status TEXT DEFAULT 'open', -- 'open', 'ongoing', 'completed'
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (creator_id) REFERENCES users(id));`)
        },
        
        async createTournamentParticipantsTable()
        {
            await fastify.db.connection.run(
                `CREATE TABLE IF NOT EXISTS tournament_participants (
                    tournament_id INTEGER,
                    user_id INTEGER,
                    alias TEXT,
                    PRIMARY KEY (tournament_id, user_id),
                    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
                    FOREIGN KEY (user_id) REFERENCES users(id));`)
        },

        async createTournament(creatorId)
        {
            await fastify.db.connection.run(
                `INSERT INTO tournaments (creator_id)
                 VALUES (?);`, [creatorId]);
            const tournamentId = await fastify.db.connection.get('SELECT id FROM tournaments WHERE creator_id = ?', [creatorId]);
            await fastify.db.connection.run(
                `INSERT INTO tournament_participants (tournament_id, user_id)
                 VALUES (?, ?);`, [tournamentId.id, creatorId]);
            return (tournamentId);
        },

        async addPlayerToTournament(tournamentId, userId) 
        {
            // Vérifier si le tournoi existe
            const tournament = await fastify.dbTournament.getTournamentById(tournamentId);
            if (!tournament) {
                throw new Error('Tournament not found');
            }
            
            // Vérifier si l'utilisateur a déjà rejoint le tournoi
            const alreadyJoined = await fastify.db.connection.get(
                `SELECT * FROM tournament_participants
                WHERE tournament_id = ? AND user_id = ?;`, [tournamentId, userId]);
            if (alreadyJoined) {
                throw new Error('User already joined the tournament');
            }
            
            // Vérifier si le tournoi est plein
            const participants = await fastify.dbTournament.getTournamentParticipants(tournamentId);
            if (participants.length >= (tournament.maxParticipants || 4)) {
                throw new Error('Tournament is full');
            }
            
            // Ajouter le joueur au tournoi
            await fastify.db.connection.run(
                `INSERT INTO tournament_participants (tournament_id, user_id)
                VALUES (?, ?);`, [tournamentId, userId]);
                
            return true;
        },

        async addAliasToTournament(tournamentId, alias)
        {
            // Vérifier si le tournoi existe
            const tournament = await fastify.dbTournament.getTournamentById(tournamentId);
            if (!tournament) {
                throw new Error('Tournament not found');
            }
            
            // Vérifier si le tournoi est plein (maximum 4 participants)
            const participants = await fastify.db.connection.all(
                'SELECT COUNT(*) as count FROM tournament_participants WHERE tournament_id = ?', 
                [tournamentId]
            );
            
            if (participants[0].count >= 4) {
                throw new Error('Tournament is already full with 4 participants');
            }
            
            // Ajouter l'alias au tournoi
            await fastify.db.connection.run(
                `INSERT INTO tournament_participants (tournament_id, alias)
                VALUES (?, ?);`, 
                [tournamentId, alias]
            );
            return true;
        },
        
        async addAliasToParticipant(tournamentId, alias)
        {
            // Vérifier si le tournoi existe
            const tournament = await fastify.dbTournament.getTournamentById(tournamentId);
            if (!tournament) {
                throw new Error('Tournament not found');
            }
            
            // Vérifier si l'alias existe déjà dans ce tournoi
            const aliasExists = await fastify.db.connection.get(
                `SELECT * FROM tournament_participants 
                 WHERE tournament_id = ? AND alias = ?`, 
                [tournamentId, alias]
            );
            
            if (aliasExists) {
                throw new Error('This alias is already used in this tournament');
            }
            
            // Vérifier si le tournoi est plein (maximum 4 participants)
            const participantCount = await fastify.db.connection.get(
                'SELECT COUNT(*) as count FROM tournament_participants WHERE tournament_id = ?', 
                [tournamentId]
            );
            
            if (participantCount.count >= 4) {
                throw new Error('Tournament is already full with 4 participants');
            }
            
            // Ajouter l'alias au tournoi
            await fastify.db.connection.run(
                `INSERT INTO tournament_participants (tournament_id, alias)
                VALUES (?, ?);`, 
                [tournamentId, alias]
            );
            
            return true;
        },

        async removePlayerFromTournament(tournamentId, userId)
        {
            await fastify.db.connection.run(
                `DELETE FROM tournament_participants
                 WHERE tournament_id = ? AND user_id = ?;`, [tournamentId, userId]);
        },

        async deleteTournament(tournamentId)
        {
            await fastify.db.connection.run(
                `DELETE FROM tournaments
                 WHERE id = ?;`, [tournamentId]);
            await fastify.db.connection.run(
                `DELETE FROM tournament_participants
                 WHERE tournament_id = ?;`, [tournamentId]);
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

        async getTournamentParticipantsWithDetails(tournamentId)
        {
            return await fastify.db.connection.all(
                `SELECT tp.user_id as userId, u.username, u.avatar
                 FROM tournament_participants tp
                 JOIN users u ON tp.user_id = u.id
                 WHERE tp.tournament_id = ?;`, [tournamentId]);
        },
        async getTournamentById(tournamentId)
        {
            return await fastify.db.connection.get(
                `SELECT * FROM tournaments
                 WHERE id = ?;`, [tournamentId]);
        },

        async getTournamentByCreatorId(creatorId)
        {
            return await fastify.db.connection.get(
                `SELECT * FROM tournaments
                 WHERE creator_id = ?;`, [creatorId]);
        },

        async getAllTournaments()
        {
            return await fastify.db.connection.all(
                `SELECT * FROM tournaments;`);
        },

        async getAllParticipants()
        {
            return await fastify.db.connection.all(
                `SELECT * FROM tournament_participants;`);
        },

        async getAllOpenTournaments() {

            const test = await fastify.db.connection.all(
                `SELECT t.*, u.username as creator_name
                FROM tournaments t
                LEFT JOIN users u ON t.creator_id = u.id
                WHERE t.status = 'open';`);
            return test;
        }
    };
    fastify.decorate('dbTournament', dbTournament);
    await dbTournament.createTournamentTable();
    await dbTournament.createTournamentParticipantsTable();
};

export default fp(tableMatches);