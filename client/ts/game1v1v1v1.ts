enum KeyBindings
{
	UP = 38,
	DOWN = 40,
	LEFT = 37,
	RIGHT = 39
}

enum Difficulty {
	EASY = 1,
	MEDIUM = 2,
	HARD = 3
}

interface GameResults {
	player1_id: number;
	player1_name: string;
	player1_score: number;
	player2_score: number;
	player3_score: number;
	player4_score: number;
	winner: string;
	game_type: string;
}

const WALL_OFFSET = 20;

import { SPA } from './spa';

export class Game1v1v1v1
{
	private gameCanvas: HTMLCanvasElement;
	private gameContext: CanvasRenderingContext2D;

	public static keys1Pressed: boolean[] = [];
	public static keys2Pressed: boolean[] = [];
	public static keys3Pressed: boolean[] = [];
	public static keys4Pressed: boolean[] = [];

	public static player1Score: number = 0;
	public static player2Score: number = 0;
	public static player3Score: number = 0;
	public static player4Score: number = 0;

	public running:boolean = false;
	public requestFrameID:number = 0;
	public keyDownHandler:any;
	public keyUpHandler:any;
	public difficulty: Difficulty = Difficulty.EASY;
	private player1: Paddle;
	private player2: Paddle;
	private player3: Paddle;
	private player4: Paddle;
	private ball: Ball;

	private static currentInstance: Game1v1v1v1 | null = null;

