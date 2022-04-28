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
let paddleX = [225, 225];
let playerMoved = false;
let paddleContact = false;
let paddleIndex = 0;

//Ball
let ballX = 250;
let ballY = 350;
const ballRadius = 5;

//Speed
let speedY;
let speedX;
let ballDirection = 1; 
let trajectoryX = [0, 0];
let computerSpeed;
let maxSpeed = 6;

//Score
let score = [0, 0];
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
    speedY = -2;
    speedX = speedY;
    computerSpeed = 6;
}

updateBtn.addEventListener('click', () => {
    const winScore = document.getElementById('winning-score');
    const speed = document.getElementById('max-speed');
    if (Number(winScore.value) > 0) {
        winningScore = Number(score.value);
        score[0] = 0;
        score[1] = 0;
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
    ctx.fillRect(paddleX[0], height - 20, paddleWidth, paddleHeight);

    //Computer Paddle:
    ctx.fillRect(paddleX[1], 10, paddleWidth, paddleHeight);

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
    ctx.fillText(score[0], 20, canvas.height / 2 + 50);
    ctx.fillText(score[1], 20, canvas.height / 2 - 32);
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
    speedY = 3;
    console.log(score);
    if (ballDirection < 0) {
        ballDirection = -ballDirection;
    }
    paddleContact = false;
}

function ballMove() {
    //Vertical Speed:
    ballY += speedY * ballDirection;
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
        if (ballX >= paddleX[0] && ballX <= paddleX[0] + paddleWidth) {
            paddleContact = true;
            //Add speed on hit: 
            if (playerMoved) {
                speedY += 1;
                //Max speed:
                if (speedY > maxSpeed) {
                    speedY = maxSpeed;
                }
            }
            ballDirection = -ballDirection;
            console.log(speedY);
            trajectoryX[0] = ballX - (paddleX[0] + paddleDiff);
            speedX = trajectoryX[0] * 0.3;
        } else if (ballY > height) {
            //Reset Ball, add point to computer:
            ballReset();
            score[1]++;
        }
    }
    
    //Bounce off computer's paddle:
    if (ballY < paddleDiff) {
        if (ballX > paddleX[1] && ballX < paddleX[1] + paddleWidth) {
            //add speed on hit:
            if (playerMoved) {
                speedY += 1;
                //Max speed:
                if (speedY > maxSpeed) {
                    speedY = maxSpeed;
                }
            };
            ballDirection = -ballDirection;
            console.log(speedX);
            trajectoryX[1] = ballX - (paddleX[1] + paddleDiff);
            speedX = trajectoryX[1] * 0.3;
            console.log(speedX);
        } else if (ballY < 0) {
            ballDirection = -ballDirection;
            //Reset Ball and add to Player score:
            ballReset();
            score[0]++;
        }
    }
}

function computerAI() {
    if (playerMoved) {
        if (paddleX[1] + paddleDiff < ballX) {
            paddleX[1] += computerSpeed;
        } else if (paddleX[1] + paddleDiff > ballX) {
            paddleX[1] -= computerSpeed;
        }
        if (paddleX[1] < 0) {
            paddleX[1] = 0;
        } else if (paddleX[1] > width - paddleWidth){
            paddleX[1] = width - paddleWidth;
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
    if (score[0] === winningScore || score[1] === winningScore) {
        delay(300);
        isGameOver = true;
        let winner = score[0] === winningScore ? 'Player' : 'Computer';
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
        console.log('check')
        gameOverEl.hidden = true;
        removeChildNodes(gameOverEl);
        canvas.hidden = false;
        paddleX[0] = 225;
        paddleX[1] = 225;
        isGameOver = false;
    }
    score[0] = 0;
    score[1] = 0;
    isNewGame = false;
    ballReset();
    createCanvas();
    animate();
    // window.requestAnimationFrame(animate);
    paddleIndex = 0;
    canvas.addEventListener('mousemove', e => {
        playerMoved = true;
        // console.log(e.clientX);
        // console.log(window.innerWidth);
        //We want to control the paddle from the middle of the paddle
        paddleX[paddleIndex] = e.clientX - canvasPosition - paddleDiff;
        //sets the left boundary
        if (e.clientX - canvasPosition < paddleDiff) {
            paddleX[paddleIndex] = 0;
        }
        //sets the right boundary
        if (paddleX[paddleIndex] > width - paddleWidth) {
            paddleX[paddleIndex] = width - paddleWidth;
        }
    });
    canvas.style.cursor = 'none';
}

startGame();
