import fastify from 'fastify';
import fs from 'fs'
import fp from 'fastify-plugin'


// interface TournamentMatch {
//   id: number;
//   tournament_id: number;
//   player1_id: number;
//   player2_id: number;
//   player1_name: string;
//   player2_name: string;
//   player1_score: number;
//   player2_score: number;
//   winner_id: number;
//   status: string; // "pending", "in_progress", "completed"
//   created_at: string;
//   updated_at: string;
// }

async function MatchData(fastify, options)
{
    const dbMatchData = 
    {
        async getMatchNamesForTournament(tournamentId)
        {
            // Utiliser .all() au lieu de .get() pour obtenir tous les participants
            const participants = await fastify.db.connection.all ('SELECT * FROM tournament_participants WHERE tournament_id = ?', tournamentId);
            
            if (!participants || participants.length === 0) {
                console.log("0");
                throw new Error(`Match not found for tournament ID: ${tournamentId}`);
            }
            
            // Maintenant participants est un tableau, donc .length fonctionnera
            if (participants.length == 4)
                return ({tournamentId : tournamentId, player_1_name: participants[2].username || participants[2].alias, player_2_name: participants[3].username || participants[3].alias});
            else if (participants.length == 3)
                return ({tournamentId : tournamentId, player_1_name: participants[1].username || participants[1].alias, player_2_name: participants[2].username || participants[2].alias});
            else if (participants.length == 2)
                return ({tournamentId : tournamentId, player_1_name: participants[0].username || participants[0].alias, player_2_name: participants[1].username || participants[1].alias});
            else
                throw new Error(`Unexpected number of participants: ${participants.length}`);
        },

        async isRegisterOrNot(name_player, tournament_id)
        {
            const user = await fastify.db.connection.get('SELECT * FROM tournament_participants WHERE username = ? AND tournament_id = ?', name_player, tournament_id);
            if (user)
                return true;
            return false;
        },

        async createMatch(match, first_user, second_user)
        {
            // console.log("Creating match with players:", match);
            const game_mode = 'tournament';
            const user_one = first_user;
            const user_two = second_user;
            let winner_id = null;
            if (match.score_player1 > match.score_player2)
            {
                winner_id = user_one.id;
            }
            else if (match.score_player1 < match.score_player2)
            {
                winner_id = user_two.id;
            }
            // console.log(user_two.id);
            if (user_one && user_two)
            {
                await fastify.db.connection.run(
                    `INSERT INTO matches (player1_id, player1_name, player2_id, player2_name, winner_id, score_player1, score_player2, game_mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
                    [user_one.id, match.player1_name, user_two.id, match.player2_name, winner_id, match.score_player1, match.score_player2, game_mode]
                );
            }
            else if (user_one && !user_two) 
            {
                await fastify.db.connection.run(
                    `INSERT INTO matches (player1_id, player1_name, winner_id, score_player1, score_player2, game_mode) VALUES (?, ?, ?, ?, ?, ?)`, 
                    [user_one.id, match.player1_name, winner_id, match.score_player1, match.score_player2, game_mode]
                );
            }
            else if (!user_one && user_two)
            {
                await fastify.db.connection.run(
                `INSERT INTO matches (player2_id, player2_name, winner_id, score_player1, score_player2, game_mode) VALUES (?, ?, ?, ?, ?, ?)`, 
                [user_two.id, match.player2_name, winner_id, match.player1_score, match.player2_score, game_mode]
                );        
            }
            else
            {
                console.error("Both players are missing, cannot create match.");
            }
        },

        async deleteLosers(match)
        {
            let loser = null;
            console.log("JE SUIS LE MATCH", match);
            if (match.player1_score > match.player2_score)
                loser = match.player2_name;
            else
                loser = match.player1_name;
            console.log('Deleting loser:', loser);
            const user = await fastify.db.connection.get('SELECT * FROM tournament_participants WHERE username = ? OR alias = ? AND tournament_id = ?', loser, loser, match.tournament_id);
            if (!user) {
                console.error(`User ${loser} not found in tournament participants.`);
                return false;
            }
            console.log('DELETING LOSER:', loser);
            await fastify.db.connection.run(`DELETE FROM tournament_participants WHERE username = ? OR alias = ? AND tournament_id = ?`, 
            [loser, loser, match.tournament_id]);
            return true;
        },

        async findWinnerOfTournament(tournament_id)
        {
            // compter le nombre de row et prend le nom du seul participant restant
            const count = await fastify.db.connection.get('SELECT COUNT(*) as count FROM tournament_participants WHERE tournament_id = ?', tournament_id);
            if (count.count !== 1){
                return null;
            }
            const winner = await fastify.db.connection.get('SELECT * FROM tournament_participants WHERE tournament_id = ?', tournament_id);
            if (!winner) {
                console.error(`No winner found for tournament ID: ${tournament_id}`);
                return null;
            }
            return winner.username || winner.alias;
        }
    };
    fastify.decorate('dbMatchData', dbMatchData);
};

export default fp(MatchData);