	constructor(difficulty: Difficulty = Difficulty.EASY)
	{
		this.gameCanvas = document.getElementById("game-canvas") as HTMLCanvasElement;
		this.gameContext = this.gameCanvas.getContext("2d")!;
		this.gameContext.font = "30px 'Orbitron', sans-serif";

		this.difficulty = difficulty;
		this.running = true;
		this.keyDownHandler = this.handleKeyDown.bind(this);
		this.keyUpHandler = this.handleKeyUp.bind(this);
		window.addEventListener("keyup", this.keyUpHandler);
		window.addEventListener("keydown", this.keyDownHandler);

		Game1v1v1v1.keys1Pressed = [];
		Game1v1v1v1.keys2Pressed = [];
		Game1v1v1v1.keys3Pressed = [];
		Game1v1v1v1.keys4Pressed = [];
		Game1v1v1v1.player1Score = 0;
		Game1v1v1v1.player2Score = 0;
		Game1v1v1v1.player3Score = 0;
		Game1v1v1v1.player4Score = 0;
		let paddleSpeed:number = 8, ballSpeed:number = 3;
		if (this.difficulty === Difficulty.EASY)
		{
			paddleSpeed = 6;
			ballSpeed = 3
		}
		if (this.difficulty === Difficulty.HARD)
		{
			paddleSpeed = 12;
			ballSpeed = 4;
		}
		// console.log("Game1v1v1v1 difficulty set to: " + Difficulty[this.difficulty]);
		const paddleWidth:number = 20, paddleHeight:number = 70, ballSize:number = 10, wallOffset:number = WALL_OFFSET;

		this.player1 = new Paddle(paddleWidth,paddleHeight,wallOffset,this.gameCanvas.height / 2 - paddleHeight / 2, paddleSpeed, 1);
		this.player2 = new Paddle(paddleWidth,paddleHeight,this.gameCanvas.width - (wallOffset + paddleWidth) ,this.gameCanvas.height / 2 - paddleHeight / 2, paddleSpeed, 2);
		this.player3 = new Paddle(paddleHeight, paddleWidth, this.gameCanvas.width / 2 - paddleHeight / 2, wallOffset, paddleSpeed, 3);
		this.player4 = new Paddle(paddleHeight, paddleWidth, this.gameCanvas.width / 2 - paddleHeight / 2, this.gameCanvas.height - (wallOffset + paddleWidth), paddleSpeed, 4);
		this.ball = new Ball(ballSize,ballSize,this.gameCanvas.width / 2 - ballSize / 2, this.gameCanvas.height / 2 - ballSize / 2, ballSpeed);
	}
	handleKeyDown(e:any)
	{
		if (e.code == "KeyW")
			Game1v1v1v1.keys1Pressed[KeyBindings.UP] = true;
		if (e.code == "KeyS")
			Game1v1v1v1.keys1Pressed[KeyBindings.DOWN] = true;
		if (e.code == "ArrowUp")
		{
			Game1v1v1v1.keys2Pressed[KeyBindings.UP] = true;
			e.preventDefault();
		}
		if (e.code == "ArrowDown")
		{
			Game1v1v1v1.keys2Pressed[KeyBindings.DOWN] = true;
			e.preventDefault();
		}
		if (e.code == "KeyH")
			Game1v1v1v1.keys3Pressed[KeyBindings.RIGHT] = true;
		if (e.code == "KeyF")
			Game1v1v1v1.keys3Pressed[KeyBindings.LEFT] = true;
		if (e.code == "KeyL")
			Game1v1v1v1.keys4Pressed[KeyBindings.RIGHT] = true;
		if (e.code == "KeyJ")
			Game1v1v1v1.keys4Pressed[KeyBindings.LEFT] = true;
	}
	handleKeyUp(e:any)
	{
		if (e.code == "ArrowUp")
			Game1v1v1v1.keys2Pressed[KeyBindings.UP] = false;
		if (e.code == "ArrowDown")
			Game1v1v1v1.keys2Pressed[KeyBindings.DOWN] = false;
		if (e.code == "KeyW")
			Game1v1v1v1.keys1Pressed[KeyBindings.UP] = false;
		if (e.code == "KeyS")
			Game1v1v1v1.keys1Pressed[KeyBindings.DOWN] = false;
		if (e.code == "KeyH")
			Game1v1v1v1.keys3Pressed[KeyBindings.RIGHT] = false;
		if (e.code == "KeyF")
			Game1v1v1v1.keys3Pressed[KeyBindings.LEFT] = false;
		if (e.code == "KeyL")
			Game1v1v1v1.keys4Pressed[KeyBindings.RIGHT] = false;
		if (e.code == "KeyJ")
			Game1v1v1v1.keys4Pressed[KeyBindings.LEFT] = false;
	}
	destroy()
	{
		this.running = false;
		if (this.requestFrameID != 0)
		{
			cancelAnimationFrame(this.requestFrameID);
			this.requestFrameID = 0;
		}
		window.removeEventListener("keydown", this.keyDownHandler);
		window.removeEventListener("keyup", this.keyUpHandler);
		if (this.gameCanvas && this.gameContext)
			this.gameContext.clearRect(0,0, this.gameCanvas.width, this.gameCanvas.height);
		Game1v1v1v1.keys1Pressed = [];
		Game1v1v1v1.keys2Pressed = [];
		Game1v1v1v1.keys3Pressed = [];
		Game1v1v1v1.keys4Pressed = [];
		Game1v1v1v1.player1Score = 0;
		Game1v1v1v1.player2Score = 0;
		Game1v1v1v1.player3Score = 0;
		Game1v1v1v1.player4Score = 0;
		// console.log("Game1v1v1v1 instance destroyed!");
	}
	drawBoardDetails()
	{
		// Draw glowing court outline
		const gradient = this.gameContext.createLinearGradient(0, 0, this.gameCanvas.width, this.gameCanvas.height);
		gradient.addColorStop(0, "pink");
		gradient.addColorStop(1, "pink");
		this.gameContext.strokeStyle = gradient;
		this.gameContext.lineWidth = 6;
		this.gameContext.shadowColor = "#F2BDCD";
		this.gameContext.shadowBlur = 16;
		this.gameContext.strokeRect(8,8,this.gameCanvas.width - 15,this.gameCanvas.height - 15);

		// Draw center dashed line with glow
		this.gameContext.shadowBlur = 8;
		this.gameContext.fillStyle = "white";
		for (let i = 0; i + 30 < this.gameCanvas.height; i += 31) {
			this.gameContext.fillRect(this.gameCanvas.width / 2 - 4, i + 10, 8, 20);
		}
		this.gameContext.shadowBlur = 0;
	}
	update()
	{
		this.ball.update(this.player1, this.player2, this.player3, this.player4, this.gameCanvas); // Fixed: added player3, player4
		this.player1.update(this.gameCanvas);
		this.player2.update(this.gameCanvas);
		this.player3.update(this.gameCanvas);
		this.player4.update(this.gameCanvas);
	}
	draw()
	{
		this.gameContext.fillStyle = "#DAB1DA";
		this.gameContext.fillRect(0,0,this.gameCanvas.width,this.gameCanvas.height);
		this.drawBoardDetails();
		this.player1.draw(this.gameContext);
		this.player2.draw(this.gameContext);
		this.player3.draw(this.gameContext); // Added missing player 3
		this.player4.draw(this.gameContext); // Added missing player 4
		this.ball.draw(this.gameContext);
	}
	gameLoop()
	{
		const p1Score = document.getElementById('player1-score');
		const p2Score = document.getElementById('player2-score');
		const p3Score = document.getElementById('player3-score');
		const p4Score = document.getElementById('player4-score');
		
		if (Game1v1v1v1.player1Score >= 5 || 
			Game1v1v1v1.player2Score >= 5 || 
			Game1v1v1v1.player3Score >= 5 || 
			Game1v1v1v1.player4Score >= 5)
		{
			this.running = false;
			this.showEndScreen();
			this.postFinalGameResults();
			return;
		}
		
		if (!this.running)
			return;
			
		this.update();
		this.draw();
		
		if (p1Score)
			p1Score.textContent = Game1v1v1v1.player1Score.toString();
		if (p2Score)
			p2Score.textContent = Game1v1v1v1.player2Score.toString();
		if (p3Score)
			p3Score.textContent = Game1v1v1v1.player3Score.toString();
		if (p4Score)
			p4Score.textContent = Game1v1v1v1.player4Score.toString();
		requestAnimationFrame(() => this.gameLoop());
	}

