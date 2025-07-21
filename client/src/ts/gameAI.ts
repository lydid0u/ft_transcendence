enum KeyBindings
{
	UP = 38,
	DOWN = 40
}

const WALL_OFFSET = 20;

export class Game
{
	private gameCanvas: HTMLCanvasElement;
	private gameContext: CanvasRenderingContext2D;
	public static keysPressed: boolean[] = [];
	public static playerScore: number = 0;
	public static computerScore: number = 0;
	public running:boolean = false;
	public requestFrameID:number = 0;
	public keyDownHandler:any;
	public keyUpHandler:any;
	private player1: Paddle;
	private computerPlayer: ComputerPaddle;
	private ball: Ball;
	constructor()
	{
		this.gameCanvas = document.getElementById("game-canvas") as HTMLCanvasElement;
		this.gameContext = this.gameCanvas.getContext("2d")!;
		this.gameContext.font = "30px 'Orbitron', sans-serif";
		this.running = true;
		this.keyDownHandler = this.handleKeyDown.bind(this);
		this.keyUpHandler = this.handleKeyUp.bind(this);
		window.addEventListener("keyup", this.keyUpHandler);
		window.addEventListener("keydown", this.keyDownHandler);
		const paddleWidth:number = 20, paddleHeight:number = 70, ballSize:number = 10, wallOffset:number = 20;
		this.player1 = new Paddle(paddleWidth,paddleHeight,wallOffset,this.gameCanvas.height / 2 - paddleHeight / 2); 
		this.computerPlayer = new ComputerPaddle(paddleWidth,paddleHeight,this.gameCanvas.width - (wallOffset + paddleWidth) ,this.gameCanvas.height / 2 - paddleHeight / 2);
		this.ball = new Ball(ballSize,ballSize,this.gameCanvas.width / 2 - ballSize / 2, this.gameCanvas.height / 2 - ballSize / 2);    

	}
	handleKeyDown(e:any)
	{
		if (e.code == "ArrowUp")
			Game.keysPressed[KeyBindings.UP] = true;
		if (e.code == "ArrowDown")
			Game.keysPressed[KeyBindings.DOWN] = true;
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
		//draw court outline
		this.gameContext.strokeStyle = "#000";
		this.gameContext.lineWidth = 5;
		this.gameContext.strokeRect(8,8,this.gameCanvas.width - 15,this.gameCanvas.height - 15);

		//draw center lines
		for (var i = 0; i + 30 < this.gameCanvas.height; i += 31) {
			this.gameContext.fillStyle = "#aaa";
			this.gameContext.fillRect(this.gameCanvas.width / 2 - 10, i + 10, 15, 20);
		}
		//draw scores
		this.gameContext.fillText(String(Game.playerScore), 280, 50);
		this.gameContext.fillText(String(Game.computerScore), 390, 50);
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
		this.update();
		this.draw();
		requestAnimationFrame(() => this.gameLoop());
	}
}

class Entity
{
	width:number;
	height:number;
	x:number;
	y:number;
	xVel:number = 0;
	yVel:number = 0;
	constructor(w:number,h:number,x:number,y:number)
	{
		this.width = w;
		this.height = h;
		this.x = x;
		this.y = y;
	}
	draw(context: CanvasRenderingContext2D): void
	{
		context.fillStyle = "#f00";
		context.fillRect(this.x,this.y,this.width,this.height);
	}
}

class Paddle extends Entity
{
	private speed:number = 10;
	constructor(w:number,h:number,x:number,y:number)
	{
		super(w,h,x,y);
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
}

class ComputerPaddle extends Entity
{

	private speed:number = 10;
	constructor(w:number,h:number,x:number,y:number)
	{
		super(w,h,x,y);
	}
	update(ball:Ball, canvas: HTMLCanvasElement): void
	{
		//chase ball
		if (ball.y < this.y && ball.xVel == 1)
		{
			this.yVel = -1;
			if(this.y <= WALL_OFFSET)
			{
				this.yVel = 0;
			}
		}
		else if (ball.y > this.y + this.height && ball.xVel == 1)
		{
			this.yVel = 1;
	
			if(this.y + this.height >= canvas.height - WALL_OFFSET)
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
}

class Ball extends Entity
{
	private speed:number = 3;
	constructor(w:number,h:number,x:number,y:number)
	{
		super(w,h,x,y);
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
		this.speed = 3;
	}
	update(player:Paddle,computer:ComputerPaddle,canvas: HTMLCanvasElement): void
	{
		//check top canvas bounds
		if (this.y <= 10)
		{
			this.y = 10;
			this.yVel = Math.random() < 0.5 ? -1 : 1;
		}
		//check bottom canvas bounds
		if (this.y + this.height >= canvas.height - 10)
		{
			this.y = canvas.height - 10 - this.height;
			this.yVel = Math.random() < 0.5 ? -1 : 1;
		}
		//check left canvas bounds
		if(this.x <= 0)
		{
			Game.computerScore += 1;
			this.reset(canvas);
		}
		//check right canvas bounds
		if (this.x + this.width >= canvas.width)
		{
			Game.playerScore += 1;
			this.reset(canvas);
		}
		//check player collision
		// Player paddle collision
		if (this.x <= player.x + player.width &&
			this.x + this.width >= player.x &&
			this.y < player.y + player.height &&
			this.y + this.height > player.y) 
			{
				this.xVel = 1;
			}
		// Computer paddle collision
		if (this.x + this.width >= computer.x &&
			this.x <= computer.x + computer.width &&
			this.y < computer.y + computer.height &&
			this.y + this.height > computer.y)
			{
				this.xVel = -1;
			}
		this.x += this.xVel * this.speed;
		this.y += this.yVel * this.speed;
		this.speed += 0.005;
	}
}
