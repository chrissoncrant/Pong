//Canvas
const { body } = document;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const white = "#ecebeb";
const width = 500;
const height = 700;
const screenWidth = window.screen.width;
//canvasPosition is the x = 0 point of the canvas relative to the screen width
const canvasPosition = screenWidth / 2 - width / 2;
const isMobile = window.matchMedia('(max-width: 600px)');
const gameOverEl = document.createElement('div');

console.log(window.outerWidth)

//Paddle
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDiff = 25;
let paddleBottomX = 225;
let paddleTopX = 225;
let playerMoved = false;
let paddleContact = false;

//Ball
let ballX = 250;
let ballY = 250;
const ballRadius = 5;

//Speed
let speedY;
let speedX;
let trajectoryX;
let computerSpeed;

//Change Monile Settings
if (isMobile.matches) {
    speedY = -2;
    speedX = speedY;
    computerSpeed = 4;
} else {
    speedY = -1;
    speedX = speedY;
    computerSpeed = 3;
}

//Score
let playerScore = 0;
let computerScore = 0;
const winningScore = 7;
// let isGameOver = true;
// let isNewGame = true;

//Render Everything on Canvas:
function renderCanvas() {
    //Canvas Background:
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    //Paddle Color:
    ctx.fillStyle = white;

    //Player Paddle:
    ctx.fillRect(paddleBottomX, height - 20, paddleWidth, paddleHeight);
    //Computer Paddle:
    ctx.fillRect(paddleTopX, 10, paddleWidth, paddleHeight);

    //Dashed Center Line:
    ctx.beginPath();
    ctx.setLineDash([4]);
    ctx.moveTo(0, 350);
    ctx.lineTo(500, 350);
    ctx.strokeStyle = 'grey';
    ctx.stroke();

    //Ball:
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
    ctx.fillStyle = white;
    ctx.fill();

    //Score: 
    ctx.font = '32px Courier New';
    ctx.fillText(playerScore, 20, canvas.height / 2 + 50);
    ctx.fillText(computerScore, 20, canvas.height / 2 - 32);
}

// Creating Canvas Element:
function createCanvas() {
    canvas.width = width;
    canvas.height = height;
    body.appendChild(canvas);
    renderCanvas();
}

function ballReset() {
    ballX = width / 2;
    ballY = height / 2 - 100;
    speedY = -3;
    paddleContact = false;
}

function ballMove() {
    //Vertical Speed:
    ballY += -speedY;
    //Horizontal Speed:
    ballX += speedX;
}

function ballBoundaries() {
    //Bounce off left wall:
    if (ballX < 0 && speedX < 0) {
        speedX = -speedX;
    }

    //Bounce off right wall:
    if (ballX > width && speedX < 0) {
        speedX = -speedX
    }

    //Bounce off player paddle:
    if (ballY > height - paddleDiff) {
        if (ballX > paddleBottomX && ballX < paddleBottomX + paddleWidth) {
            paddleContact = true;
            //Add speed on hit: 
            if (playerMoved) {
                speedY -= 1;
                //Max speed:
                if (speedY < -5) {
                    speedY = -5;
                    computerSpeed = 6;
                }
            }
            speedY = -speedY;
            trajectoryX = ballX - (paddleBottomX + paddleDiff);
            speedX = trajectoryX * 0.3;
        } else if (ballY > height) {
            //Reset Ball, add point to computer:
            ballReset();
            computerScore++;
        }
    }
    
    //Bounce off computer's paddle:
    if (ballY < paddleDiff) {
        if (ballX > paddleTopX && ballX > paddleTopX + paddleWidth) {
            //add speed on hit:
            if (playerMoved) {
                speedY += 1;
                //Max speed:
                if (speedY > 5) {
                    speedY = 5;
                }
            }
            speedY = -speedY;
        } else if (ballX < 0) {
            //Reset Ball and add to Player score:
            ballReset();
            playerScore++
        }
    }
}

function computerAI() {
    if (playerMoved) {
        if (paddleTopX + paddleDiff < ballX) {
            paddleTopX += computerSpeed;
        } else {
            paddleTopX -= computerSpeed;
        }
    }
}

//Called every frame
function animate() {
    renderCanvas();
    ballMove();
    ballBoundaries();
    //computerAI();
}

function startGame() {
    playerScore = 0;
    computerScore = 0;
    ballReset();
    createCanvas();
    animate();
    canvas.addEventListener('mousemove', e => {
        playerMoved = true;
        //We want to control the paddle from the middle of the paddle
        paddleBottomX = e.clientX - canvasPosition - paddleDiff;
        //sets the left boundary
        if (paddleBottomX < paddleDiff) {
            paddleBottomX = 0;
        }
        //sets the right boundary
        if (paddleBottomX > width - paddleDiff) {
            paddleBottomX = width - paddleDiff;
        }
    });
    canvas.style.cursor = 'none';
}

startGame();
