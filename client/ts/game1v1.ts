enum KeyBindings
{
	UP = 38,
	DOWN = 40
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
	winner: string; // "player1" or "player2"
	game_type: string; // e.g., "pong"
}

const WALL_OFFSET = 20;

import { SPA } from './spa';

export class Game1v1
{
	private gameCanvas: HTMLCanvasElement;
	private gameContext: CanvasRenderingContext2D;

	public static keys1Pressed: boolean[] = [];
	public static keys2Pressed: boolean[] = [];
	public static player1Score: number = 0;
	public static player2Score: number = 0;

	public running:boolean = false;
	public requestFrameID:number = 0;
	public keyDownHandler:any;
	public keyUpHandler:any;
	public difficulty: Difficulty = Difficulty.EASY;
	private player1: Paddle;
	private player2: Paddle;
	private ball: Ball;

	private static currentInstance: Game1v1 | null = null;

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

		Game1v1.keys1Pressed = [];
		Game1v1.keys2Pressed = [];
		Game1v1.player1Score = 0;
		Game1v1.player2Score = 0;
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
		console.log("Game1v1 difficulty set to: " + Difficulty[this.difficulty]);
		const paddleWidth:number = 20, paddleHeight:number = 70, ballSize:number = 10, wallOffset:number = WALL_OFFSET;