	async postFinalGameResults() {
		const scores = [Game1v1v1v1.player1Score, Game1v1v1v1.player2Score, Game1v1v1v1.player3Score, Game1v1v1v1.player4Score];
		const maxScore = Math.max(...scores);
		const winnerIndex = scores.indexOf(maxScore);
		const winners = ["player1", "player2", "player3", "player4"];
		
		const gameResults = {
			player1_score: Game1v1v1v1.player1Score,
			player2_score: Game1v1v1v1.player2Score,
			player3_score: Game1v1v1v1.player3Score,
			player4_score: Game1v1v1v1.player4Score,
			winner: winners[winnerIndex], // Fixed: now considers all 4 players
			game_type: "Pong 1v1v1v1",
		};
		if (await window.SPA.checkJwtValidity()) {
			try {
				const response = await fetch('/api/add-match', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
					},
					body: JSON.stringify(gameResults)
				})
				// console.log(response);
				if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
				// console.log('Final game results posted successfully');
			} catch (error) {
				// console.error('Error posting final results:', error);
			}
		}
	}

	private static async GetCurrentUsername(): Promise <string | null> {
		try 
		{
			const response = await fetch('/api/user', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
				}
			});
			if (!response.ok) 
				throw new Error(`HTTP error! status: ${response.status}`);
			const data = await response.json();
			return (data.user.username || null);
		} catch (error) {
			// console.error('Error fetching current username:', error);
			return (null);
		}
	}

	async showEndScreen() {
		const container = document.querySelector('.page-content');
		if (!container)
			return;

		const oldEnd = document.getElementById('end-screen');
		if (oldEnd)
			oldEnd.remove();

		let player1Name: string = await Game1v1v1v1.GetCurrentUsername() || "Vous";
		const player1NameElement = document.getElementById("player1-name");
		if (player1Name == null || player1Name === "Vous")
		{
			if (player1NameElement && player1NameElement.textContent) {
				player1Name = player1NameElement.textContent;
			}
		}

		const scores = [
			{ name: player1Name, score: Game1v1v1v1.player1Score, player: "Player 1" },
			{ name: "Player 2", score: Game1v1v1v1.player2Score, player: "Player 2" },
			{ name: "Player 3", score: Game1v1v1v1.player3Score, player: "Player 3" },
			{ name: "Player 4", score: Game1v1v1v1.player4Score, player: "Player 4" }
		];
		
		const winner = scores.reduce((prev, current) => 
			(prev.score > current.score) ? prev : current
		);
		
		const endDiv = document.createElement('div');
		endDiv.id = 'end-screen';
		endDiv.className = 'flex flex-col items-center mt-6';

		const msg = document.createElement('div');
		msg.className = 'text-3xl font-bold text-pink-400 mb-4';
		msg.textContent = `${winner.name} wins with ${winner.score} points!`;

		const restartBtn = document.createElement('button');
		restartBtn.className = 'px-6 py-2 bg-pink-400 text-white font-bold rounded-lg shadow hover:bg-[#85e7ff] transition mb-2';
		restartBtn.textContent = 'Restart';
		restartBtn.onclick = () => Game1v1v1v1.startNewGame(this.difficulty);

		const homeBtn = document.createElement('button');
		homeBtn.className = 'px-6 py-2 bg-pink-400 text-white font-bold rounded-lg shadow hover:bg-[#85e7ff] transition';
		homeBtn.textContent = 'Home';
		homeBtn.onclick = () => SPA.navigateTo('/home');

		endDiv.appendChild(msg);
		endDiv.appendChild(restartBtn);
		endDiv.appendChild(homeBtn);
		container.appendChild(endDiv);

		const canvas = document.getElementById('game-canvas');
		if (canvas) canvas.style.display = 'none';
	}

	public static async startNewGame(difficulty: Difficulty = Difficulty.EASY) {
		// Destroy previous instance if it exists
		if (Game1v1v1v1.currentInstance) {
			Game1v1v1v1.currentInstance.destroy();
		}
		// Show canvas again if hidden
		const canvas = document.getElementById('game-canvas');
		if (canvas) canvas.style.display = '';
		// Remove end screen if present
		const oldEnd = document.getElementById('end-screen');
		if (oldEnd) oldEnd.remove();
		
		// Mettre à jour le nom du joueur 1
		await this.updatePlayerName();
		
		// Start new game
		const game = new Game1v1v1v1(difficulty);
		Game1v1v1v1.currentInstance = game;
		game.gameLoop();
	}
	
	// Fonction pour mettre à jour le nom du joueur 1
	private static updatePlayerName() {
		const player1NameElement = document.getElementById('player1-name');
		if (player1NameElement) {
			// Récupérer le nom d'utilisateur du localStorage ou de la session
			const username = localStorage.getItem('username') || sessionStorage.getItem('username');
			if (username) {
				player1NameElement.textContent = username;
			} else {
				// Fallback si aucun nom n'est trouvé
				player1NameElement.textContent = "Vous";
			}
		}
	}
}

