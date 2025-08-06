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
            console.log("Fetching match names for tournament ID:", tournamentId);
            // Utiliser .all() au lieu de .get() pour obtenir tous les participants
            const participants = await fastify.db.connection.all ('SELECT * FROM tournament_participants WHERE tournament_id = ?', tournamentId);
            console.log("Match data retrieved:", participants);
            
            if (!participants || participants.length === 0) {
                console.log("0");
                throw new Error(`Match not found for tournament ID: ${tournamentId}`);
            }
            
            // Maintenant participants est un tableau, donc .length fonctionnera
            if (participants.length == 4)
                return ({player_1_name: participants[0].username || participants[0].alias, player_2_name: participants[1].username || participants[1].alias});
            else if (participants.length == 3)
                return ({player_1_name: participants[1].username || participants[1].alias, player_2_name: participants[2].username || participants[2].alias});
            else if (participants.length == 2)
                return ({player_1_name: participants[0].username || participants[0].alias, player_2_name: participants[1].username || participants[1].alias});
            else
                throw new Error(`Unexpected number of participants: ${participants.length}`);
        }
    };
    fastify.decorate('dbMatchData', dbMatchData);
};

export default fp(MatchData);