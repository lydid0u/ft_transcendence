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

import { SPA } from './spa';

const WALL_OFFSET = 20;

export class Game
{
	private gameCanvas: HTMLCanvasElement;
	private gameContext: CanvasRenderingContext2D;

	public static keysPressed: boolean[] = [];
	public static playerScore: number = 0;
	public static computerScore: number = 0;
	public static currentInstance: Game | null = null;

	public running:boolean = false;
	public requestFrameID:number = 0;
	public keyDownHandler:any;
	public keyUpHandler:any;
	public difficulty: Difficulty = Difficulty.EASY;
	private player1: Paddle;
	private computerPlayer: ComputerPaddle;
	private ball: Ball;
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

		Game.keysPressed = [];
		Game.playerScore = 0;
		Game.computerScore = 0;
		Game.updatePlayerName();
		
		let paddleSpeed:number = 8, ballSpeed:number = 3;
		if (this.difficulty === Difficulty.EASY)
		{
			paddleSpeed = 6;
			ballSpeed = 2;
		}
		if (this.difficulty === Difficulty.HARD)
		{
			paddleSpeed = 12;
			ballSpeed = 4;
		}
		console.log("Game difficulty set to: " + Difficulty[this.difficulty]);
		const paddleWidth:number = 20, paddleHeight:number = 70, ballSize:number = 10, wallOffset:number = WALL_OFFSET;