class Entity
{
	width:number;
	height:number;
	x:number;
	y:number;
	speed:number;
	xVel:number = 0;
	yVel:number = 0;
	constructor(w:number,h:number,x:number,y:number, speed:number)
	{
		this.width = w;
		this.height = h;
		this.x = x;
		this.y = y;
		this.speed = speed;
	}
	draw(context: CanvasRenderingContext2D): void
	{
		context.fillStyle = "#f00";
		context.fillRect(this.x,this.y,this.width,this.height);
	}
}

class Paddle extends Entity
{
	private playerNumber: number;
	constructor(w:number, h:number, x:number, y:number, speed:number, playerNumber:number)
	{
		super(w,h,x,y,speed);
		this.playerNumber = playerNumber;
	}

	update(canvas: HTMLCanvasElement): void
	{
		const keysPressed = this.playerNumber === 1 ? Game1v1v1v1.keys1Pressed : 
				this.playerNumber === 2 ? Game1v1v1v1.keys2Pressed :
				this.playerNumber === 3 ? Game1v1v1v1.keys3Pressed : Game1v1v1v1.keys4Pressed;
	
		// Players 1 and 2 (left/right) move vertically
		if (this.playerNumber === 1 || this.playerNumber === 2)
		{
			if (keysPressed[KeyBindings.UP])
			{
				this.yVel = -1;
				if (this.y <= WALL_OFFSET)
					this.yVel = 0;
			}
			else if (keysPressed[KeyBindings.DOWN]) 
			{
				this.yVel = 1;
				if (this.y + this.height >= canvas.height - WALL_OFFSET)
					this.yVel = 0;
			}
			else
				this.yVel = 0;
			this.y += this.yVel * this.speed;
		}
		else 
		{
			if (keysPressed[KeyBindings.LEFT])
			{
				this.xVel = -1;
				if (this.x <= WALL_OFFSET)
				{
					this.xVel = 0;
				}
			}
			else if (keysPressed[KeyBindings.RIGHT])
			{
				this.xVel = 1;
				if (this.x + this.width >= canvas.width - WALL_OFFSET)
				{
					this.xVel = 0;
				}
			}
			else
				this.xVel = 0;
			this.x += this.xVel * this.speed;
		}
	}
	draw(context: CanvasRenderingContext2D): void
	{
		context.save();
		context.shadowColor = "#F2BDCD";
		context.shadowBlur = 12;
		context.fillStyle = this.playerNumber === 1 ? "white" : "white";
		context.fillRect(this.x,this.y,this.width,this.height);
		context.restore();
	}
}

