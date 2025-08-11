import fp from 'fastify-plugin'

async function MatchData(fastify, options)
{
    const dbMatchData = 
    {
        async findWinRate(player) {
            // Si le joueur utilise un alias au lieu d'un username, on considère 0% de winrate
            if (!player.username || player.alias) {
                return 0;
            }
            try {
                // D'abord récupérer l'user_id depuis la table users si ce n'est pas fourni
                let userId = player.user_id;
                if (!userId) {
                    const user = await fastify.db.connection.get(`
                        SELECT id FROM users WHERE username = ?
                    `, [player.username]);
                    if (!user) {
                        console.log(`Utilisateur ${player.username} introuvable dans la table users`);
                        return 0;
                    }
                    userId = user.id;
                }
                // Récupérer tous les matchs du joueur (en tant que player1 ou player2)
                const matches = await fastify.db.connection.all(`
                    SELECT winner_id, player1_id, player2_id, player1_name, player2_name
                    FROM matches 
                    WHERE (player1_name = ? OR player2_name = ?) 
                    AND winner_id IS NOT NULL
                `, [player.username, player.username]);
                if (!matches || matches.length === 0) {
                    console.log(`Aucun match trouvé pour ${player.username}`);
                    return 0; // Aucun match trouvé = 0% de winrate
                }
                // Compter les victoires
                let wins = 0;
                const totalMatches = matches.length;
                for (const match of matches) {
                    // Vérifier si le joueur a gagné ce match
                    if ((match.player1_name === player.username && match.winner_id === userId) ||
                        (match.player2_name === player.username && match.winner_id === userId)) {
                        wins++;
                    }
                }
                // Calculer le winrate en pourcentage (entre 0 et 100)
                const winRatePercent = (wins / totalMatches) * 100;
                console.log(`Joueur ${player.username} (ID: ${userId}): ${wins}/${totalMatches} victoires = ${winRatePercent.toFixed(1)}% winrate`);
                return winRatePercent; // Retourne en pourcentage
            } catch (error) {
                console.error(`Erreur lors du calcul du winrate pour ${player.username}:`, error);
                return 0; // En cas d'erreur, considérer 0% de winrate
            }
        },

        async findMMR(players)
        {
            try {
                const playersWithWinRate = [];
                for (const player of players) {
                    const winRate = await this.findWinRate(player);
                    playersWithWinRate.push({
                        ...player,
                        winRate: winRate
                    });
                }
                // Trier les joueurs par winrate décroissant (meilleur en premier)
                const rankedPlayers = playersWithWinRate.sort((a, b) => {
                    if (b.winRate !== a.winRate) {
                        return b.winRate - a.winRate;
                    }
                    return (a.username || a.alias)?.localeCompare(b.username || b.alias) || 0;
                });
                return rankedPlayers;
            } catch (error) {
                console.error('Error in findMMR:', error);
                return [];
            }
        },

        async getMatchNamesForTournament(tournamentId)
        {
            try {
                const players = await fastify.db.connection.all ('SELECT * FROM tournament_participants WHERE tournament_id = ?', tournamentId);
                if (!players || players.length === 0) {
                    console.log("0");
                    throw new Error(`Match not found for tournament ID: ${tournamentId}`);
                }
                const rankedParticipants = await this.findMMR(players);
                let participants;
                if (rankedParticipants.length >= 4) {
                    participants = [
                        rankedParticipants[0], // #1 - Meilleur winrate
                        rankedParticipants[3], // #4 - Plus bas winrate  
                        rankedParticipants[1], // #2 - 2ème meilleur
                        rankedParticipants[2]  // #3 - 3ème meilleur
                    ];
                    console.log("Matchmaking organisé:");
                    console.log(`Match actuel: ${participants[0].username || participants[0].alias} (${participants[0].winRate.toFixed(1)}%) VS ${participants[1].username || participants[1].alias} (${participants[1].winRate.toFixed(1)}%)`);
                    console.log(`Prochain match: ${participants[2].username || participants[2].alias} (${participants[2].winRate.toFixed(1)}%) VS ${participants[3].username || participants[3].alias} (${participants[3].winRate.toFixed(1)}%)`);
                } else {
                    participants = rankedParticipants;
                }
                if (participants.length == 4)
                    return ({
                        tournamentId : tournamentId, 
                        next_player_1_name : participants[2].username || participants[2].alias,
                        next_player_2_name: participants[3].username || participants[3].alias,
                        player_1_name: participants[0].username || participants[0].alias,
                        player_2_name: participants[1].username || participants[1].alias,
                        round : "demi-finale 1"
                    });
                else if (participants.length == 3)
                    return ({
                        tournamentId : tournamentId, 
                        finalist_name : participants[0].username || participants[0].alias,
                        player_1_name: participants[1].username || participants[1].alias,
                        player_2_name: participants[2].username || participants[2].alias,
                        round : "demi-finale 2"
                    });
                else if (participants.length == 2)
                    return ({
                        tournamentId : tournamentId, 
                        player_1_name: participants[0].username || participants[0].alias,
                        player_2_name: participants[1].username || participants[1].alias,
                        round : "finale"
                    });
                else
                    throw new Error(`Unexpected number of participants: ${participants.length}`);
            } catch (error) {
                console.error('Error in getMatchNamesForTournament:', error);
                return null;
            }
        },

        async createMatch(match, first_user, second_user)
        {
            try {
                console.log("IN THE FUNCTION CREATE MATCH", match);
                const game_mode = 'tournament';
                const user_one = first_user;
                const user_two = second_user;
                let winner_id = null;
                if (match.player1_score > match.player2_score)
                {
                    console.log("Player 1 wins");
                    if(user_one)
                        winner_id = user_one.id;
                }
                else if (match.player1_score < match.player2_score)
                {
                    console.log("Player 2 wins");
                    if(user_two)
                        winner_id = user_two.id;
                }
                if (user_one && user_two)
                {
                    await fastify.db.connection.run(
                        `INSERT INTO matches (player1_id, player1_name, player2_id, player2_name, winner_id, score_player1, score_player2, game_mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
                        [user_one.id, match.player1_name, user_two.id, match.player2_name, winner_id, match.player1_score, match.player2_score, game_mode]
                    );
                }
                else if (user_one && !user_two) 
                {
                    await fastify.db.connection.run(
                        `INSERT INTO matches (player1_id, player1_name, winner_id, score_player1, score_player2, game_mode) VALUES (?, ?, ?, ?, ?, ?)`, 
                        [user_one.id, match.player1_name, winner_id, match.player1_score, match.player2_score, game_mode]
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
            } catch (error) {
                console.error('Error in createMatch:', error);
            }
        },

        async checkParticipantsInMatch(match, userId)
        {
            try {
                console.log("here\n");
                const tournament = await fastify.dbTournament.getTournamentByCreatorId(userId);
                if (!tournament || tournament.creator_id !== userId) {
                    return false;
                }
                console.log("Tournament found:", tournament);
                console.log("TournamentId:", tournament.id);
                const participants = await fastify.db.connection.all('SELECT * FROM tournament_participants WHERE tournament_id = ?', tournament.id);
                console.log("Affichage du tournoi", participants);
                const player1 = participants.find(p => p.username === match.player1_name || p.alias === match.player1_name);
                const player2 = participants.find(p => p.username === match.player2_name || p.alias === match.player2_name);
                if (!player1 || !player2) {
                    return false;
                }
                return true;
            } catch (error) {
                console.error('Error in checkParticipantsInMatch:', error);
                return false;
            }
        },

        async deleteLosers(match)
        {
            try {
                let loser = null;
                if (match.player1_score > match.player2_score)
                    loser = match.player2_name;
                else
                    loser = match.player1_name;
                const user = await fastify.db.connection.get('SELECT * FROM tournament_participants WHERE username = ? OR alias = ? AND tournament_id = ?', loser, loser, match.tournament_id);
                if (!user) {
                    return false;
                }
                console.log('DELETING LOSER:', loser);
                await fastify.db.connection.run(`DELETE FROM tournament_participants WHERE username = ? OR alias = ? AND tournament_id = ?`, 
                [loser, loser, match.tournament_id]);
                return true;
            } catch (error) {
                console.error('Error in deleteLosers:', error);
                return false;
            }
        },

        async findWinnerOfTournament(tournament_id)
        {
            try {
                console.log("Finding winner for tournament ID:", tournament_id);
                const count = await fastify.db.connection.get('SELECT COUNT(*) as count FROM tournament_participants WHERE tournament_id = ?', tournament_id);
                if (count.count !== 2){
                    return null;
                }
                const winner = await fastify.db.connection.get('SELECT * FROM tournament_participants WHERE tournament_id = ?', tournament_id);
                console.log("Winner found:", winner);
                if (!winner) {
                    console.error(`No winner found for tournament ID: ${tournament_id}`);
                    return null;
                }
                return winner;
            } catch (error) {
                console.error('Error in findWinnerOfTournament:', error);
                return null;
            }
        }
    };
    fastify.decorate('dbMatchData', dbMatchData);
};

export default fp(MatchData);