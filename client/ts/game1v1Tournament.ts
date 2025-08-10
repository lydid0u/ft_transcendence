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

const WALL_OFFSET = 20;

import { SPA } from './spa';
import * as Tournament from './tournament-game';


const api = new Tournament.TournamentLaunchAPI();
const tournament = new Tournament.TournamentLaunch();

// Fonction pour valider l'authentification de l'utilisateur
function checkAuthentication(): boolean {
    const token = localStorage.getItem("jwtToken");
    
    if (!token) {
        showErrorMessage("Vous devez être connecté pour accéder à cette page");
        return false;
    }
    
    return true;
}

// Fonction pour valider l'accès au tournoi
async function validateTournamentAccess(): Promise<boolean> {
    // Vérifier d'abord l'authentification
    if (!checkAuthentication()) {
        return false;
    }
    
    try {
        // Vérifier si un tournoi actif existe
        const participants = await api.getTournamentDetails();
        
        if (!participants || participants.length < 2) {
            // Afficher un message d'erreur
            showErrorMessage("Vous n'avez pas accès à ce tournoi ou le tournoi n'a pas assez de participants");
            return false;
        }
        
        return true;
    } catch (error) {
        console.error("Erreur lors de la validation de l'accès au tournoi:", error);
        showErrorMessage("Erreur lors de la validation de l'accès au tournoi");
        return false;
    }
}

// Fonction pour afficher un message d'erreur
function showErrorMessage(message: string): void {
    // Supprimer les messages d'erreur existants
    const existingErrors = document.querySelectorAll('.error-notification');
    existingErrors.forEach(elem => elem.remove());
    
    const errorContainer = document.createElement("div");
    errorContainer.className = "error-notification fixed top-5 right-5 p-4 bg-red-600 text-white rounded-lg shadow-lg z-50 max-w-xs";
    
    // Contenu du message
    const messageContent = document.createElement("div");
    messageContent.className = "flex items-start";
    
    // Icône d'alerte
    const alertIcon = document.createElement("div");
    alertIcon.className = "mr-3 text-xl font-bold";
    alertIcon.innerHTML = "⚠️";
    
    // Texte du message
    const messageText = document.createElement("div");
    messageText.className = "flex-1 text-sm";
    
    // Titre du message
    const messageTitle = document.createElement("p");
    messageTitle.className = "font-bold mb-1";
    messageTitle.textContent = "Accès refusé";
    
    // Corps du message
    const messageBody = document.createElement("p");
    messageBody.textContent = message;
    
    // Bouton pour retourner à l'accueil
    const homeButton = document.createElement("button");
    homeButton.className = "mt-2 px-3 py-1 bg-white text-red-600 text-xs rounded font-bold";
    homeButton.textContent = "Retour à l'accueil";
    homeButton.onclick = () => { window.location.href = "/home"; };
    
    // Assembler les éléments
    messageText.appendChild(messageTitle);
    messageText.appendChild(messageBody);
    messageText.appendChild(homeButton);
    
    messageContent.appendChild(alertIcon);
    messageContent.appendChild(messageText);
    
    errorContainer.appendChild(messageContent);
    document.body.appendChild(errorContainer);
    
    // Ajouter une animation d'entrée
    errorContainer.style.opacity = "0";
    errorContainer.style.transform = "translateX(50px)";
    errorContainer.style.transition = "opacity 0.3s ease-in-out, transform 0.3s ease-in-out";
    
    // Déclencher l'animation après un court délai
    setTimeout(() => {
        errorContainer.style.opacity = "1";
        errorContainer.style.transform = "translateX(0)";
    }, 10);
}

export async function startTournamentFlow() {
    // Vérifier l'accès au tournoi avant de continuer
    const hasAccess = await validateTournamentAccess();
    if (!hasAccess) {
        return; // Arrêter l'exécution si l'accès est refusé
    }

    // logique pour lancer une game
    // Avoir la data des participants
    const participants = await api.getTournamentDetails();
    console.log("Participants du tournoi:", participants);
    // prendre les 2 premiers participants
    await tournament.fetchMatch();
    
    // lancer une game avec eux
    function tryInitGame1v1() {
        const canvas = document.getElementById('game-canvas');
        const p1Score = document.getElementById('player1-score');
        const p2Score = document.getElementById('player2-score');
        if (!canvas || !p1Score || !p2Score) {
            setTimeout(tryInitGame1v1, 50);
            return;
        }
        try
        {
            let difficulty = localStorage.getItem('Difficulty') || 'EASY';
            let diffEnum = 1;
            if (difficulty === 'MEDIUM')
                diffEnum = 2;
            else if (difficulty === 'HARD')
                diffEnum = 3;
            const game = new Game1v1(diffEnum);
            game.gameLoop();
        }
        catch (e)
        {
            console.error("Error initializing game:", e);
        }
    }
    tryInitGame1v1();
    
    // Ajouter l'écouteur d'événements pour le bouton "Prochain match"
    addNextGameButtonListener();
}

