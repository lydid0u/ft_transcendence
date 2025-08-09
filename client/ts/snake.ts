// Enums and Interfaces
enum Direction {
	UP = "UP",
	DOWN = "DOWN",
	LEFT = "LEFT",
	RIGHT = "RIGHT"
}

interface DirectionVector {
	x: number;
	y: number;
}

const DirectionVectors: Record<Direction, DirectionVector> = {
	[Direction.UP]: { x: 0, y: -1 },
	[Direction.DOWN]: { x: 0, y: 1 },
	[Direction.LEFT]: { x: -1, y: 0 },
	[Direction.RIGHT]: { x: 1, y: 0 }
};

// Position class
class Position {
	constructor(public x: number, public y: number) {}
}

// Food class
class Food
{
	constructor(public position: Position) {}

	draw(ctx: CanvasRenderingContext2D, gridSize: number): void
	{
		ctx.fillStyle = '#ff4757';
		ctx.shadowColor = '#ff4757';
		ctx.shadowBlur = 10;

		ctx.fillRect(
			this.position.x * gridSize,
			this.position.y * gridSize,
			gridSize - 2,
			gridSize - 2
		);

		ctx.shadowBlur = 0;

		// Black border
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 1;
		ctx.strokeRect(
			this.position.x * gridSize,
			this.position.y * gridSize,
			gridSize - 2,
			gridSize - 2
		);
	}
}

// Snake class
class Snake {
	public body: Position[];
	private direction: Direction;
	private nextDirection: Direction;

	constructor(initialPosition: Position) {
		this.body = [new Position(initialPosition.x, initialPosition.y)];
		this.direction = Direction.RIGHT;
		this.nextDirection = Direction.RIGHT;
	}

	move(): void {
		this.direction = this.nextDirection;
		const head = this.body[0];
		const directionVector = DirectionVectors[this.direction];
		const newHead = new Position(
			head.x + directionVector.x,
			head.y + directionVector.y
		);
		this.body.unshift(newHead);
	}

	grow(): void {
		// Don't remove the tail, snake grows
	}

	removeTail(): void {
		this.body.pop();
	}

	checkSelfCollision(): boolean {
		const head = this.body[0];
		for (let i = 1; i < this.body.length; i++) {
			if (head.x === this.body[i].x && head.y === this.body[i].y) {
				return true;
			}
		}
		return false;
	}

	checkWallCollision(gridWidth: number, gridHeight: number): boolean {
		const head = this.body[0];
		return head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight;
	}

	setDirection(newDirection: Direction): void {
		const currentVector = DirectionVectors[this.direction];
		const newVector = DirectionVectors[newDirection];

		// Prevent snake from going back into itself
		if (currentVector.x === -newVector.x && currentVector.y === -newVector.y && this.body.length > 1) {
			return;
		}
		this.nextDirection = newDirection;
	}

	draw(ctx: CanvasRenderingContext2D, gridSize: number): void {
		this.body.forEach((segment, index) => {
			if (index === 0) {
				// Head
				ctx.fillStyle = '#2ed573';
				ctx.shadowColor = '#2ed573';
				ctx.shadowBlur = 10;
			} else {
				// Body
				ctx.fillStyle = '#5f27cd';
				ctx.shadowColor = '#5f27cd';
				ctx.shadowBlur = 5;
			}

			ctx.fillRect(
				segment.x * gridSize,
				segment.y * gridSize,
				gridSize - 2,
				gridSize - 2
			);
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 1;
			ctx.strokeRect(
				segment.x * gridSize,
				segment.y * gridSize,
				gridSize - 2,
				gridSize - 2
			);

			ctx.shadowBlur = 0;
		});
	}
}

// Main game class
export class SnakeGame {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private readonly gridSize: number = 20;
	private readonly gridWidth: number;
	private readonly gridHeight: number;

	private snake: Snake;
	private food: Food;
	private score: number = 0;
	private gameRunning: boolean = true;
	private gameSpeed: number = 150;

	constructor() {
		this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d')!;
		this.gridWidth = this.canvas.width / this.gridSize;
		this.gridHeight = this.canvas.height / this.gridSize;

		this.snake = new Snake(new Position(Math.floor(this.gridWidth / 2), Math.floor(this.gridHeight / 2)));
		this.food = this.generateFood();

		this.updateScore();
		this.setupEventListeners();
		this.fetchLeaderboardData(); // Récupérer les données du leaderboard et le classement global
		this.gameLoop();
	}

	private generateFood(): Food {
		let position: Position;
		do {
			position = new Position(
				Math.floor(Math.random() * this.gridWidth),
				Math.floor(Math.random() * this.gridHeight)
			);
		} while (this.snake.body.some(segment => segment.x === position.x && segment.y === position.y));

		return new Food(position);
	}

