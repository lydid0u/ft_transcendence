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

// Wall class
class Wall {
	constructor(public position: Position) {}

	draw(ctx: CanvasRenderingContext2D, gridSize: number): void {
		ctx.fillStyle = '#34495e';
		ctx.shadowColor = '#2c3e50';
		ctx.shadowBlur = 5;

		ctx.fillRect(
			this.position.x * gridSize,
			this.position.y * gridSize,
			gridSize - 2,
			gridSize - 2
		);

		ctx.shadowBlur = 0;

		// Dark border
		ctx.strokeStyle = '#2c3e50';
		ctx.lineWidth = 2;
		ctx.strokeRect(
			this.position.x * gridSize,
			this.position.y * gridSize,
			gridSize - 2,
			gridSize - 2
		);

		ctx.shadowBlur = 0;

		// Dark border
		ctx.strokeStyle = '#2c3e50';
		ctx.lineWidth = 2;
		ctx.strokeRect(
			this.position.x * gridSize,
			this.position.y * gridSize,
			gridSize - 2,
			gridSize - 2,
		);
	}
}

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

	checkWallCollision(gridWidth: number, gridHeight: number, walls: Wall[] = []): boolean {
		const head = this.body[0];
		
		// Check boundary walls
		if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
			return true;
		}
		
		// Check custom walls
		return walls.some(wall => wall.position.x === head.x && wall.position.y === head.y);
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

	// Add these properties
	private walls: Wall[] = [];
	private wallSpawnInterval: number = 20; // Spawn wall every 300 points
	private lastWallSpawn: number = 0;

	constructor() {
		this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d')!;
		this.gridWidth = this.canvas.width / this.gridSize;
		this.gridHeight = this.canvas.height / this.gridSize;

		this.snake = new Snake(new Position(Math.floor(this.gridWidth / 2), Math.floor(this.gridHeight / 2)));
		this.food = this.generateFood();
		this.walls = [];

		this.updateScore();
		this.setupEventListeners();
		this.fetchLeaderboardData(); // Récupérer les données du leaderboard et le classement global
		this.gameLoop();
	}

	// Add wall collision check to Snake class
	checkWallCollision(gridWidth: number, gridHeight: number, walls: Wall[] = []): boolean {
		const head = this.snake.body[0];
	 	
		// Check boundary walls
		if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
			return true;
		}
		
		// Check custom walls
		return walls.some(wall => wall.position.x === head.x && wall.position.y === head.y);
	}

	// Add this method to generate walls
	private generateWall(): Wall {
		let position: Position;
		let attempts = 0;
		const maxAttempts = 50;

		do {
			position = new Position(
				Math.floor(Math.random() * this.gridWidth),
				Math.floor(Math.random() * this.gridHeight)
			);
			attempts++;
		} while (
			attempts < maxAttempts &&
			(this.snake.body.some(segment => segment.x === position.x && segment.y === position.y) ||
			 this.food.position.x === position.x && this.food.position.y === position.y ||
			 this.walls.some(wall => wall.position.x === position.x && wall.position.y === position.y))
		);

		return new Wall(position);
	}

	private generateWalls(): Wall[] {
		const newWalls: Wall[] = [];
		const patterns = ['line', 'cluster', 'L-shape'];
		const pattern = patterns[Math.floor(Math.random() * patterns.length)];
		
		let basePosition: Position;
		let attempts = 0;
		const maxAttempts = 50;
		
		// Find a valid base position
		do {
			basePosition = new Position(
				Math.floor(Math.random() * (this.gridWidth - 4)) + 2, // Leave some margin
				Math.floor(Math.random() * (this.gridHeight - 4)) + 2
			);
			attempts++;
		} while (attempts < maxAttempts && !this.isValidBasePosition(basePosition));
		
		if (attempts >= maxAttempts) {
			// Fallback to single wall if no valid position found
			return [new Wall(basePosition)];
		}
		
		// Generate walls based on pattern
		switch (pattern) {
			case 'line':
				newWalls.push(...this.generateLinePattern(basePosition));
				break;
			case 'cluster':
				newWalls.push(...this.generateClusterPattern(basePosition));
				break;
			case 'L-shape':
				newWalls.push(...this.generateLShapePattern(basePosition));
				break;
		}
		
		// Filter out invalid positions
		return newWalls.filter(wall => this.isValidWallPosition(wall.position));
	}

	private isValidBasePosition(position: Position): boolean {
		// Check if there's enough space around the base position for patterns
		for (let dx = -2; dx <= 2; dx++) {
			for (let dy = -2; dy <= 2; dy++) {
				const checkPos = new Position(position.x + dx, position.y + dy);
				if (this.isPositionOccupied(checkPos)) {
					return false;
				}
			}
		}
		return true;
	}

	private isValidWallPosition(position: Position): boolean {
		// Check bounds
		if (position.x < 0 || position.x >= this.gridWidth || 
			position.y < 0 || position.y >= this.gridHeight) {
			return false;
		}
		
		return !this.isPositionOccupied(position);
	}

	private isPositionOccupied(position: Position): boolean {
		// Check if position is occupied by snake, food, or existing walls
		return this.snake.body.some(segment => segment.x === position.x && segment.y === position.y) ||
			   (this.food.position.x === position.x && this.food.position.y === position.y) ||
			   this.walls.some(wall => wall.position.x === position.x && wall.position.y === position.y);
	}

	private generateLinePattern(basePosition: Position): Wall[] {
		const walls: Wall[] = [];
		const isHorizontal = Math.random() < 0.5;
		const length = Math.floor(Math.random() * 3) + 3; // 3-5 blocks
		
		if (isHorizontal) {
			// Horizontal line
			for (let i = 0; i < length; i++) {
				walls.push(new Wall(new Position(basePosition.x + i, basePosition.y)));
			}
		} else {
			// Vertical line
			for (let i = 0; i < length; i++) {
				walls.push(new Wall(new Position(basePosition.x, basePosition.y + i)));
			}
		}
		
		return walls;
	}

	private generateClusterPattern(basePosition: Position): Wall[] {
		const walls: Wall[] = [];
		const patterns = [
			// 2x2 square
			[
				{ x: 0, y: 0 }, { x: 1, y: 0 },
				{ x: 0, y: 1 }, { x: 1, y: 1 }
			],
			// Plus shape
			[
				{ x: 1, y: 0 },
				{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
				{ x: 1, y: 2 }
			],
			// Triangle
			[
				{ x: 1, y: 0 },
				{ x: 0, y: 1 }, { x: 2, y: 1 },
				{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }
			]
		];
		
		const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
		
		selectedPattern.forEach(offset => {
			walls.push(new Wall(new Position(
				basePosition.x + offset.x,
				basePosition.y + offset.y
			)));
		});
		
		return walls;
	}

	private generateLShapePattern(basePosition: Position): Wall[] {
		const walls: Wall[] = [];
		const variations = [
			// L shape (top-left)
			[
				{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
				{ x: 0, y: 1 },
				{ x: 0, y: 2 }
			],
			// L shape (top-right)
			[
				{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
				{ x: 2, y: 1 },
				{ x: 2, y: 2 }
			],
			// L shape (bottom-left)
			[
				{ x: 0, y: 0 },
				{ x: 0, y: 1 },
				{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }
			],
			// L shape (bottom-right)
			[
				{ x: 2, y: 0 },
				{ x: 2, y: 1 },
				{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }
			]
		];
		
		const selectedVariation = variations[Math.floor(Math.random() * variations.length)];
		
		selectedVariation.forEach(offset => {
			walls.push(new Wall(new Position(
				basePosition.x + offset.x,
				basePosition.y + offset.y
			)));
		});
		
		return walls;
	}

	private generateFood(): Food {
		let position: Position;
		do {
			position = new Position(
				Math.floor(Math.random() * this.gridWidth),
				Math.floor(Math.random() * this.gridHeight)
			);
		} while (
			this.snake.body.some(segment => segment.x === position.x && segment.y === position.y) ||
			this.walls.some(wall => wall.position.x === position.x && wall.position.y === position.y)
		);

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

		// Check wall collision (updated to include walls)
		if (this.snake.checkWallCollision(this.gridWidth, this.gridHeight, this.walls) || this.snake.checkSelfCollision()) {
			this.gameOver();
			return;
		}

		// Check food collision
		const head = this.snake.body[0];
		if (head.x === this.food.position.x && head.y === this.food.position.y) {
			this.score += 10;
			this.snake.grow();
			this.food = this.generateFood();
			this.updateScore();

			// Spawn wall pattern every wallSpawnInterval points
			if (this.score - this.lastWallSpawn >= this.wallSpawnInterval) {
				const newWalls = this.generateWalls(); // Changed from generateWall() to generateWalls()
				this.walls.push(...newWalls); // Spread the array to add multiple walls
				this.lastWallSpawn = this.score;
			}

			// Increase speed slightly
			this.gameSpeed = Math.max(80, this.gameSpeed - 2);
		} else {
			this.snake.removeTail();
		}
	}

	private draw(): void {
		// Clear canvas
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw grid cells with black outlines
		for (let y = 0; y < this.gridHeight; y++) {
			for (let x = 0; x < this.gridWidth; x++) {
				this.ctx.fillStyle = '#000';
				this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);

				this.ctx.strokeStyle = '#444';
				this.ctx.lineWidth = 1;
				this.ctx.strokeRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
			}
		}

		// Draw walls
		this.walls.forEach(wall => wall.draw(this.ctx, this.gridSize));

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
			const response = await fetch('https://localhost:3000/snake/add-score', {
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
			const response = await fetch('https://localhost:3000/snake/nearest-score', {
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