// Fonction pour ajouter l'écouteur d'événements au bouton "Prochain match"
function addNextGameButtonListener() {
    const nextGameButton = document.getElementById('next-game-button');
    if (nextGameButton) {
        console.log("Next game button found, adding click event listener");
        // Supprimer les gestionnaires existants pour éviter les doublons
        nextGameButton.removeEventListener('click', handleNextGame);
        // Ajouter le nouveau gestionnaire
        nextGameButton.addEventListener('click', handleNextGame);
    } else {
        console.log("Next game button not found, will retry...");
        // Réessayer dans un court délai
        setTimeout(addNextGameButtonListener, 500);
    }
}

// Fonction qui gère le clic sur "Prochain match"
async function handleNextGame(event) {
    // Empêcher le comportement par défaut
    if (event) event.preventDefault();
    
    console.log("Bouton Prochain match cliqué!");
    
    try {
        // Cacher le bouton
        const nextGameContainer = document.getElementById('next-game-container');
        if (nextGameContainer) {
            nextGameContainer.classList.add('hidden');
        }
        
        // Option 1: Utiliser SPA.navigateTo (recommandé)
        if (typeof window.SPA !== 'undefined' && window.SPA.navigateTo) {
            // Rediriger vers une autre page temporairement
            window.SPA.navigateTo('/tournoi');
            
            // Puis revenir à la page du jeu après un court délai
            setTimeout(() => {
                window.SPA.navigateTo('/game1v1Tournament');
                console.log("Redirection vers le prochain match...");
            }, 100);
        } 
        // Option 2: Rechargement simple de la page
        else {
            window.location.reload();
        }
    } catch (error) {
        console.error("Erreur lors du passage au match suivant:", error);
    }
}

// Fonction pour afficher le bouton "Fin du tournoi"
function showTournamentEndButton() {
    // Cacher le bouton "Prochain match" s'il est visible
    const nextGameContainer = document.getElementById('next-game-container');
    if (nextGameContainer) {
        nextGameContainer.classList.add('hidden');
    }
    
    // Trouver ou créer le conteneur pour le bouton "Fin du tournoi"
    let endButtonContainer = document.getElementById('tournament-end-container');
    
    if (!endButtonContainer) {
        // Créer le conteneur s'il n'existe pas
        endButtonContainer = document.createElement('div');
        endButtonContainer.id = 'tournament-end-container';
        endButtonContainer.className = 'mt-6 flex justify-center';
        
        // Créer le bouton
        const endButton = document.createElement('button');
        endButton.id = 'tournament-end-button';
        endButton.className = 'px-6 py-3 bg-pink-400 text-white font-bold rounded-lg hover:bg-pink-300 transition-colors shadow-lg';
        endButton.style.textShadow = 'none';
        endButton.textContent = 'Fin du tournoi';
        
        // Ajouter un gestionnaire d'événements au bouton
        endButton.addEventListener('click', handleTournamentEnd);
        
        // Ajouter le bouton au conteneur
        endButtonContainer.appendChild(endButton);
        
        // Ajouter le conteneur à la page
        const gameContent = document.querySelector('.page-content');
        if (gameContent) {
            gameContent.appendChild(endButtonContainer);
        } else {
            // Si .page-content n'existe pas, ajouter au body
            document.body.appendChild(endButtonContainer);
        }
    } else {
        // Si le conteneur existe déjà, le rendre visible
        endButtonContainer.classList.remove('hidden');
    }
    
    // Afficher un message de félicitations
    setTimeout(() => {
        alert("Félicitations! Le tournoi est terminé!");
    }, 500);
}