		this.player1 = new Paddle(paddleWidth,paddleHeight,wallOffset,this.gameCanvas.height / 2 - paddleHeight / 2, paddleSpeed);
		this.computerPlayer = new ComputerPaddle(paddleWidth,paddleHeight,this.gameCanvas.width - (wallOffset + paddleWidth) ,this.gameCanvas.height / 2 - paddleHeight / 2, paddleSpeed, difficulty);
		this.ball = new Ball(ballSize,ballSize,this.gameCanvas.width / 2 - ballSize / 2, this.gameCanvas.height / 2 - ballSize / 2, ballSpeed);
	}
	handleKeyDown(e:any)
	{
		if (e.code == "ArrowUp")
		{
			Game.keysPressed[KeyBindings.UP] = true;
			e.preventDefault();
		}
		if (e.code == "ArrowDown")
		{
			Game.keysPressed[KeyBindings.DOWN] = true;
			e.preventDefault();
		}
	}
	handleKeyUp(e:any)
	{
		if (e.code == "ArrowUp")
			Game.keysPressed[KeyBindings.UP] = false;
		if (e.code == "ArrowDown")
			Game.keysPressed[KeyBindings.DOWN] = false;
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
		Game.keysPressed = [];
		Game.playerScore = 0;
		Game.computerScore = 0;
		console.log("Game instance destroyed!");
	}
	drawBoardDetails()
	{
		const gradient = this.gameContext.createLinearGradient(0, 0, this.gameCanvas.width, this.gameCanvas.height);
		gradient.addColorStop(0, "pink");
		gradient.addColorStop(1, "pink");
		this.gameContext.strokeStyle = gradient;
		this.gameContext.lineWidth = 6;
		this.gameContext.shadowColor = "#F2BDCD";
		this.gameContext.shadowBlur = 16;
		this.gameContext.strokeRect(8,8,this.gameCanvas.width - 15,this.gameCanvas.height - 15);
		this.gameContext.shadowBlur = 8;
		this.gameContext.fillStyle = "#F2BDCD";
		for (let i = 0; i + 30 < this.gameCanvas.height; i += 31) {
			this.gameContext.fillRect(this.gameCanvas.width / 2 - 4, i + 10, 8, 20);
		}
		this.gameContext.shadowBlur = 0;
	}
	update()
	{
		this.player1.update(this.gameCanvas);
		this.computerPlayer.update(this.ball,this.gameCanvas);
		this.ball.update(this.player1,this.computerPlayer,this.gameCanvas);
	}
	draw()
	{
		this.gameContext.fillStyle = "#DAB1DA";
		this.gameContext.fillRect(0,0,this.gameCanvas.width,this.gameCanvas.height);
		this.drawBoardDetails();
		this.player1.draw(this.gameContext);
		this.computerPlayer.draw(this.gameContext);
		this.ball.draw(this.gameContext);
	}
	gameLoop()
	{
	const pScore = document.getElementById('player-score');
	const aiScore = document.getElementById('computer-score');
		if (Game.playerScore >= 2 || Game.computerScore >= 2)
		{
			this.running = false;
			this.showEndScreen();
			this.postFinalGameResults(); // Enregistrer les résultats
			return;
		}
		if (!this.running)
			return;
		this.update();
		this.draw();
		if (pScore && aiScore) {
			pScore.textContent = Game.playerScore.toString();
			aiScore.textContent = Game.computerScore.toString();
		}
		requestAnimationFrame(() => this.gameLoop());
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
			console.error('Error fetching current username:', error);
			return null;
		}
	}

	async postFinalGameResults() {
		// Récupérer le pseudo du joueur depuis l'élément HTML
		let playerName: string = await Game.GetCurrentUsername() || "Vous";
		const player1NameElement = document.getElementById("player1-name");
		if (playerName == null || playerName === "Vous")
		{
			if (player1NameElement && player1NameElement.textContent) {
				playerName = player1NameElement.textContent;
			}
		}
		
		const gameResults = {
			player1_score: Game.playerScore,
			player2_score: Game.computerScore,
			winner: Game.playerScore > Game.computerScore ? "player1" : "player2",
			game_type: "Pong vs IA"
		};
		
		try {
			if (await window.SPA.checkJwtValidity()) {
				const token = localStorage.getItem('jwtToken');
				if (!token) {
					console.warn("Impossible d'enregistrer les résultats : token d'authentification non trouvé");
					return;
				}
				
				const response = await fetch('/api/add-match', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					credentials: 'include',
					body: JSON.stringify(gameResults)
				});
				
				console.log(response);
				if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
				console.log('Résultats de la partie contre l\'IA enregistrés avec succès');
			}
		}
		catch (error)
		{
			console.error('Erreur lors de l\'enregistrement des résultats:', error);
		}
	}
	async showEndScreen() {
		const container = document.querySelector('.page-content');
		if (!container) return;
		const oldEnd = document.getElementById('end-screen');
		if (oldEnd) oldEnd.remove();

		let playerName: string = await Game.GetCurrentUsername() || "Vous";
		console.log("Player 1 Name is " + playerName); 
		const player1NameElement = document.getElementById("player1-name");
		if (playerName == null || playerName === "Vous")
		{
			if (player1NameElement && player1NameElement.textContent) {
				playerName = player1NameElement.textContent;
			}
		}

		const winner = Game.playerScore > Game.computerScore ? playerName : "IA";
		const endDiv = document.createElement('div');
		endDiv.id = 'end-screen';
		endDiv.className = 'flex flex-col items-center mt-6';

		const msg = document.createElement('div');
		msg.className = 'text-3xl font-bold text-pink-500 mb-4';
		msg.textContent = `Winner : ${winner} !`;

		const restartBtn = document.createElement('button');
		restartBtn.className = 'px-6 py-2 bg-pink-500 text-white font-bold rounded-lg shadow hover:bg-pink-400 transition mb-2';
		restartBtn.textContent = 'Restart';
		restartBtn.onclick = () => Game.startNewGame(this.difficulty);

		const homeBtn = document.createElement('button');
		homeBtn.className = 'px-6 py-2 bg-pink-500 text-white font-bold rounded-lg shadow hover:bg-pink-400 transition';
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
		if (Game.currentInstance) {
			Game.currentInstance.destroy();
		}
		const canvas = document.getElementById('game-canvas');
		if (canvas) canvas.style.display = '';
		const oldEnd = document.getElementById('end-screen');
		if (oldEnd) oldEnd.remove();
		console.log("Tentative de mise à jour du nom du joueur...");
		Game.updatePlayerName();
		
		const game = new Game(difficulty);
		Game.currentInstance = game;
		game.gameLoop();
	}
	private static updatePlayerName() {
		const playerNameElement = document.getElementById('player-name');
		if (playerNameElement) {
			let username = localStorage.getItem('username');
			if (!username) {
				username = localStorage.getItem('userUsername');
			}
			if (!username) {
				username = localStorage.getItem('user_username');
			}
			if (!username) {
				username = sessionStorage.getItem('username');
			}
			if (username) {
				console.log("Nom d'utilisateur trouvé :", username);
				playerNameElement.textContent = username;
			} else {
				const token = localStorage.getItem('jwtToken');
				if (token) {
					try {
						const base64Url = token.split('.')[1];
						const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
						const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
							return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
						}).join(''));
						
						const payload = JSON.parse(jsonPayload);
						if (payload.username) {
							console.log("Nom d'utilisateur extrait du token :", payload.username);
							playerNameElement.textContent = payload.username;
						}
					} catch (e) {
						console.error("Erreur lors du décodage du token JWT:", e);
						playerNameElement.textContent = "Joueur";
					}
				} else {
					console.log("Aucun nom d'utilisateur trouvé, utilisation du fallback");
					playerNameElement.textContent = "Joueur";
				}
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
	constructor(w:number,h:number,x:number,y:number,speed:number)
	{
		super(w,h,x,y,speed);
	}
	update(canvas: HTMLCanvasElement): void
	{
		if (Game.keysPressed[KeyBindings.UP])
		{
			this.yVel = -1;
			if(this.y <= WALL_OFFSET)
			{
				this.yVel = 0
			}
		}
		else if (Game.keysPressed[KeyBindings.DOWN])
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
		context.fillStyle = "#e6fdff";
		context.fillRect(this.x,this.y,this.width,this.height);
		context.restore();
	}
}

