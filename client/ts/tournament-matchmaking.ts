interface Player
{
	id: number;
	username: string;
	avatar?: string;
	status: 'waiting' | 'playing' | 'ready' | 'eliminated' | 'winner';
}

interface Match {
	id: string;
	tournamentId: number;
	player1: Player;
	player2: Player | null;
	winner?: Player;
	score?:
	{
		player1: number;
		player2: number;
	};
	round: number;
	matchNumber: number;
	status: 'pending' | 'active' | 'finished';
	startTime?: Date;
	endTime?: Date;
}

interface TournamentBracket
{
	id: number;
	name: string;
	players: Player[];
	matches: Match[];
	currentRound: number;
	maxRounds: number;
	status: 'waiting' | 'active' | 'finished';
	winner?: Player;
	createdAt: Date;
	currentMatch?: Match;
}

class TournamentMatchmakingAPI {
	private baseUrl: string;
	private token: string | null;

	constructor(baseUrl = "https://localhost:3000")
	{
		this.baseUrl = baseUrl;
		this.token = localStorage.getItem("jwtToken");
	}

	private async fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T>
	{
		if (await window.SPA.checkJwtValidity()) {
		const response = await fetch(`${this.baseUrl}${endpoint}`, {
		...options,
		headers:
		{
			"Content-Type": "application/json",
			"Authorization": `Bearer ${this.token}`,
			...options.headers,
		},
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json() as T;
	}
}

	// Get tournament bracket and matches
	async getTournamentBracket(tournamentId: number): Promise<TournamentBracket> {
	return this.fetchAPI<TournamentBracket>(`/tournament/${tournamentId}/bracket`);
	}

	// Start tournament (generate bracket)
	async startTournament(tournamentId: number): Promise<{ success: boolean; message: string }> {
	return this.fetchAPI<{ success: boolean; message: string }>(`/tournament/${tournamentId}/start`, {
		method: 'POST'
	});
	}

	// Get next match for tournament
	async getNextMatch(tournamentId: number): Promise<Match | null> {
	try {
		return await this.fetchAPI<Match>(`/tournament/${tournamentId}/next-match`);
	} catch (error) {
		return null;
	}
	}

	// Submit match result
	async submitMatchResult(matchId: string, winnerId: number, score: { player1: number; player2: number }): Promise<{ success: boolean; message: string }> {
	return this.fetchAPI<{ success: boolean; message: string }>(`/tournament/match/${matchId}/result`, {
		method: 'POST',
		body: JSON.stringify({ winnerId, score })
	});
	}

	// Check if user is in tournament
	async checkUserInTournament(tournamentId: number): Promise<{ inTournament: boolean; player?: Player }>
	{
		return this.fetchAPI<{ inTournament: boolean; player?: Player }>(`/tournament/${tournamentId}/user-status`);
	}
}

class TournamentMatchmaking {
	private api: TournamentMatchmakingAPI;
	private tournament: TournamentBracket | null = null;
	private currentMatch: Match | null = null;
	private pollInterval: number | null = null;
	private isGameActive = false;

	constructor() {
	this.api = new TournamentMatchmakingAPI();
	this.bindGameEvents();
	}

	// Initialize tournament matchmaking
	async initializeTournament(tournamentId: number): Promise<void> {
	try {
		// Check if user is in this tournament
		const userStatus = await this.api.checkUserInTournament(tournamentId);
		if (!userStatus.inTournament)
		{
		this.showMessage("You are not part of this tournament", "error");
		return;
		}

		// Load tournament bracket
		this.tournament = await this.api.getTournamentBracket(tournamentId);
		this.renderTournamentBracket();
		this.startPolling();

		// Check for next match immediately
		this.checkForNextMatch();

	} catch (error) {
		console.error('Error initializing tournament:', error);
		this.showMessage("Failed to load tournament", "error");
	}
	}

	// Start tournament (for tournament creator)
	async startTournament(): Promise<void> {
	if (!this.tournament) return;

	try {
		const result = await this.api.startTournament(this.tournament.id);
		if (result.success) {
		this.showMessage("Tournament started!", "success");
		// Reload tournament data
		await this.initializeTournament(this.tournament.id);
		} else {
		this.showMessage(result.message, "error");
		}
	} catch (error) {
		this.showMessage("Failed to start tournament", "error");
	}
	}

	// Poll for tournament updates
	private startPolling(): void {
	if (this.pollInterval) {
		clearInterval(this.pollInterval);
	}

	this.pollInterval = setInterval(async () => {
		if (!this.tournament || this.isGameActive) return;

		try {
		// Refresh tournament data
		const updatedTournament = await this.api.getTournamentBracket(this.tournament.id);
		this.tournament = updatedTournament;
		this.renderTournamentBracket();
		this.checkForNextMatch();
		} catch (error) {
		console.error('Error polling tournament updates:', error);
		}
	}, 5000); // Poll every 5 seconds
	}

	// Check for next match
	private async checkForNextMatch(): Promise<void> {
	if (!this.tournament) return;

	try {
		const nextMatch = await this.api.getNextMatch(this.tournament.id);

		if (nextMatch && !this.currentMatch) {
		this.currentMatch = nextMatch;
		this.announceMatch(nextMatch);
		} else if (!nextMatch && this.tournament.status === 'finished') {
		this.announceWinner();
		this.stopPolling();
		}
	} catch (error) {
		console.error('Error checking for next match:', error);
	}
	}

	// Announce next match
	private announceMatch(match: Match): void {
	if (!match.player2) {
		// Bye match - auto advance
		this.showMessage(`${match.player1.username} advances automatically (bye)`, "info");
		return;
	}

	const matchAnnouncement = `
		<div class="match-announcement">
		<h2>🏆 Next Match - Round ${match.round}</h2>
		<div class="vs-container">
			<div class="player-card">
			<div class="player-avatar">
				<img src="${match.player1.avatar || '/default-avatar.png'}" alt="${match.player1.username}">
			</div>
			<h3>${match.player1.username}</h3>
			</div>
			<div class="vs-text">VS</div>
			<div class="player-card">
			<div class="player-avatar">
				<img src="${match.player2.avatar || '/default-avatar.png'}" alt="${match.player2.username}">
			</div>
			<h3>${match.player2.username}</h3>
			</div>
		</div>
		<div class="match-actions">
			<button id="start-match-btn" class="start-match-btn" onclick="tournamentMatchmaking.startMatch()">
			🎮 Start Match
			</button>
			<button id="ready-btn" class="ready-btn" onclick="tournamentMatchmaking.markReady()">
			✓ Mark Ready
			</button>
		</div>
		<div class="match-info">
			<p>Match ${match.matchNumber} of Round ${match.round}</p>
			<p class="countdown" id="match-countdown">Get ready...</p>
		</div>
		</div>
	`;

	this.updateMatchDisplay(matchAnnouncement);
	this.startMatchCountdown();
	}

	// Start match countdown
	private startMatchCountdown(): void {
	const countdownEl = document.getElementById('match-countdown');
	if (!countdownEl) return;

	let countdown = 10;
	const countdownInterval = setInterval(() => {
		if (countdown > 0) {
		countdownEl.textContent = `Match starts in ${countdown} seconds...`;
		countdown--;
		} else {
		countdownEl.textContent = "Match starting now!";
		clearInterval(countdownInterval);
		// Auto-start if both players are ready or timeout
		setTimeout(() => {
			const startBtn = document.getElementById('start-match-btn') as HTMLButtonElement;
			if (startBtn && !startBtn.disabled) {
			this.startMatch();
			}
		}, 2000);
		}
	}, 1000);
	}

	// Mark player as ready
	markReady(): void {
	const readyBtn = document.getElementById('ready-btn') as HTMLButtonElement;
	const startBtn = document.getElementById('start-match-btn') as HTMLButtonElement;

	if (readyBtn) {
		readyBtn.textContent = "✓ Ready!";
		readyBtn.disabled = true;
		readyBtn.classList.add('ready-active');
	}

	if (startBtn) {
		startBtn.disabled = false;
		startBtn.classList.add('enabled');
	}

	this.showMessage("You are ready! Waiting for match to start...", "success");
	}

	// Start the actual Pong match
	startMatch(): void {
	if (!this.currentMatch) return;

	this.isGameActive = true;

	// Store match context for game
	const matchContext = {
		matchId: this.currentMatch.id,
		tournamentId: this.tournament?.id,
		player1: this.currentMatch.player1,
		player2: this.currentMatch.player2,
		round: this.currentMatch.round
	};

	localStorage.setItem('tournamentMatch', JSON.stringify(matchContext));
	localStorage.setItem('Difficulty', 'MEDIUM'); // Set tournament difficulty

	// Show loading screen
	this.showMatchTransition();

	// Navigate to game after brief delay
	setTimeout(() => {
		if (window.SPA) {
		window.SPA.navigateTo('/1v1');
		}
	}, 2000);
	}

	// Show match transition screen
	private showMatchTransition(): void {
	if (!this.currentMatch) return;

	const transition = `
		<div class="match-transition">
		<h1>🎮 Starting Match</h1>
		<div class="loading-animation">
			<div class="loading-spinner"></div>
		</div>
		<p>Loading Pong Arena...</p>
		<div class="match-summary">
			<strong>${this.currentMatch.player1.username}</strong> vs
			<strong>${this.currentMatch.player2?.username}</strong>
		</div>
		</div>
	`;

	this.updateMatchDisplay(transition);
	}

	// Handle game completion (called from modified Game1v1)
	async handleGameCompletion(player1Score: number, player2Score: number): Promise<void> {
	const matchData = localStorage.getItem('tournamentMatch');
	if (!matchData || !this.currentMatch) return;

	const { matchId, player1, player2 } = JSON.parse(matchData);
	const winnerId = player1Score > player2Score ? player1.id : player2.id;

	try {
		const result = await this.api.submitMatchResult(matchId, winnerId, {
		player1: player1Score,
		player2: player2Score
		});

		if (result.success) {
		this.showMatchResult(player1Score, player2Score, player1, player2);
		this.currentMatch = null;
		this.isGameActive = false;

		// Clear match context
		localStorage.removeItem('tournamentMatch');

		// Return to tournament after showing results
		setTimeout(() => {
			if (window.SPA) {
			window.SPA.navigateTo('/tournamenthome');
			}
		}, 5000);
		}
	} catch (error) {
		console.error('Error submitting match result:', error);
		this.showMessage("Failed to submit match result", "error");
	}
	}

	// Show match result
	private showMatchResult(p1Score: number, p2Score: number, player1: Player, player2: Player): void {
	const winner = p1Score > p2Score ? player1 : player2;
	const loser = p1Score > p2Score ? player2 : player1;

	const resultDisplay = `
		<div class="match-result">
		<h1>🏆 Match Complete!</h1>
		<div class="winner-announcement">
			<div class="winner-card">
			<img src="${winner.avatar || '/default-avatar.png'}" alt="${winner.username}">
			<h2>${winner.username} Wins!</h2>
			</div>
		</div>
		<div class="final-score">
			<div class="score-display">
			<span class="${p1Score > p2Score ? 'winner' : 'loser'}">${player1.username}: ${p1Score}</span>
			<span class="vs">-</span>
			<span class="${p2Score > p1Score ? 'winner' : 'loser'}">${player2.username}: ${p2Score}</span>
			</div>
		</div>
		<div class="result-actions">
			<p>Returning to tournament bracket...</p>
			<div class="loading-dots">
			<span></span><span></span><span></span>
			</div>
		</div>
		</div>
	`;

	this.updateMatchDisplay(resultDisplay);
	}

	// Announce tournament winner
	private announceWinner(): void {
	if (!this.tournament || !this.tournament.winner) return;

	const winnerDisplay = `
		<div class="tournament-complete">
		<h1>🏆 TOURNAMENT CHAMPION! 🏆</h1>
		<div class="champion-card">
			<img src="${this.tournament.winner.avatar || '/default-avatar.png'}" alt="${this.tournament.winner.username}">
			<h2>${this.tournament.winner.username}</h2>
			<p class="champion-title">Tournament Winner</p>
		</div>
		<div class="tournament-stats">
			<p>Tournament: ${this.tournament.name}</p>
			<p>Rounds Completed: ${this.tournament.maxRounds}</p>
			<p>Total Matches: ${this.tournament.matches.length}</p>
		</div>
		<div class="celebration-actions">
			<button onclick="tournamentMatchmaking.viewBracket()" class="view-bracket-btn">
			View Full Bracket
			</button>
			<button onclick="window.SPA.navigateTo('/tournoi')" class="new-tournament-btn">
			Join Another Tournament
			</button>
		</div>
		</div>
	`;

	this.updateMatchDisplay(winnerDisplay);
	}

	// Render tournament bracket
	private renderTournamentBracket(): void {
	if (!this.tournament) return;

	const bracketHTML = this.generateBracketHTML();
	const bracketContainer = document.getElementById('tournament-bracket');
	if (bracketContainer) {
		bracketContainer.innerHTML = bracketHTML;
	}
	}

	// Generate bracket HTML
	private generateBracketHTML(): string {
	if (!this.tournament) return '';

	let html = `
		<div class="tournament-header">
		<h2>${this.tournament.name}</h2>
		<div class="tournament-status">
			<span class="status-badge ${this.tournament.status}">${this.tournament.status.toUpperCase()}</span>
			<span class="round-info">Round ${this.tournament.currentRound}/${this.tournament.maxRounds}</span>
		</div>
		</div>
	`;

	// Group matches by round
	const matchesByRound: { [round: number]: Match[] } = {};
	this.tournament.matches.forEach(match => {
		if (!matchesByRound[match.round]) {
		matchesByRound[match.round] = [];
		}
		matchesByRound[match.round].push(match);
	});

	html += `<div class="bracket-container">`;

	// Render each round
	for (let round = 1; round <= this.tournament.maxRounds; round++) {
		const roundMatches = matchesByRound[round] || [];
		html += `
		<div class="round-column">
			<h3>Round ${round}</h3>
			<div class="matches">
		`;

		roundMatches.forEach(match => {
		const isActive = match.status === 'active';
		const isFinished = match.status === 'finished';

		html += `
			<div class="match-card ${match.status}">
			<div class="match-header">
				<span>Match ${match.matchNumber}</span>
				${isActive ? '<span class="live-indicator">🔴 LIVE</span>' : ''}
			</div>
			<div class="match-players">
				<div class="player ${isFinished && match.winner?.id === match.player1.id ? 'winner' : ''}">
				<span>${match.player1.username}</span>
				${isFinished ? `<span class="score">${match.score?.player1 || 0}</span>` : ''}
				</div>
				${match.player2 ? `
				<div class="player ${isFinished && match.winner?.id === match.player2.id ? 'winner' : ''}">
					<span>${match.player2.username}</span>
					${isFinished ? `<span class="score">${match.score?.player2 || 0}</span>` : ''}
				</div>
				` : '<div class="player bye">BYE</div>'}
			</div>
			</div>
		`;
		});

		html += `
			</div>
		</div>
		`;
	}

	html += `</div>`;
	return html;
	}

	// View full bracket
	viewBracket(): void {
	this.renderTournamentBracket();
	// Scroll to bracket or show in modal
	const bracketContainer = document.getElementById('tournament-bracket');
	if (bracketContainer) {
		bracketContainer.scrollIntoView({ behavior: 'smooth' });
	}
	}

	// Utility methods
	private updateMatchDisplay(content: string): void {
	const matchDisplay = document.getElementById('match-display');
	if (matchDisplay) {
		matchDisplay.innerHTML = content;
	}
	}

	private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
	// Create notification
	const notification = document.createElement('div');
	notification.className = `notification ${type}`;
	notification.textContent = message;

	document.body.appendChild(notification);

	setTimeout(() => {
		notification.remove();
	}, 5000);
	}

	private stopPolling(): void {
	if (this.pollInterval) {
		clearInterval(this.pollInterval);
		this.pollInterval = null;
	}
	}

	// Bind events to detect game completion
	private bindGameEvents(): void {
	// Listen for custom events from the game
	window.addEventListener('tournamentGameComplete', ((event: CustomEvent) => {
		const { player1Score, player2Score } = event.detail;
		this.handleGameCompletion(player1Score, player2Score);
	}) as EventListener);
	}

	// Public method to initialize from tournament home page
	async initializeFromTournamentHome(tournamentId: number): Promise<void> {
	await this.initializeTournament(tournamentId);
	}
}

// Global instance and functions
let tournamentMatchmaking: TournamentMatchmaking | null = null;

function initializeTournamentMatchmaking(tournamentId: number): void {
	tournamentMatchmaking = new TournamentMatchmaking();
	tournamentMatchmaking.initializeFromTournamentHome(tournamentId);
}

// Global declarations
declare global {
	interface Window {
	tournamentMatchmaking: TournamentMatchmaking;
	initializeTournamentMatchmaking: (tournamentId: number) => void;
	}
}

// Export and expose globally
if (typeof window !== 'undefined') {
	window.initializeTournamentMatchmaking = initializeTournamentMatchmaking;
}

export { TournamentMatchmaking, TournamentMatchmakingAPI, initializeTournamentMatchmaking };