	private setupEventListeners(): void {
		document.addEventListener('keydown', (e: KeyboardEvent) => {
			if (!this.gameRunning) return;

			switch(e.key) {
				case 'ArrowUp':
				case 'w':
				case 'W':
					e.preventDefault();
					this.snake.setDirection(Direction.UP);
					break;
				case 'ArrowDown':
				case 's':
				case 'S':
					e.preventDefault();
					this.snake.setDirection(Direction.DOWN);
					break;
				case 'ArrowLeft':
				case 'a':
				case 'A':
					e.preventDefault();
					this.snake.setDirection(Direction.LEFT);
					break;
				case 'ArrowRight':
				case 'd':
				case 'D':
					e.preventDefault();
					this.snake.setDirection(Direction.RIGHT);
					break;
			}
		});

		// Button controls
		const upBtn = document.getElementById('upBtn') as HTMLButtonElement;
		const downBtn = document.getElementById('downBtn') as HTMLButtonElement;
		const leftBtn = document.getElementById('leftBtn') as HTMLButtonElement;
		const rightBtn = document.getElementById('rightBtn') as HTMLButtonElement;

		upBtn?.addEventListener('click', () => {
			if (this.gameRunning) this.snake.setDirection(Direction.UP);
		});
		downBtn?.addEventListener('click', () => {
			if (this.gameRunning) this.snake.setDirection(Direction.DOWN);
		});
		leftBtn?.addEventListener('click', () => {
			if (this.gameRunning) this.snake.setDirection(Direction.LEFT);
		});
		rightBtn?.addEventListener('click', () => {
			if (this.gameRunning) this.snake.setDirection(Direction.RIGHT);
		});
	}

	private update(): void {
		if (!this.gameRunning) return;

		this.snake.move();

		// Check wall collision
		if (this.snake.checkWallCollision(this.gridWidth, this.gridHeight) || this.snake.checkSelfCollision()) 
		{
			this.gameOver();
			// send data to backend function here
			return;
		}

		// Check food collision
		const head = this.snake.body[0];
		if (head.x === this.food.position.x && head.y === this.food.position.y) {
			this.score += 10;
			this.snake.grow();
			this.food = this.generateFood();
			this.updateScore();

			// Increase speed slightly
			this.gameSpeed = Math.max(80, this.gameSpeed - 2);
		} else {
			this.snake.removeTail();
		}
	}

	private draw(): void
	{
		// Clear canvas
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw grid cells with black outlines
		for (let y = 0; y < this.gridHeight; y++) {
			for (let x = 0; x < this.gridWidth; x++) {
				this.ctx.fillStyle = '#000'; // fill each square black (optional background)
				this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);

				this.ctx.strokeStyle = '#444'; // black border
				this.ctx.lineWidth = 1;
				this.ctx.strokeRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
			}
		}

		// Draw food
		this.food.draw(this.ctx, this.gridSize);