class ComputerPaddle extends Entity
{
	private lastUpdateTime: number = 0;
	private updateInterval: number = 1000;
	private currentDecision: 'UP' | 'DOWN' | 'IDLE' = 'IDLE';
	private predictedBallPosition: { x: number, y: number } = { x: 0, y: 0 };
	private keySimulator: AIKeySimulator;
	private ballTrajectoryPredictor: BallTrajectoryPredictor;
	private movementDuration: number = 0;
	private targetY: number = 0;
	private difficulty: Difficulty;
	private overshootChance: number = 1;
				
	constructor(w: number, h: number, x: number, y: number, speed: number, difficulty: Difficulty = Difficulty.EASY)
	{
		super(w, h, x, y, speed);
		this.keySimulator = new AIKeySimulator();
		this.ballTrajectoryPredictor = new BallTrajectoryPredictor();
		this.difficulty = difficulty;
		this.setOvershootParameters();
	}

	private setOvershootParameters(): void
	{
		switch (this.difficulty)
		{
			case Difficulty.EASY:
				this.overshootChance = 0.40;
				break;
			case Difficulty.MEDIUM:
				this.overshootChance = 0.25;
				break;
			case Difficulty.HARD:
				this.overshootChance = 0.15;
				break;
		}
	}

	update(ball: Ball, canvas: HTMLCanvasElement): void
	{
		const currentTime = Date.now();
				
		if (currentTime - this.lastUpdateTime >= this.updateInterval)
		{
			this.makeDecision(ball, canvas);
			this.lastUpdateTime = currentTime;
		}
				
		this.executeDecision(canvas);
	}

	private makeDecision(ball: Ball, canvas: HTMLCanvasElement): void
	{
		if (ball.xVel > 0) 
		{
			const prediction = this.ballTrajectoryPredictor.predictBallPosition(ball, canvas, this.x, this.difficulty);
			this.predictedBallPosition = prediction;
			this.targetY = prediction.y;
		}
		else
		{
			this.targetY = this.calculatePositionalTarget(ball, canvas);
		}
				
		this.calculateMovementDuration(canvas);
	}