		this.player1 = new Paddle(paddleWidth,paddleHeight,wallOffset,this.gameCanvas.height / 2 - paddleHeight / 2, paddleSpeed, 1);
		this.player2 = new Paddle(paddleWidth,paddleHeight,this.gameCanvas.width - (wallOffset + paddleWidth) ,this.gameCanvas.height / 2 - paddleHeight / 2, paddleSpeed, 2);
		this.ball = new Ball(ballSize,ballSize,this.gameCanvas.width / 2 - ballSize / 2, this.gameCanvas.height / 2 - ballSize / 2, ballSpeed);
	}
	handleKeyDown(e:any)
	{
		if (e.code == "ArrowUp")
		{
			Game1v1.keys2Pressed[KeyBindings.UP] = true;
			e.preventDefault();
		}
		if (e.code == "ArrowDown")
		{
			Game1v1.keys2Pressed[KeyBindings.DOWN] = true;
			e.preventDefault();
		}
		if (e.code == "KeyW")
			Game1v1.keys1Pressed[KeyBindings.UP] = true;
		if (e.code == "KeyS")
			Game1v1.keys1Pressed[KeyBindings.DOWN] = true;
	}
	handleKeyUp(e:any)
	{
		if (e.code == "ArrowUp")
			Game1v1.keys2Pressed[KeyBindings.UP] = false;
		if (e.code == "ArrowDown")
			Game1v1.keys2Pressed[KeyBindings.DOWN] = false;
		if (e.code == "KeyW")
			Game1v1.keys1Pressed[KeyBindings.UP] = false;
		if (e.code == "KeyS")
			Game1v1.keys1Pressed[KeyBindings.DOWN] = false;
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
		Game1v1.keys1Pressed = [];
		Game1v1.keys2Pressed = [];
		Game1v1.player1Score = 0;
		Game1v1.player2Score = 0;
		console.log("Game1v1 instance destroyed!");
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
		this.player1.update(this.gameCanvas);
		this.player2.update(this.gameCanvas);
		this.ball.update(this.player1,this.player2,this.gameCanvas);
	}
	draw()
	{
		this.gameContext.fillStyle = "#DAB1DA";
		this.gameContext.fillRect(0,0,this.gameCanvas.width,this.gameCanvas.height);
		this.drawBoardDetails();
		this.player1.draw(this.gameContext);
		this.player2.draw(this.gameContext);
		this.ball.draw(this.gameContext);
	}
	gameLoop()
	{
		const p1Score = document.getElementById('player1-score');
		const p2Score = document.getElementById('player2-score');
		if (Game1v1.player1Score >= 5 || Game1v1.player2Score >= 5)
		{
			this.running = false;
			this.showEndScreen(); // UI improvement
			this.postFinalGameResults(); // Send results
			return;
		}
		if (!this.running)
			return;
		this.update();
		this.draw();
		if (p1Score && p2Score) {
			p1Score.textContent = Game1v1.player1Score.toString();
			p2Score.textContent = Game1v1.player2Score.toString();
		}
		requestAnimationFrame(() => this.gameLoop());
	}

	async postFinalGameResults() {
		const gameResults = {
			player1_score: Game1v1.player1Score,
			player2_score: Game1v1.player2Score,
			winner: Game1v1.player1Score > Game1v1.player2Score ? "player1" : "player2",
			game_type: "Pong 1v1",
		};
		if (await window.SPA.checkJwtValidity()) {
			try {
				const response = await fetch('http://localhost:3000/add-match', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
					},
					body: JSON.stringify(gameResults)
				})
				console.log(response);
				if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
				console.log('Final game results posted successfully');
			} catch (error) {
				console.error('Error posting final results:', error);
			}
		}
	}

	private static async GetCurrentUsername(): Promise <string | null> {
		try 
		{
			const response = await fetch('http://localhost:3000/user', {
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
			console.error('Error fetching current username:', error);
			return null;
		}
	}

	async showEndScreen() {
		const container = document.querySelector('.page-content');
		if (!container) return;

		// Remove old end screen if present
		const oldEnd = document.getElementById('end-screen');
		if (oldEnd) oldEnd.remove();

		// Récupérer le pseudo du joueur 1 depuis l'élément HTML
		let player1Name: string = await Game1v1.GetCurrentUsername() || "Vous";
		console.log("Player 1 Name is " + player1Name); 
		const player1NameElement = document.getElementById("player1-name");
		if (player1Name == null || player1Name === "Vous")
		{
			if (player1NameElement && player1NameElement.textContent) {
				player1Name = player1NameElement.textContent;
			}
		}

		const winner = Game1v1.player1Score > Game1v1.player2Score ? player1Name : "The Challenger";
		const endDiv = document.createElement('div');
		endDiv.id = 'end-screen';
		endDiv.className = 'flex flex-col items-center mt-6';

		const msg = document.createElement('div');
		msg.className = 'text-3xl font-bold text-pink-400 mb-4';
		msg.textContent = `${winner} wins!`;

		const restartBtn = document.createElement('button');
		restartBtn.className = 'px-6 py-2 bg-pink-400 text-white font-bold rounded-lg shadow hover:bg-[#85e7ff] transition mb-2';
		restartBtn.textContent = 'Restart';
		restartBtn.onclick = () => Game1v1.startNewGame(this.difficulty);

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

	public static startNewGame(difficulty: Difficulty = Difficulty.EASY) {
		// Destroy previous instance if it exists
		if (Game1v1.currentInstance) {
			Game1v1.currentInstance.destroy();
		}
		// Show canvas again if hidden
		const canvas = document.getElementById('game-canvas');
		if (canvas) canvas.style.display = '';
		// Remove end screen if present
		const oldEnd = document.getElementById('end-screen');
		if (oldEnd) oldEnd.remove();
		
		// Mettre à jour le nom du joueur 1
		this.updatePlayerName();
		
		// Start new game
		const game = new Game1v1(difficulty);
		Game1v1.currentInstance = game;
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
		const keysPressed = this.playerNumber === 1 ? Game1v1.keys1Pressed : Game1v1.keys2Pressed;
		if (keysPressed[KeyBindings.UP])
		{
			this.yVel = -1;
			if(this.y <= WALL_OFFSET)
			{
				this.yVel = 0
			}
		}
		else if (keysPressed[KeyBindings.DOWN])
		{
			this.yVel = 1;
			if (this.y + this.height >= canvas.height - WALL_OFFSET)
			{
				this.yVel = 0;
			}
		}
		else
		{
			this.yVel = 0;
		}
		this.y += this.yVel * this.speed;
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

		const dir = Math.random() < 0.5 ? -1 : 1;
		const up_down = Math.random() < 0.5 ? -1 : 1;
		this.xVel = dir;
		if (up_down == -1)
			this.yVel = dir - Math.random();
		else
			this.yVel = dir + Math.random();
		this.speed = this.startSpeed;
	}
	update(player1:Paddle,player2:Paddle,canvas: HTMLCanvasElement): void
	{
		//check left canvas bounds
		if(this.x <= 0)
		{
			Game1v1.player2Score += 1;
			this.reset(canvas);
			return ;
		}
		//check right canvas bounds
		if (this.x + this.width >= canvas.width)
		{
			Game1v1.player1Score += 1;
			this.reset(canvas);
			return ;
		}
		//check top canvas bounds
		if (this.y <= 10)
		{
			this.y = 10;
				this.yVel = Math.abs(this.yVel); // always positive after bounce
		}
		//check bottom canvas bounds
		if (this.y + this.height >= canvas.height - 10)
		{
			this.y = canvas.height - 10 - this.height;
				this.yVel = -Math.abs(this.yVel); // always positive after bounce
		}
		//check player collision
		// Player1 paddle collision
		if (this.x <= player1.x + player1.width &&
			this.x + this.width >= player1.x &&
			this.y < player1.y + player1.height &&
			this.y + this.height > player1.y)
		{
			this.xVel = 1;
			this.yVel += player1.yVel * 0.5;
		}
		// Player2 paddle collision
		if (this.x + this.width >= player2.x &&
			this.x <= player2.x + player2.width &&
			this.y < player2.y + player2.height &&
			this.y + this.height > player2.y)
		{
			this.xVel = -1;
			this.yVel += player2.yVel * 0.5;
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