class Ball extends Entity
{
	private startSpeed: number = this.speed;
	constructor(w:number,h:number,x:number,y:number,speed:number)
	{
		super(w,h,x,y,speed);
		var randomDirection = Math.floor(Math.random() * 2) + 1;
		if(randomDirection % 2)
		{
			this.xVel = 1;
		}
		else
		{
			this.xVel = -1;
		}
		this.yVel = 1;
	}
	reset(canvas: HTMLCanvasElement): void
	{
		this.x = canvas.width / 2 - this.width / 2;
		this.y = canvas.height / 2 - this.height / 2;

		const angle = Math.random() * 2 * Math.PI;
		
		this.xVel = Math.cos(angle);
		this.yVel = Math.sin(angle);
		
		const minSpeed = 0.3;
		if (Math.abs(this.xVel) < minSpeed) {
			this.xVel = this.xVel >= 0 ? minSpeed : -minSpeed;
		}
		if (Math.abs(this.yVel) < minSpeed) {
			this.yVel = this.yVel >= 0 ? minSpeed : -minSpeed;
		}
		
		this.speed = this.startSpeed;
	}
	update(player1:Paddle,player2:Paddle,player3:Paddle,player4:Paddle, canvas: HTMLCanvasElement): void
	{
		if(this.x <= WALL_OFFSET)
		{
			Game1v1v1v1.player2Score += 1;
			Game1v1v1v1.player3Score += 1;
			Game1v1v1v1.player4Score += 1;
			this.reset(canvas);
			return;
		}
		
		if (this.x + this.width >= canvas.width - WALL_OFFSET)
		{
			Game1v1v1v1.player1Score += 1;
			Game1v1v1v1.player3Score += 1;
			Game1v1v1v1.player4Score += 1;
			this.reset(canvas);
			return;
		}
		
		if (this.y <= WALL_OFFSET)
		{
			Game1v1v1v1.player1Score += 1;
			Game1v1v1v1.player2Score += 1;
			Game1v1v1v1.player4Score += 1;
			this.reset(canvas);
			return;
		}
		
		if (this.y + this.height >= canvas.height - WALL_OFFSET)
		{
			Game1v1v1v1.player1Score += 1;
			Game1v1v1v1.player2Score += 1;
			Game1v1v1v1.player3Score += 1;
			this.reset(canvas);
			return;
		}
		// Player1 paddle collision (left)
		if (this.x <= player1.x + player1.width &&
			this.x + this.width >= player1.x &&
			this.y < player1.y + player1.height &&
			this.y + this.height > player1.y)
		{
			this.xVel = Math.abs(this.xVel);
			this.yVel += player1.yVel * 0.5;
		}
		
		// Player2 paddle collision (right)
		if (this.x + this.width >= player2.x &&
			this.x <= player2.x + player2.width &&
			this.y < player2.y + player2.height &&
			this.y + this.height > player2.y)
		{
			this.xVel = -Math.abs(this.xVel);
			this.yVel += player2.yVel * 0.5;
		}
		
		// Player3 paddle collision (top)
		if (this.y <= player3.y + player3.height &&
			this.y + this.height >= player3.y &&
			this.x < player3.x + player3.width &&
			this.x + this.width > player3.x)
		{
			this.yVel = Math.abs(this.yVel);
			this.xVel += player3.xVel * 0.5;
		}
		
		// Player4 paddle collision (bottom)
		if (this.y + this.height >= player4.y &&
			this.y <= player4.y + player4.height &&
			this.x < player4.x + player4.width &&
			this.x + this.width > player4.x)
		{
			this.yVel = -Math.abs(this.yVel);
			this.xVel += player4.xVel * 0.5;
		}

		this.x += this.xVel * this.speed;
		this.y += this.yVel * this.speed;
		this.speed += 0.001;
	}
	draw(context: CanvasRenderingContext2D): void
	{
		context.save();
		context.shadowColor = "#fff";
		context.shadowBlur = 16;
		context.fillStyle = "#fff";
		context.beginPath();
		context.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, 2 * Math.PI);
		context.fill();
		context.restore();
	}
}