	private calculatePositionalTarget(ball: Ball, canvas: HTMLCanvasElement): number
	{
		const canvasCenter = canvas.height / 2;
		const ballY = ball.y;
		let targetY: number;
				
		if (Math.abs(ball.yVel) > 0.5)
		{
			targetY = ballY + (ball.yVel * 60);
		}
		else
		{
			const ballQuadrant = ballY < canvas.height / 2 ? -1 : 1;
			targetY = canvasCenter + (ballQuadrant * 20);
		}
				
		let randomOffset: number;
		switch (this.difficulty)
		{
			case Difficulty.EASY:
				randomOffset = (Math.random() - 0.5) * 200;
				break;
			case Difficulty.MEDIUM:
				randomOffset = (Math.random() - 0.5) * 150;
				break;
			case Difficulty.HARD:
				randomOffset = (Math.random() - 0.5) * 100;
				break;
			default:
				randomOffset = (Math.random() - 0.5) * 100;
		}
				
		targetY += randomOffset;
		return Math.max(WALL_OFFSET + 35, Math.min(canvas.height - WALL_OFFSET - 35, targetY));
	}

	private calculateMovementDuration(canvas: HTMLCanvasElement): void
	{
		const paddleCenter = this.y + this.height / 2;
		const distanceToTarget = Math.abs(this.targetY - paddleCenter);
		const tolerance = 5;
		
		if (distanceToTarget <= tolerance)
		{
			this.currentDecision = 'IDLE';
			this.movementDuration = 0;
		}
		else
		{
			let framesNeeded = Math.ceil(distanceToTarget / this.speed);
			
			if (Math.random() < this.overshootChance)
			{
				const overshootType = Math.random();
				
				if (overshootType < 0.5)
				{
					const overshootAmount = this.calculateOvershootAmount();
					framesNeeded += overshootAmount;
				}
				else
				{
					const undershootAmount = this.calculateUndershootAmount(framesNeeded);
					framesNeeded = Math.max(1, framesNeeded - undershootAmount);
				}
			}
			
			this.movementDuration = framesNeeded;
			if (this.targetY < paddleCenter)
			{
				this.currentDecision = 'UP';
			}
			else
			{
				this.currentDecision = 'DOWN';
			}
		}
	}

	private calculateOvershootAmount(): number
	{
		switch (this.difficulty)
		{
			case Difficulty.EASY:
				return Math.floor(Math.random() * 15) + 5;
			case Difficulty.MEDIUM:
				return Math.floor(Math.random() * 10) + 3;
			case Difficulty.HARD:
				return Math.floor(Math.random() * 6) + 2;
			default:
				return Math.floor(Math.random() * 10) + 3;
		}
	}

	private calculateUndershootAmount(totalFrames: number): number
	{
		// Calculate how many frames to stop short
		const maxUndershoot = Math.floor(totalFrames * 0.3); // Maximum 30% undershoot
		
		switch (this.difficulty)
		{
			case Difficulty.EASY:
				return Math.floor(Math.random() * Math.max(1, maxUndershoot)) + 1;
			case Difficulty.MEDIUM:
				return Math.floor(Math.random() * Math.max(1, Math.floor(maxUndershoot * 0.7))) + 1;
			case Difficulty.HARD:
				return Math.floor(Math.random() * Math.max(1, Math.floor(maxUndershoot * 0.4))) + 1;
			default:
				return Math.floor(Math.random() * Math.max(1, maxUndershoot)) + 1;
		}
	}

	private executeDecision(canvas: HTMLCanvasElement): void
	{
		this.keySimulator.simulateKeyInput(this.currentDecision);
		this.yVel = 0;
		
		// Check if we should continue moving
		if (this.movementDuration > 0)
		{
			// Don't stop early when overshooting/undershooting - let the duration run out
			this.movementDuration--;
		}

		if (this.movementDuration > 0)
		{
			if (this.keySimulator.isKeyPressed('UP'))
			{
				this.yVel = -1;
				if (this.y <= WALL_OFFSET)
				{
					this.yVel = 0;
					this.movementDuration = 0;
				}
			}
			else if (this.keySimulator.isKeyPressed('DOWN'))
			{
				this.yVel = 1;
				if (this.y + this.height >= canvas.height - WALL_OFFSET)
				{
					this.yVel = 0;
					this.movementDuration = 0;
				}
			}
		}
		this.y += this.yVel * this.speed;
	}

