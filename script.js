//Canvas
const { body } = document;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const white = "#ecebeb";
const width = 500;
const height = 700;
const screenWidth = window.innerWidth;
//canvasPosition is the x = 0 point of the canvas relative to the screen width
const canvasPosition = screenWidth / 2 - width / 2;
const isMobile = window.matchMedia('(max-width: 600px)');
const gameOverEl = document.createElement('div');
gameOverEl.setAttribute('id', 'game-over');
const updateBtn = document.getElementById('update');
const defaultBtn = document.getElementById('default');
const rookieBtn = document.getElementById('rookie');
const amateurBtn = document.getElementById('amateur');
const proBtn = document.getElementById('pro');
const pauseBtn = document.getElementById('pause');

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
let ballY = 350;
const ballRadius = 5;

//Speed
let speedY;
let speedX;
let trajectoryX;
let computerSpeed;
let maxSpeed = 6;

//Score
let playerScore = 0;
let computerScore = 0;
let winningScore = 7;
let isGameOver = false;
let isNewGame = true;

let pause = false;

//Change Mobile Settings
if (isMobile.matches) {
    speedY = -2;
    speedX = speedY;
    computerSpeed = 4;
} else {
    speedY = -1;
    speedX = speedY;
    computerSpeed = 6;
}

updateBtn.addEventListener('click', () => {
    const score = document.getElementById('winning-score');
    const speed = document.getElementById('max-speed');
    if (Number(score.value) > 0) {
        winningScore = Number(score.value);
        playerScore = 0;
        computerScore = 0;
        ballReset();
    };
    if (Number(speed.value) > 0) {
        maxSpeed = Number(speed.value);
        ballReset();
    };
});

defaultBtn.addEventListener('click', () => {
    winningScore = 7;
    maxSpeed = 6;
    computerSpeed = 6;
    ballReset();
});

rookieBtn.addEventListener('click', () => {
    computerSpeed = 5;
    ballReset();
});

amateurBtn.addEventListener('click', () => {
    computerSpeed = 6;
    ballReset();
});

proBtn.addEventListener('click', () => {
    computerSpeed = 7;
    ballReset();
});

pauseBtn.addEventListener('click', () => {
    if (pause) {
        pause = false;
        animate();
    } else pause = true;
})

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
    ballY = height / 2;
    speedY = -3;
    paddleContact = false;
}

function ballMove() {
    //Vertical Speed:
    ballY += -speedY;
    // console.log('ball X', ballX)
    
    //Horizontal Speed:
    if (playerMoved && paddleContact) {
        ballX += speedX;
        // console.log('ball X', ballX);
    }
}

function ballBoundaries() {
    //Bounce off left wall:
    if (ballX < 0 && speedX < 0) {
        speedX = -speedX;
    }

    //Bounce off right wall:
    if (ballX > width && speedX > 0) {
        speedX = -speedX
    }

    //Bounce off player paddle:
    if (ballY > height - paddleDiff) {
        if (ballX >= paddleBottomX && ballX <= paddleBottomX + paddleWidth) {
            paddleContact = true;
            //Add speed on hit: 
            if (playerMoved) {
                speedY -= 1;
                //Max speed:
                if (speedY < -maxSpeed) {
                    speedY = -maxSpeed;
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
            console.log(computerSpeed);
        }
    }
    
    //Bounce off computer's paddle:
    if (ballY < paddleDiff) {
        if (ballX > paddleTopX && ballX < paddleTopX + paddleWidth) {
            //add speed on hit:
            if (playerMoved) {
                speedY += 1;
                //Max speed:
                if (speedY > maxSpeed) {
                    speedY = maxSpeed;
                }
            };
            speedY = -speedY;
        } else if (ballY < 0) {
            //Reset Ball and add to Player score:
            ballReset();
            playerScore++;
        }
    }
}

function computerAI() {
    if (playerMoved) {
        if (paddleTopX + paddleDiff < ballX) {
            paddleTopX += computerSpeed;
        } else if (paddleTopX + paddleDiff > ballX) {
            paddleTopX -= computerSpeed;
        }
    }
}

//Called every frame
function animate() {
    renderCanvas();
    ballMove();
    ballBoundaries();
    computerAI();
    gameOver();
    if (!isGameOver) {
        if (pause) {
            cancelAnimationFrame(animate);
        } else window.requestAnimationFrame(animate);
    }
    
}

function showGameOverEl(winner) {
    const h1 = document.createElement('h1');
    const h2 = document.createElement('h2');
    const newGameBtn = document.createElement('button');

    newGameBtn.textContent = 'New Game';
    newGameBtn.addEventListener('click', startGame);

    if (winner === 'Player') {
        h1.textContent = 'You Win!';
        h2.textContent = 'Are you ready to rock again?'
    } else {
        h1.textContent = 'You Lose!';
        h2.textContent = 'Game over man... Game over!'
    };

    gameOverEl.append(h1, h2, newGameBtn);
    document.body.appendChild(gameOverEl);
    gameOverEl.hidden = false;
    canvas.hidden = true;
}

function delay(duration) {
    const startTime = Date.now();
    while(Date.now() - startTime < duration) {};
}

function gameOver() {
    if (playerScore === winningScore || computerScore === winningScore) {
        delay(300);
        isGameOver = true;
        let winner = playerScore === winningScore ? 'Player' : 'Computer';
        showGameOverEl(winner);
    } else isGameOver = false;
}

function removeChildNodes(el) {
    while(el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

function startGame() {
    if (isGameOver && !isNewGame) {
        gameOverEl.hidden = true;
        removeChildNodes(gameOverEl);
        canvas.hidden = false;
        paddleBottomX = 225;
        isGameOver = false;
    }
    playerScore = 0;
    computerScore = 0;
    isNewGame = false;
    ballReset();
    createCanvas();
    animate();
    canvas.addEventListener('mousemove', e => {
        playerMoved = true;
        // console.log(e.clientX);
        // console.log(window.innerWidth);
        //We want to control the paddle from the middle of the paddle
        paddleBottomX = e.clientX - canvasPosition - paddleDiff;
        //sets the left boundary
        if (e.clientX - canvasPosition < paddleDiff) {
            paddleBottomX = 0;
        }
        //sets the right boundary
        if (paddleBottomX > width - paddleWidth) {
            paddleBottomX = width - paddleWidth;
        }
    });
    canvas.style.cursor = 'none';
}

startGame();
