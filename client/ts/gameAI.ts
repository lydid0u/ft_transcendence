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
		
		// Mettre à jour le nom du joueur dès l'initialisation
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
		this.computerPlayer = new ComputerPaddle(paddleWidth,paddleHeight,this.gameCanvas.width - (wallOffset + paddleWidth) ,this.gameCanvas.height / 2 - paddleHeight / 2, paddleSpeed);
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
		// Draw glowing court outline
		const gradient = this.gameContext.createLinearGradient(0, 0, this.gameCanvas.width, this.gameCanvas.height);
		gradient.addColorStop(0, "#00f0ff");
		gradient.addColorStop(1, "#0a1a2f");
		this.gameContext.strokeStyle = gradient;
		this.gameContext.lineWidth = 6;
		this.gameContext.shadowColor = "#00f0ff";
		this.gameContext.shadowBlur = 16;
		this.gameContext.strokeRect(8,8,this.gameCanvas.width - 15,this.gameCanvas.height - 15);

		// Draw center dashed line with glow
		this.gameContext.shadowBlur = 8;
		this.gameContext.fillStyle = "#00f0ff";
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
		this.gameContext.fillStyle = "#083";
		this.gameContext.fillRect(0,0,this.gameCanvas.width,this.gameCanvas.height);
		this.drawBoardDetails();
		this.player1.draw(this.gameContext);
		this.computerPlayer.draw(this.gameContext);
		this.ball.draw(this.gameContext);
	}
	gameLoop()
	{
		const pScore = document.getElementById('player-score');
		const aiScore = document.getElementById('ai-score');
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
	
	async postFinalGameResults() {
		// Récupérer le pseudo du joueur depuis l'élément HTML
		let playerName = "Joueur";
		const playerNameElement = document.getElementById("player-name");
		if (playerNameElement && playerNameElement.textContent) {
			playerName = playerNameElement.textContent;
		}
		
		const gameResults = {
			player1_score: Game.playerScore,
			player2_score: Game.computerScore,
			winner: Game.playerScore > Game.computerScore ? "player1" : "player2",
			game_type: "Pong vs IA"
		};
		
		try {
			const token = localStorage.getItem('jwtToken');
			if (!token) {
				console.warn("Impossible d'enregistrer les résultats : token d'authentification non trouvé");
				return;
			}
			
			const response = await fetch('http://localhost:3000/add-match', {
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
		} catch (error) {
			console.error('Erreur lors de l\'enregistrement des résultats:', error);
		}
	}
	showEndScreen() {
		const container = document.querySelector('.page-content');
		if (!container) return;

		// Remove old end screen if present
		const oldEnd = document.getElementById('end-screen');
		if (oldEnd) oldEnd.remove();

		// Récupérer le pseudo du joueur depuis l'élément HTML
		let playerName = "Joueur";
		const playerNameElement = document.getElementById("player-name");
		if (playerNameElement && playerNameElement.textContent) {
			playerName = playerNameElement.textContent;
		}

		const winner = Game.playerScore > Game.computerScore ? playerName : "IA";
		const endDiv = document.createElement('div');
		endDiv.id = 'end-screen';
		endDiv.className = 'flex flex-col items-center mt-6';

		const msg = document.createElement('div');
		msg.className = 'text-3xl font-bold text-[#00f0ff] mb-4';
		msg.textContent = `${winner} gagne!`;

		const restartBtn = document.createElement('button');
		restartBtn.className = 'px-6 py-2 bg-[#00f0ff] text-[#050507] font-bold rounded-lg shadow hover:bg-[#85e7ff] transition mb-2';
		restartBtn.textContent = 'Restart';
		restartBtn.onclick = () => Game.startNewGame(this.difficulty);

		const homeBtn = document.createElement('button');
		homeBtn.className = 'px-6 py-2 bg-[#00f0ff] text-[#050507] font-bold rounded-lg shadow hover:bg-[#85e7ff] transition';
		homeBtn.textContent = 'Home';
		homeBtn.onclick = () => SPA.navigateTo('/home');

		endDiv.appendChild(msg);
		endDiv.appendChild(restartBtn);
		endDiv.appendChild(homeBtn);
		container.appendChild(endDiv);

		const canvas = document.getElementById('game-canvas');
		if (canvas) canvas.style.display = 'none';
	}	public static startNewGame(difficulty: Difficulty = Difficulty.EASY) {
		if (Game.currentInstance) {
			Game.currentInstance.destroy();
		}
		const canvas = document.getElementById('game-canvas');
		if (canvas) canvas.style.display = '';
		const oldEnd = document.getElementById('end-screen');
		if (oldEnd) oldEnd.remove();
		
		// Mettre à jour le nom du joueur
		console.log("Tentative de mise à jour du nom du joueur...");
		Game.updatePlayerName();
		
		const game = new Game(difficulty);
		Game.currentInstance = game;
		game.gameLoop();
	}
	
	// Fonction pour mettre à jour le nom du joueur
	private static updatePlayerName() {
		const playerNameElement = document.getElementById('player-name');
		if (playerNameElement) {
			// Récupérer le nom d'utilisateur du localStorage
			let username = localStorage.getItem('username');
			
			// Si pas trouvé dans localStorage, essayer avec d'autres clés potentielles
			if (!username) {
				username = localStorage.getItem('userUsername');
			}
			if (!username) {
				username = localStorage.getItem('user_username');
			}
			if (!username) {
				username = sessionStorage.getItem('username');
			}
			
			// Si un nom d'utilisateur a été trouvé, l'utiliser
			if (username) {
				console.log("Nom d'utilisateur trouvé :", username);
				playerNameElement.textContent = username;
			} else {
				// Sinon, essayer de récupérer le jeton JWT et extraire les informations
				const token = localStorage.getItem('jwtToken');
				if (token) {
					try {
						// Tenter de décoder le jeton JWT pour extraire les informations utilisateur
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
					// Fallback si aucune information n'est trouvée
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
		context.shadowColor = "#00f0ff";
		context.shadowBlur = 12;
		context.fillStyle = "#e6fdff";
		context.fillRect(this.x,this.y,this.width,this.height);
		context.restore();
	}
}

class ComputerPaddle extends Entity
{
	private reactionCount: number = 0;
	private reactionTime: number =  2;
	private parasiticMvmnt: number = 0;
	private idleDirection: number = 1;
	private idleTimer: number = 0;
	constructor(w:number,h:number,x:number,y:number, speed:number)
	{
		super(w,h,x,y, speed);
	}
	update(ball:Ball, canvas: HTMLCanvasElement): void
	{
		this.reactionCount++;
		if (this.reactionCount < this.reactionTime)
		{
			return ;
		}
		this.reactionCount = 0;
		//chase ball
		if (ball.xVel == 1 && ball.x > canvas.width / 2)
		{
			this.parasiticMvmnt = (Math.random() - 0.5) * 10;
			if (ball.y + this.parasiticMvmnt < this.y && ball.xVel == 1)
			{
				this.yVel = -1;
				if (this.y <= WALL_OFFSET)
				{
					this.yVel = 0;
				}
			}
			else if (ball.y + this.parasiticMvmnt > this.y + this.height && ball.xVel == 1)
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
		}
		else
		{
			this.idleTimer++;
			if (this.idleTimer > 6) { // Change direction every 30 frames
				const ballTarget = ball.y +  (Math.random() - 0.5) * 40;
				if (ballTarget < this.y)
					this.idleDirection = -1;
				else if (ballTarget > this.y + this.height)
					this.idleDirection = 1;
				else
					this.idleDirection = 0;
				this.idleTimer = 0;
			}
			this.yVel = this.idleDirection;
			if (this.y <= WALL_OFFSET - 10)
			{
				this.y = WALL_OFFSET - 10;
				this.yVel = 1;
			}
			if (this.y + this.height >= canvas.height - WALL_OFFSET + 10)
			{
				this.y = canvas.height - WALL_OFFSET + 10 - this.height;
				this.yVel = -1;
				return ;
			}
		}
		this.y += this.yVel * this.speed;
	}
	draw(context: CanvasRenderingContext2D): void
	{
		context.save();
		context.shadowColor = "#00f0ff";
		context.shadowBlur = 12;
		context.fillStyle = "#00f0ff";
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
	update(player:Paddle,computer:ComputerPaddle,canvas: HTMLCanvasElement): void
	{
		//check left canvas bounds
		if(this.x <= 0)
		{
			Game.computerScore += 1;
			this.reset(canvas);
			return ;
		}
		//check right canvas bounds
		if (this.x + this.width >= canvas.width)
		{
			Game.playerScore += 1;
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
		// Player paddle collision
		if (this.x <= player.x + player.width &&
			this.x + this.width >= player.x &&
			this.y < player.y + player.height &&
			this.y + this.height > player.y)
		{
			this.xVel = 1;
			this.yVel += player.yVel * 0.5;
		}
		// Computer paddle collision
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