	draw(context: CanvasRenderingContext2D): void
	{
		context.save();
		context.shadowColor = "#F2BDCD";
		context.shadowBlur = 12;
		context.fillStyle = "white";
		context.fillRect(this.x, this.y, this.width, this.height);
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
	update(player:Paddle,computer:ComputerPaddle,canvas: HTMLCanvasElement): void
	{
		if(this.x <= 0)
		{
			Game.computerScore += 1;
			this.reset(canvas);
			return ;
		}
		if (this.x + this.width >= canvas.width)
		{
			Game.playerScore += 1;
			this.reset(canvas);
			return ;
		}
		if (this.y <= 10)
		{
			this.y = 10;
				this.yVel = Math.abs(this.yVel);
		}
		if (this.y + this.height >= canvas.height - 10)
		{
			this.y = canvas.height - 10 - this.height;
				this.yVel = -Math.abs(this.yVel);
		}
		if (this.x <= player.x + player.width &&
			this.x + this.width >= player.x &&
			this.y < player.y + player.height &&
			this.y + this.height > player.y)
		{
			this.xVel = 1;
			this.yVel += player.yVel * 0.5;
		}
		if (this.x + this.width >= computer.x &&
			this.x <= computer.x + computer.width &&
			this.y < computer.y + computer.height &&
			this.y + this.height > computer.y)
		{
			this.xVel = -1;
			this.yVel += computer.yVel * 0.5;
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

class AIKeySimulator
{
	private keysPressed: { [key: string]: boolean } = {};
		
	constructor()
	{
		this.keysPressed = { 'UP': false, 'DOWN': false };
	}
		
	simulateKeyInput(decision: 'UP' | 'DOWN' | 'IDLE'): void
	{
		this.keysPressed['UP'] = false;
		this.keysPressed['DOWN'] = false;
		
		if (decision !== 'IDLE')
			this.keysPressed[decision] = true;
	}
	isKeyPressed(key: string): boolean
	{
		return this.keysPressed[key] || false;
	}
}

class BallTrajectoryPredictor
{
	predictBallPosition(ball: Ball, canvas: HTMLCanvasElement, paddleX: number, difficulty: Difficulty = Difficulty.EASY): { x: number, y: number }
	{
		let simX = ball.x;
		let simY = ball.y;
		let simXVel = ball.xVel;
		let simYVel = ball.yVel;
		let simSpeed = ball.speed;
		let timeSteps = 0;
		const maxSteps = 6000;

		if (simXVel === 0)
		{
			return {x: simX, y: simY};
		}
				
		while (timeSteps < maxSteps) 
		{
			if (simY <= 10)
			{
				simY = 10;
				simYVel = Math.abs(simYVel);
			}
			if (simY >= canvas.height - 10)
			{
				simY = canvas.height - 10;
				simYVel = -Math.abs(simYVel);
			}
			simX += simXVel * simSpeed;
			simY += simYVel * simSpeed;
			simSpeed += 0.001;
			timeSteps++;

			if (simXVel > 0 && simX >= paddleX - 15)
				break;
		}
				
		// Add difficulty-based prediction error
		let imperfection: number;
		switch (difficulty)
		{
			case Difficulty.EASY:
				imperfection = (Math.random() - 0.5) * 120; // High error margin
				break;
			case Difficulty.MEDIUM:
				imperfection = (Math.random() - 0.5) * 80; // Medium error margin
				break;
			case Difficulty.HARD:
				imperfection = (Math.random() - 0.5) * 40; // Low error margin
				break;
			default:
				imperfection = (Math.random() - 0.5) * 40;
		}		
		simY += imperfection;
		imperfection += 0.01;
		return {
			x: simX,
			y: Math.max(WALL_OFFSET, Math.min(canvas.height - WALL_OFFSET, simY))
		};
	}
}