// Fonction qui gère le clic sur "Fin du tournoi"
function handleTournamentEnd(event) {
    if (event) event.preventDefault();
    
    console.log("Bouton Fin du tournoi cliqué!");
    
    // Rediriger vers la page d'accueil du tournoi
    if (typeof window.SPA !== 'undefined' && window.SPA.navigateTo) {
        window.SPA.navigateTo('/tournoi');
    } else {
        window.location.href = '/tournoi';
    }
}

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
            ballSpeed = 2;
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
            Game1v1.keys2Pressed[KeyBindings.UP] = true;
        if (e.code == "ArrowDown")
            Game1v1.keys2Pressed[KeyBindings.DOWN] = true;
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
        //draw court outline
        this.gameContext.strokeStyle = "#000";
        this.gameContext.lineWidth = 5;
        this.gameContext.strokeRect(8,8,this.gameCanvas.width - 15,this.gameCanvas.height - 15);

        //draw center lines
        for (var i = 0; i + 30 < this.gameCanvas.height; i += 31) {
            this.gameContext.fillStyle = "#aaa";
            this.gameContext.fillRect(this.gameCanvas.width / 2 - 10, i + 10, 15, 20);
        }
    }
    update()
    {
        this.player1.update(this.gameCanvas);
        this.player2.update(this.gameCanvas);
        this.ball.update(this.player1,this.player2,this.gameCanvas);
    }
    draw()
    {
        // Remplacer par un fond transparent ou semi-transparent
        this.gameContext.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        // Ou utiliser une couleur semi-transparente:
        // this.gameContext.fillStyle = "rgba(0, 0, 0, 0.1)";
        // this.gameContext.fillRect(0,0,this.gameCanvas.width,this.gameCanvas.height);
        
        this.drawBoardDetails();
        this.player1.draw(this.gameContext);
        this.player2.draw(this.gameContext);
        this.ball.draw(this.gameContext);
    }
    gameLoop()
    {
        const p1Score = document.getElementById('player1-score');
        const p2Score = document.getElementById('player2-score');
        if (Game1v1.player1Score >= 2 || Game1v1.player2Score >= 2)
        {
            this.running = false;
            
            // Afficher le bouton "Prochain match"
            
            // Déterminer le gagnant
            const winner = Game1v1.player1Score > Game1v1.player2Score ? 1 : 2;
            console.log(`Le joueur ${winner} a gagné la partie!`);
            
            // Récupérer les éléments pour afficher le vainqueur
            const player1Name = document.getElementById('player1-name')?.textContent || 'Joueur 1';
            const player2Name = document.getElementById('player2-name')?.textContent || 'Joueur 2';
            
            // Afficher un message de victoire
            const winnerName = winner === 1 ? player1Name : player2Name;
            console.log(`${winnerName} remporte la victoire!`);
            
            // Arrêter les animations et les contrôles
            window.removeEventListener("keydown", this.keyDownHandler);
            window.removeEventListener("keyup", this.keyUpHandler);  
            handleMatchEnd(winner, player1Name, player2Name);
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
}

async function handleMatchEnd(winnerNumber: number, player1Name: string, player2Name: string) { // Fonction globale, pas une méthode de classe
    try {
        const match = await api.getTournamentMatch();
        console.log("Match récupéré pour la finalisation:", match);
        
        if (match) {
            // Créer l'objet de résultat du match
            const matchResult = {
                tournament_id: match.tournamentId || 0,
                player1_name: player1Name,
                player2_name: player2Name,
                player1_score: Game1v1.player1Score,
                player2_score: Game1v1.player2Score,
                winner_id: winnerNumber === 1 ? match.player1_id : match.player2_id,
                status: "completed",
                game_type: "Tournament",
                round : match.round,
                created_at: match.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            console.log ("Résultat du match à envoyer:", matchResult);            
            await api.sendMatchResults(matchResult);
            const winner = await api.findWinnerOfTournament(matchResult);
            if (winner) {
                console.log("Vainqueur du tournoi trouvé:", winner);
                // Au lieu de rediriger directement, afficher le bouton "Fin du tournoi"
                // delete tournament

                const deleted = await api.deleteTournament(matchResult.tournament_id);
                showTournamentEndButton();
                return; // Ne pas afficher le bouton "Prochain match" si le tournoi est terminé
            }
            await tournament.deleteLosers(matchResult);
        }
        
        // Afficher le bouton "Prochain match" seulement si le tournoi n'est pas terminé
        const nextGameContainer = document.getElementById('next-game-container');
        if (nextGameContainer) {
            nextGameContainer.classList.remove('hidden');
            addNextGameButtonListener();
        }
    } catch (error) {
        console.error("Erreur lors de la finalisation du match:", error);
    }
} // Accolade fermante ajoutée ici

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
}

// Rendre disponible globalement
window.startTournamentFlow = startTournamentFlow;

// Déclarer des fonctions supplémentaires sur l'objet Window si nécessaire
declare global {
    interface Window {
        startTournamentFlow: typeof startTournamentFlow;
        SPA: any;
    }
}

// Initialiser la page de tournoi
function initTournamentGame() {
    // Vérifier l'authentification avant tout
    if (!checkAuthentication()) {
        return;
    }
    
    // Valider l'accès au tournoi immédiatement
    validateTournamentAccess().then(hasAccess => {
        if (hasAccess) {
            // Seulement si l'accès est validé, commencer le flux du tournoi
            startTournamentFlow();
        }
    });
}

// Ajouter l'écouteur d'événements au chargement du document
document.addEventListener('DOMContentLoaded', () => {
    // Protection immédiate - vérifie l'authentification dès le chargement de la page
    if (!checkAuthentication()) {
        return; // Arrête l'exécution si l'utilisateur n'est pas authentifié
    }
    
    addNextGameButtonListener();
    // Initialiser la page tournoi
    initTournamentGame();
});