		// Draw snake
		this.snake.draw(this.ctx, this.gridSize);
	}


	// private draw(): void {
	// 	// Clear canvas
	// 	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

	// 	// Draw grid
	// 	this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
	// 	this.ctx.lineWidth = 1;
	// 	for (let i = 0; i <= this.gridWidth; i++) {
	// 		this.ctx.beginPath();
	// 		this.ctx.moveTo(i * this.gridSize, 0);
	// 		this.ctx.lineTo(i * this.gridSize, this.canvas.height);
	// 		this.ctx.stroke();
	// 	}
	// 	for (let i = 0; i <= this.gridHeight; i++) {
	// 		this.ctx.beginPath();
	// 		this.ctx.moveTo(0, i * this.gridSize);
	// 		this.ctx.lineTo(this.canvas.width, i * this.gridSize);
	// 		this.ctx.stroke();
	// 	}

	// 	// Draw food
	// 	this.food.draw(this.ctx, this.gridSize);

	// 	// Draw snake
	// 	this.snake.draw(this.ctx, this.gridSize);
	// }

	private updateScore(): void {
		const scoreElement = document.getElementById('score');
		if (scoreElement) scoreElement.textContent = this.score.toString();
	}

	private gameOver(): void {
		this.gameRunning = false;
		
		// Send score to backend
		this.sendScoreToBackend(this.score);

		// Update final score in the game over menu
		const finalScoreElement = document.getElementById('finalScore');
		if (finalScoreElement) {
			finalScoreElement.textContent = this.score.toString();
		}

		// Show the game over menu
		const gameOverMenu = document.getElementById('gameOverMenu');
		if (gameOverMenu) {
			gameOverMenu.classList.add('visible');
		}

		// Add event listeners to buttons
		const playAgainBtn = document.getElementById('playAgainBtn');
		const homeBtn = document.getElementById('homeBtn');

		if (playAgainBtn) {
			playAgainBtn.onclick = () => {
				gameOverMenu?.classList.remove('visible');
				currentGame = new SnakeGame();
			};
		}

		if (homeBtn) {
			homeBtn.onclick = () => {
				window.location.href = '/home';
			};
		}
	}
	
	private async sendScoreToBackend(score: number): Promise<void> {
		try {
			const response = await fetch('http://localhost:3000/snake/add-score', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` // Assurez-vous d'envoyer le token d'authentification
				},
				body: JSON.stringify({ score }),
				credentials: 'include' // Important pour envoyer les cookies d'authentification
			});

			if (!response.ok) {
				throw new Error('Failed to submit score');
			}

			const data = await response.json();
			console.log('Score submitted successfully:', data);
			
			// Après avoir envoyé le score, on rafraîchit les données du leaderboard
			await this.fetchLeaderboardData();
			
		} catch (error) {
			console.error('Error submitting score:', error);
		}
	}

	private async fetchLeaderboardData(): Promise<void> {
		try {
			const response = await fetch('http://localhost:3000/snake/nearest-score', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` // Assurez-vous d'envoyer le token d'authentification
				},
				credentials: 'include' // Important pour envoyer les cookies d'authentification
			});

			if (!response.ok) {
				throw new Error('Failed to fetch leaderboard data');
			}

			const data = await response.json();
			console.log('Leaderboard data:', data);
			
			// Mise à jour des éléments du leaderboard
			this.updateLeaderboardUI(data);
		} catch (error) {
			console.error('Error fetching leaderboard data:', error);
		}
	}
	
	private updateLeaderboardUI(data: any): void {
		// Mettre à jour le meilleur score
		const globalBestElement = document.getElementById('globalBestScore');
		if (globalBestElement && data.globalBest) {
			globalBestElement.textContent = data.globalBest.toString();
		}
		
		// Mettre à jour le prochain score à battre
		const nextScoreElement = document.getElementById('nextScoreToBeat');
		if (nextScoreElement && data.nextScore) {
			nextScoreElement.textContent = data.nextScore.toString();
		}
		
		// Mettre à jour le rang du joueur
		const playerRankElement = document.getElementById('playerRank');
		if (playerRankElement && data.playerRank) {
			playerRankElement.textContent = data.playerRank.toString();
		}
	}

	showGameOverActions(): void {
	const oldOverlay = document.getElementById('gameOverActions');
	oldOverlay?.remove();

	// Create overlay container
	const overlay = document.createElement('div');
	overlay.id = 'gameOverActions';
	overlay.style.position = 'absolute';
	overlay.style.top = '50%';
	overlay.style.left = 'calc(100% + 24px)';
	overlay.style.transform = 'translateY(-50%)';
	overlay.style.display = 'flex';
	overlay.style.flexDirection = 'column';
	overlay.style.alignItems = 'center';
	overlay.style.gap = '16px';
	overlay.style.background = '#232526';
	overlay.style.borderRadius = '14px';
	overlay.style.boxShadow = '0 4px 16px #0006';
	overlay.style.padding = '28px 22px';
	overlay.style.zIndex = '100';
	overlay.style.minWidth = '140px';

	// Restart button
	const restartBtn = document.createElement('button');
	restartBtn.textContent = 'Restart';
	restartBtn.className = 'game-action-btn';
	restartBtn.onclick = () => {
		overlay.remove();
		new SnakeGame();
	};
	// Home button
	const homeBtn = document.createElement('button');
	homeBtn.textContent = 'Home';
	homeBtn.className = 'game-action-btn';
	homeBtn.onclick = () => {
		window.location.href = '/home'; // Change this to your home page path if needed
	};

	overlay.appendChild(restartBtn);
	overlay.appendChild(homeBtn);

	// Position overlay relative to canvas
	const canvas = document.getElementById('gameCanvas');
	const container = canvas?.parentElement;
	if (container) {
		container.style.position = 'relative';
		container.appendChild(overlay);
	}
}

	showGameOverScreen(): void {
		const gameOverDiv = document.createElement('div');
		gameOverDiv.className = 'game-over';
		gameOverDiv.innerHTML = `
			<h2>Game Over!</h2>
			<p>Score Final: ${this.score}</p>
			<button class="restart-btn" id="restartBtn">Rejouer</button>
		`;

		document.body.appendChild(gameOverDiv);

		const restartBtn = document.getElementById('restartBtn');
		restartBtn?.addEventListener('click', () => {
			gameOverDiv.remove();
			new SnakeGame();
		});
	}

	private gameLoop(): void {
		this.update();
		this.draw();

		if (this.gameRunning) {
			setTimeout(() => this.gameLoop(), this.gameSpeed);
		}
	}

	destroy(): void {
		this.gameRunning = false;
		
		// Hide game over menu if visible
		const gameOverMenu = document.getElementById('gameOverMenu');
		if (gameOverMenu) {
			gameOverMenu.classList.remove('visible');
		}
	}

}

let currentGame: SnakeGame | null = null;

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	// If there's an existing game, destroy it first
	if (currentGame) {
		currentGame.destroy();
	}
	
	// Create a new game
	currentGame = new SnakeGame();
	
	// Setup event listeners for the game over menu
	const playAgainBtn = document.getElementById('playAgainBtn');
	const homeBtn = document.getElementById('homeBtn');
	
	if (playAgainBtn) {
		playAgainBtn.onclick = () => {
			const gameOverMenu = document.getElementById('gameOverMenu');
			gameOverMenu?.classList.remove('visible');
			
			if (currentGame) {
				currentGame.destroy();
			}
			currentGame = new SnakeGame();
		};
	}
	
	if (homeBtn) {
		homeBtn.onclick = () => {
			window.location.href = '/home';
		};
	}
});
