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
class Food {
	constructor(public position: Position) {}

	draw(ctx: CanvasRenderingContext2D, gridSize: number): void {
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
		if (currentVector.x === -newVector.x && currentVector.y === -newVector.y) {
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
			ctx.shadowBlur = 0;
		});
	}
}

// Main game class
class SnakeGame {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private readonly gridSize: number = 20;
	private readonly gridWidth: number;
	private readonly gridHeight: number;

	private snake: Snake;
	private food: Food;
	private score: number = 0;
	private highScore: number;
	private gameRunning: boolean = true;
	private gameSpeed: number = 150;

	constructor() {
		this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d')!;
		this.gridWidth = this.canvas.width / this.gridSize;
		this.gridHeight = this.canvas.height / this.gridSize;

		this.snake = new Snake(new Position(Math.floor(this.gridWidth / 2), Math.floor(this.gridHeight / 2)));
		this.food = this.generateFood();
		this.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');

		this.updateScore();
		this.setupEventListeners();
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
		if (this.snake.checkWallCollision(this.gridWidth, this.gridHeight)) {
			this.gameOver();
			return;
		}

		// Check self collision
		if (this.snake.checkSelfCollision()) {
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

			// Increase speed slightly
			this.gameSpeed = Math.max(80, this.gameSpeed - 2);
		} else {
			this.snake.removeTail();
		}
	}

	private draw(): void {
		// Clear canvas
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw grid
		this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
		this.ctx.lineWidth = 1;
		for (let i = 0; i <= this.gridWidth; i++) {
			this.ctx.beginPath();
			this.ctx.moveTo(i * this.gridSize, 0);
			this.ctx.lineTo(i * this.gridSize, this.canvas.height);
			this.ctx.stroke();
		}
		for (let i = 0; i <= this.gridHeight; i++) {
			this.ctx.beginPath();
			this.ctx.moveTo(0, i * this.gridSize);
			this.ctx.lineTo(this.canvas.width, i * this.gridSize);
			this.ctx.stroke();
		}

		// Draw food
		this.food.draw(this.ctx, this.gridSize);

		// Draw snake
		this.snake.draw(this.ctx, this.gridSize);
	}

	private updateScore(): void {
		const scoreElement = document.getElementById('score');
		const highScoreElement = document.getElementById('highScore');

		if (scoreElement) scoreElement.textContent = this.score.toString();
		if (highScoreElement) highScoreElement.textContent = this.highScore.toString();
	}

	private gameOver(): void {
		this.gameRunning = false;

		if (this.score > this.highScore) {
			this.highScore = this.score;
			localStorage.setItem('snakeHighScore', this.highScore.toString());
			this.updateScore();
		}

		// Show game over screen
		this.showGameOverScreen();
	}

	private showGameOverScreen(): void {
		const gameOverDiv = document.createElement('div');
		gameOverDiv.className = 'game-over';
		gameOverDiv.innerHTML = `
			<h2>Game Over!</h2>
			<p>Final Score: ${this.score}</p>
			${this.score === this.highScore ? '<p style="color: #ffd700;">🎉 New High Score! 🎉</p>' : ''}
			<button class="restart-btn" id="restartBtn">Play Again</button>
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
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	new SnakeGame();
});
