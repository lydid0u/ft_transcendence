import fp from 'fastify-plugin'

async function tableMatches(fastify, options)
{
    const dbTournament = 
    {
        async createTournamentTable()
        {
            try {
                await fastify.db.connection.run(
                    `CREATE TABLE IF NOT EXISTS tournaments (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        creator_id INTEGER NOT NULL,
                        status TEXT DEFAULT 'open',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (creator_id) REFERENCES users(id));`
                );
            } catch (error) {
                // console.error('Error creating tournaments table:', error);
            }
        },
        
        async createTournamentParticipantsTable()
        {
            try {
                await fastify.db.connection.run(
                    `CREATE TABLE IF NOT EXISTS tournament_participants (
                        tournament_id INTEGER,
                        user_id INTEGER,
                        username TEXT,
                        alias TEXT,
                        PRIMARY KEY (tournament_id, user_id),
                        FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
                        FOREIGN KEY (user_id) REFERENCES users(id));`
                );
            } catch (error) {
                // console.error('Error creating tournament_participants table:', error);
            }
        },

        async createTournament(creatorId)
        {
            try {
                await fastify.db.connection.run(
                    `INSERT INTO tournaments (creator_id)
                     VALUES (?);`, [creatorId]);
                const tournamentId = await fastify.db.connection.get('SELECT id FROM tournaments WHERE creator_id = ?', [creatorId]);
                const user = await fastify.db.connection.get('SELECT username FROM users WHERE id = ?', [creatorId]);
                await fastify.db.connection.run(
                    `INSERT INTO tournament_participants (tournament_id, user_id, username)
                     VALUES (?, ?, ?);`, [tournamentId.id, creatorId, user.username]);
                return tournamentId;
            } catch (error) {
                // console.error('Error in createTournament:', error);
                throw error;
            }
        },

        async joinPlayerToTournament(tournamentId, userId) 
        {
            try {
                const tournament = await fastify.dbTournament.getTournamentById(tournamentId);
                if (!tournament) {
                    throw new Error('Tournament not found');
                }
                const alreadyJoined = await fastify.db.connection.get(
                    `SELECT * FROM tournament_participants
                    WHERE tournament_id = ? AND user_id = ?;`, [tournamentId, userId]);
                if (alreadyJoined) {
                    return true;
                }
                const idDifferentfromCreator = await fastify.db.connection.get('SELECT creator_id FROM tournaments WHERE id = ?', [tournamentId]);
                if (idDifferentfromCreator.creator_id != userId) {
                    throw new Error('You cannot join that tournament as you are not the creator');
                }
                const user = await fastify.db.connection.get('SELECT username FROM users WHERE id = ?', [userId]);
                await fastify.db.connection.run(
                    `INSERT INTO tournament_participants (tournament_id, user_id, username)
                    VALUES (?, ?, ?);`, [tournamentId, userId, user.username]);
                return true;
            } catch (error) {
                // console.error('Error in joinPlayerToTournament:', error);
                throw error;
            }
        },

        async addPlayerToTournament(tournamentId, userId)
        {
            try {
                const tournament = await fastify.dbTournament.getTournamentById(tournamentId);
                if (!tournament) {
                    throw new Error('Tournament not found');
                }
                const alreadyJoined = await fastify.db.connection.get(
                    `SELECT * FROM tournament_participants
                    WHERE tournament_id = ? AND user_id = ?;`, [tournamentId, userId]);
                if (alreadyJoined) {
                    return true;
                }
                const participantCount = await fastify.db.connection.get(
                    'SELECT COUNT(*) as count FROM tournament_participants WHERE tournament_id = ?', 
                    [tournamentId]
                );
                if (participantCount.count >= 4) {
                    throw new Error('Tournament is already full with 4 participants');
                }
                const user = await fastify.db.connection.get('SELECT username FROM users WHERE id = ?', [userId]);
                await fastify.db.connection.run(
                    `INSERT INTO tournament_participants (tournament_id, user_id, username)
                    VALUES (?, ?, ?);`, [tournamentId, userId, user.username]);
                return true;
            } catch (error) {
                // console.error('Error in addPlayerToTournament:', error);
                throw error;
            }
        },

        async addAliasToTournament(tournamentId, alias)
        {
            try {
                const tournament = await fastify.dbTournament.getTournamentById(tournamentId);
                if (!tournament) {
                    throw new Error('Tournament not found');
                }
                const participants = await fastify.db.connection.all(
                    'SELECT COUNT(*) as count FROM tournament_participants WHERE tournament_id = ?', 
                    [tournamentId]
                );
                if (participants[0].count >= 4) {
                    throw new Error('Tournament is already full with 4 participants');
                }
                await fastify.db.connection.run(
                    `INSERT INTO tournament_participants (tournament_id, alias)
                    VALUES (?, ?);`, 
                    [tournamentId, alias]
                );
                return true;
            } catch (error) {
                // console.error('Error in addAliasToTournament:', error);
                throw error;
            }
        },
        
        async addAliasToParticipant(tournamentId, alias)
        {
            try {
                const tournament = await fastify.dbTournament.getTournamentById(tournamentId);
                if (!tournament) {
                    throw new Error('Tournament not found');
                }
                const aliasExists = await fastify.db.connection.get(
                    `SELECT * FROM tournament_participants 
                     WHERE tournament_id = ? AND (alias = ? OR username = ?);`, 
                    [tournamentId, alias, alias]
                );
                if (aliasExists) {
                    console.log('Alias already exists in tournament');
                    // throw new Error('This alias is already used in this tournament2');
                }
                const participantCount = await fastify.db.connection.get(
                    'SELECT COUNT(*) as count FROM tournament_participants WHERE tournament_id = ?', 
                    [tournamentId]
                );
                if (participantCount.count >= 4) {
                    throw new Error('Tournament is already full with 4 participants');
                }
                await fastify.db.connection.run(
                    `INSERT INTO tournament_participants (tournament_id, alias)
                    VALUES (?, ?);`, 
                    [tournamentId, alias]
                );
                return true;
            } catch (error) {
                // console.error('Error in addAliasToParticipant:', error);
                throw error;
            }
        },

        async addUsernameToParticipant(tournamentId, username)
        {
            try {
                const tournament = await fastify.dbTournament.getTournamentById(tournamentId);
                if (!tournament) {
                    throw new Error('Tournament not found');
                }
                const usernameExists = await fastify.db.connection.get(
                    `SELECT * FROM tournament_participants 
                     WHERE tournament_id = ? AND (alias = ? OR username = ?);`, 
                    [tournamentId, username, username]
                );
                if (usernameExists) {
                    throw new Error('This account is already used in this tournament');
                }
                const participantCount = await fastify.db.connection.get(
                    'SELECT COUNT(*) as count FROM tournament_participants WHERE tournament_id = ?', 
                    [tournamentId]
                );
                if (participantCount.count >= 4) {
                    throw new Error('Tournament is already full with 4 participants');
                }
                await fastify.db.connection.run(
                    `INSERT INTO tournament_participants (tournament_id, username)
                    VALUES (?, ?);`, 
                    [tournamentId, username]
                );
                return true;
            } catch (error) {
                // console.error('Error in addUsernameToParticipant:', error);
                throw error;
            }
        },

        async getUsernameByEmail(email)
        {
            try {
                // console.log('Fetching username for email:', email);
                const user = await fastify.db.connection.get('SELECT username FROM users WHERE email = ?', [email]);
                if (!user) {
                    throw new Error('User not found');
                }
                return user.username;
            } catch (error) {
                // console.error('Error in getUsernameByEmail:', error);
                throw error;
            }
        },

        async removePlayerFromTournament(tournamentId, userId)
        {
            try {
                await fastify.db.connection.run(
                    `DELETE FROM tournament_participants
                     WHERE tournament_id = ? AND user_id = ?;`, [tournamentId, userId]);
            } catch (error) {
                // console.error('Error in removePlayerFromTournament:', error);
                throw error;
            }
        },

        async deleteTournament(tournamentId)
        {
            try {
                await fastify.db.connection.run(
                    `DELETE FROM tournaments
                     WHERE id = ?;`, [tournamentId]);
                await fastify.db.connection.run(
                    `DELETE FROM tournament_participants
                     WHERE tournament_id = ?;`, [tournamentId]);
            } catch (error) {
                // console.error('Error in deleteTournament:', error);
                throw error;
            }
        },

        async clearTournamentParticipants(tournamentId)
        {
            try {
                await fastify.db.connection.run(
                    `DELETE FROM tournament_participants
                     WHERE tournament_id = ?;`, [tournamentId]);
            } catch (error) {
                // console.error('Error in clearTournamentParticipants:', error);
                throw error;
            }
        },

        async getTournamentParticipants(tournamentId)
        {
            try {
                return await fastify.db.connection.all(
                    `SELECT user_id FROM tournament_participants
                     WHERE tournament_id = ?;`, [tournamentId]);
            } catch (error) {
                // console.error('Error in getTournamentParticipants:', error);
                return [];
            }
        },

        async getTournamentById(tournamentId)
        {
            try {
                return await fastify.db.connection.get(
                    `SELECT * FROM tournaments
                     WHERE id = ?;`, [tournamentId]);
            } catch (error) {
                // console.error('Error in getTournamentById:', error);
                return null;
            }
        },

        async getTournamentByCreatorId(creatorId)
        {
            try {
                return await fastify.db.connection.get(
                    `SELECT * FROM tournaments
                     WHERE creator_id = ?;`, [creatorId]);
            } catch (error) {
                // console.error('Error in getTournamentByCreatorId:', error);
                return null;
            }
        },

        async getAllTournaments()
        {
            try {
                return await fastify.db.connection.all(
                    `SELECT * FROM tournaments;`);
            } catch (error) {
                // console.error('Error in getAllTournaments:', error);
                return [];
            }
        },

        async getAllParticipants(userId)
        {
            try {
                const t_id = await this.getTournamentByCreatorId(userId);
                if (!t_id) {
                    return [];
                }
                return await fastify.db.connection.all(
                    `SELECT * FROM tournament_participants
                     WHERE tournament_id = ?;`, [t_id.id]);
            } catch (error) {
                // console.error('Error in getAllParticipants:', error);
                return [];
            }
        },

        async getAllOpenTournaments() {
            try {
                const test = await fastify.db.connection.all(
                    `SELECT t.*, u.username as creator_name
                    FROM tournaments t
                    LEFT JOIN users u ON t.creator_id = u.id
                    WHERE t.status = 'open';`);
                return test;
            } catch (error) {
                // console.error('Error in getAllOpenTournaments:', error);
                return [];
            }
        }
    };
    fastify.decorate('dbTournament', dbTournament);
    await dbTournament.createTournamentTable();
    await dbTournament.createTournamentParticipantsTable();
};

export default fp(tableMatches);