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

class Position {
	constructor(public x: number, public y: number) {}
}

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

		ctx.strokeStyle = '#2c3e50';
		ctx.lineWidth = 2;
		ctx.strokeRect(
			this.position.x * gridSize,
			this.position.y * gridSize,
			gridSize - 2,
			gridSize - 2
		);

		ctx.shadowBlur = 0;

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
		
		if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
			return true;
		}
		
		return walls.some(wall => wall.position.x === head.x && wall.position.y === head.y);
	}

	setDirection(newDirection: Direction): void {
		const currentVector = DirectionVectors[this.direction];
		const newVector = DirectionVectors[newDirection];

		if (currentVector.x === -newVector.x && currentVector.y === -newVector.y && this.body.length > 1) {
			return;
		}
		this.nextDirection = newDirection;
	}

	draw(ctx: CanvasRenderingContext2D, gridSize: number): void {
		this.body.forEach((segment, index) => {
			if (index === 0) {
				ctx.fillStyle = '#2ed573';
				ctx.shadowColor = '#2ed573';
				ctx.shadowBlur = 10;
			} else {
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

	checkWallCollision(gridWidth: number, gridHeight: number, walls: Wall[] = []): boolean {
		const head = this.snake.body[0];
	 	
		if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
			return true;
		}
		
		return walls.some(wall => wall.position.x === head.x && wall.position.y === head.y);
	}

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
		
		do {
			basePosition = new Position(
				Math.floor(Math.random() * (this.gridWidth - 4)) + 2, // Leave some margin
				Math.floor(Math.random() * (this.gridHeight - 4)) + 2
			);
			attempts++;
		} while (attempts < maxAttempts && !this.isValidBasePosition(basePosition));
		
		if (attempts >= maxAttempts) {
			return [new Wall(basePosition)];
		}
		
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
		
		return newWalls.filter(wall => this.isValidWallPosition(wall.position));
	}

	private isValidBasePosition(position: Position): boolean {
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
		if (position.x < 0 || position.x >= this.gridWidth || 
			position.y < 0 || position.y >= this.gridHeight) {
			return false;
		}
		
		return !this.isPositionOccupied(position);
	}

	private isPositionOccupied(position: Position): boolean {
		return this.snake.body.some(segment => segment.x === position.x && segment.y === position.y) ||
			   (this.food.position.x === position.x && this.food.position.y === position.y) ||
			   this.walls.some(wall => wall.position.x === position.x && wall.position.y === position.y);
	}

	private generateLinePattern(basePosition: Position): Wall[] {
		const walls: Wall[] = [];
		const isHorizontal = Math.random() < 0.5;
		const length = Math.floor(Math.random() * 3) + 3; // 3-5 blocks
		
		if (isHorizontal) {
			for (let i = 0; i < length; i++) {
				walls.push(new Wall(new Position(basePosition.x + i, basePosition.y)));
			}
		} else {
			for (let i = 0; i < length; i++) {
				walls.push(new Wall(new Position(basePosition.x, basePosition.y + i)));
			}
		}
		
		return walls;
	}

	private generateClusterPattern(basePosition: Position): Wall[] {
		const walls: Wall[] = [];
		const patterns = [
			[
				{ x: 0, y: 0 }, { x: 1, y: 0 },
				{ x: 0, y: 1 }, { x: 1, y: 1 }
			],
			[
				{ x: 1, y: 0 },
				{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
				{ x: 1, y: 2 }
			],
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
			[
				{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
				{ x: 0, y: 1 },
				{ x: 0, y: 2 }
			],
			[
				{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
				{ x: 2, y: 1 },
				{ x: 2, y: 2 }
			],
			[
				{ x: 0, y: 0 },
				{ x: 0, y: 1 },
				{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }
			],
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

		if (this.snake.checkWallCollision(this.gridWidth, this.gridHeight, this.walls) || this.snake.checkSelfCollision()) {
			this.gameOver();
			return;
		}

		const head = this.snake.body[0];
		if (head.x === this.food.position.x && head.y === this.food.position.y) {
			this.score += 10;
			this.snake.grow();
			this.food = this.generateFood();
			this.updateScore();

			if (this.score - this.lastWallSpawn >= this.wallSpawnInterval) {
				const newWalls = this.generateWalls(); // Changed from generateWall() to generateWalls()
				this.walls.push(...newWalls); // Spread the array to add multiple walls
				this.lastWallSpawn = this.score;
			}

			this.gameSpeed = Math.max(80, this.gameSpeed - 2);
		} else {
			this.snake.removeTail();
		}
	}

	private draw(): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		for (let y = 0; y < this.gridHeight; y++) {
			for (let x = 0; x < this.gridWidth; x++) {
				this.ctx.fillStyle = '#000';
				this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);

				this.ctx.strokeStyle = '#444';
				this.ctx.lineWidth = 1;
				this.ctx.strokeRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
			}
		}

		this.walls.forEach(wall => wall.draw(this.ctx, this.gridSize));

		this.food.draw(this.ctx, this.gridSize);

		this.snake.draw(this.ctx, this.gridSize);
	}

	private updateScore(): void {
		const scoreElement = document.getElementById('score');
		if (scoreElement) scoreElement.textContent = this.score.toString();
	}

	private gameOver(): void {
		this.gameRunning = false;
		
		this.sendScoreToBackend(this.score);

		const finalScoreElement = document.getElementById('finalScore');
		if (finalScoreElement) {
			finalScoreElement.textContent = this.score.toString();
		}

		const gameOverMenu = document.getElementById('gameOverMenu');
		if (gameOverMenu) {
			gameOverMenu.classList.add('visible');
		}

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
		if (await window.SPA.checkJwtValidity()) {
		try {
			const response = await fetch('http://localhost:3000/snake/add-score', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` 
				},
				body: JSON.stringify({ score }),
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error('Failed to submit score');
			}

			const data = await response.json();
			console.log('Score submitted successfully:', data);
			
			await this.fetchLeaderboardData();
			
		} catch (error) {
			console.error('Error submitting score:', error);
		}
	}
}

	private async fetchLeaderboardData(): Promise<void> {
		if (await window.SPA.checkJwtValidity()) {
		try {
			const response = await fetch('http://localhost:3000/snake/nearest-score', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
				},
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error('Failed to fetch leaderboard data');
			}

			const data = await response.json();
			console.log('Leaderboard data:', data);
			this.updateLeaderboardUI(data);
		} catch (error) {
			console.error('Error fetching leaderboard data:', error);
		}
		}
	}
	
	private updateLeaderboardUI(data: any): void {
		const globalBestElement = document.getElementById('globalBestScore');
		if (globalBestElement && data.globalBest) {
			globalBestElement.textContent = data.globalBest.toString();
		}
		const nextScoreElement = document.getElementById('nextScoreToBeat');
		if (nextScoreElement && data.nextScore) {
			nextScoreElement.textContent = data.nextScore.toString();
		}
		const playerRankElement = document.getElementById('playerRank');
		if (playerRankElement && data.playerRank) {
			playerRankElement.textContent = data.playerRank.toString();
		}
	}
showGameOverActions(): void {
    const oldOverlay = document.getElementById('gameOverActions');
    oldOverlay?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'gameOverActions';
    overlay.className = 'absolute top-1/2 left-[calc(100%+24px)] -translate-y-1/2 flex flex-col items-center gap-4 bg-[#232526] rounded-lg shadow-lg p-7 z-100 min-w-[140px]';
    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'Restart';
    restartBtn.className = 'px-4 py-2 bg-[#2ed573] text-black font-bold rounded-md hover:bg-[#27c264] hover:-translate-y-0.5 hover:shadow-md transition-all';
    restartBtn.onclick = () => {
        overlay.remove();
        new SnakeGame();
    };
    const homeBtn = document.createElement('button');
    homeBtn.textContent = 'Home';
    homeBtn.className = 'px-4 py-2 bg-[#555] text-white font-bold rounded-md hover:bg-[#666] hover:-translate-y-0.5 hover:shadow-md transition-all';
    homeBtn.onclick = () => {
        window.location.href = '/home';
    };

    overlay.appendChild(restartBtn);
    overlay.appendChild(homeBtn);

    const canvas = document.getElementById('gameCanvas');
    const container = canvas?.parentElement;
    if (container) {
        container.style.position = 'relative';
        container.appendChild(overlay);
    }
}

showGameOverScreen(): void {
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'fixed inset-0 bg-black/80 flex flex-col justify-center items-center z-50';
    gameOverDiv.innerHTML = `
        <h2 class="text-[#ff5e57] text-4xl uppercase mb-4 shadow-[0_0_10px_rgba(255,94,87,0.5)]">Game Over!</h2>
        <p class="text-white text-xl mb-5">Score Final: <span class="text-[#2ed573] text-2xl font-bold">${this.score}</span></p>
        <button id="restartBtn" class="bg-[#2ed573] text-[#111] px-5 py-2 border-0 rounded-md text-base font-bold cursor-pointer transition-all hover:bg-[#27c264] hover:-translate-y-0.5 hover:shadow-lg">Rejouer</button>
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
		
		const gameOverMenu = document.getElementById('gameOverMenu');
		if (gameOverMenu) {
			gameOverMenu.classList.remove('visible');
		}
	}

}

let currentGame: SnakeGame | null = null;

document.addEventListener('DOMContentLoaded', () => {
	if (currentGame) {
		currentGame.destroy();
	}
	
	currentGame = new SnakeGame();
	
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
