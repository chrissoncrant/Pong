// const { isContext } = require("vm");

//Canvas
const { body } = document;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const socket = io();
let isReferee = false;
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
const pauseBtn = document.getElementById('pause');

//Paddle
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDiff = 25;
let paddleX = [225, 225];
let playerMoved = false;
let paddleIndex = 0;

//Ball
let ballX = 250;
let ballY = 350;
const ballRadius = 5;

//Speed
let speedY = 2;
let speedX = 0;
let ballDirection = 1; 
let trajectoryX = [0, 0];
let maxSpeed = 6;

//Score
let score = [0, 0];
let winningScore = 2;
let isGameOver = false;
let isNewGame = true;

let pause = false;

//Change Mobile Settings
// if (isMobile.matches) {
//     speedY = -2;
//     speedX = speedY;
// } else {
//     speedY = -2;
//     speedX = speedY;
// }

// updateBtn.addEventListener('click', () => {
//     const winScore = document.getElementById('winning-score');
//     const speed = document.getElementById('max-speed');
//     if (Number(winScore.value) > 0) {
//         winningScore = Number(winScore.value);
//         score[0] = 0;
//         score[1] = 0;
//         ballReset();
//     };
//     if (Number(speed.value) > 0) {
//         maxSpeed = Number(speed.value);
//         ballReset();
//     };
// });

// defaultBtn.addEventListener('click', () => {
//     winningScore = 7;
//     maxSpeed = 6;
//     ballReset();
// });

// pauseBtn.addEventListener('click', () => {
//     if (pause) {
//         pause = false;
//         animate();
//     } else pause = true;
// });

//Wait for Opponents:
function renderIntro() {
    //Canvas Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    //Intro Text
    ctx.fillStyle = "white";
    ctx.font = "32px Courier New";
    ctx.fillText("Waiting for opponent...", 20, (canvas.height / 2) - 30);
}

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
    speedX = 0;
    if (ballDirection < 0) {
        ballDirection = -ballDirection;
    };

    socket.emit('ballMove', {
        ballX,
        ballY,
        score
     });
}

function ballMove() {
    //Vertical Speed:
    ballY += speedY * ballDirection;
    // console.log('ball X', ballX)
    
    //Horizontal Speed:
    if (playerMoved) {
        ballX += speedX;
        // console.log('ball X', ballX);
    }

    socket.emit('ballMove', {
       ballX,
       ballY,
       score
    });
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
            //Add speed on hit: 
            if (playerMoved) {
                speedY += 1;
                //Max speed:
                if (speedY > maxSpeed) {
                    speedY = maxSpeed;
                }
            }
            ballDirection = -ballDirection;
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
            trajectoryX[1] = ballX - (paddleX[1] + paddleDiff);
            speedX = trajectoryX[1] * 0.3;
        } else if (ballY < 0) {
            ballDirection = -ballDirection;
            //Reset Ball and add to Player score:
            ballReset();
            score[0]++;
        }
    }
}

//Called every frame
function animate() {
    if (isReferee) {
        ballMove();
        ballBoundaries();
    };
    renderCanvas();
    gameOver();
    if (!isGameOver) {
        if (pause) {
            cancelAnimationFrame(animate);
        } else window.requestAnimationFrame(animate);
    };
}

function addNameDisplay() {
    const nameContainer = document.getElementById('player-name');
    if (!nameContainer.children.length) {
        const playerName = document.createElement('h4');
        if (isReferee) {
            playerName.textContent = "Player 2 - Ref - Bottom";
        } else playerName.textContent = "Player 1 - Top";
        document.getElementById('player-name').appendChild(playerName);
    };
}

function showGameOverEl(winner) {
    const h1 = document.createElement('h1');
    const h2 = document.createElement('h2');
    h2.textContent = 'Are you ready to rock again?'
    const newGameBtn = document.createElement('button');

    newGameBtn.textContent = 'New Game';
    newGameBtn.addEventListener('click', startGame);

    if (winner === 'Player1') {
        h1.textContent = 'Player 1 Wins!';      
    } else {
        h1.textContent = 'Player 2 Wins!';
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
        let winner = score[0] === winningScore ? 'Player2' : 'Player1';
        socket.emit('gameOver', winner);
        // showGameOverEl(winner);
    } else isGameOver = false;
}

function removeChildNodes(el) {
    while(el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

function onLoad() {
    createCanvas();
    renderIntro();
    socket.emit('ready');
}

function startGame() {
    console.log(isGameOver, isNewGame)
    if (isGameOver && !isNewGame) {
        console.log('test', isReferee);
        gameOverEl.hidden = true;
        removeChildNodes(gameOverEl);
        canvas.hidden = false;
        paddleX[0] = 225;
        paddleX[1] = 225;
        isGameOver = false;
    };
    score[0] = 0;
    score[1] = 0;
    isNewGame = false;
    ballReset();
    animate();
    // window.requestAnimationFrame(animate);
    paddleIndex = isReferee ? 0 : 1;

    addNameDisplay();

    canvas.addEventListener('mousemove', e => {
        playerMoved = true;
        // console.log(e.clientX);
        // console.log(window.innerWidth);
        //We want to control the paddle from the middle of the paddle
        paddleX[paddleIndex] = e.clientX - canvasPosition - paddleDiff;
        //sets the left boundary
        if (e.clientX - canvasPosition < paddleDiff) {
            paddleX[paddleIndex] = 0;
        };
        //sets the right boundary
        if (paddleX[paddleIndex] > width - paddleWidth) {
            paddleX[paddleIndex] = width - paddleWidth;
        };

        socket.emit('paddleMove', {
            xPosition: paddleX[paddleIndex],
        })
    });
    canvas.style.cursor = 'none';
};

onLoad();

socket.on('connect', () => {
    console.log(`Connected as ${socket.id}`)
});

socket.on('startGame', (refereeId) => {
    console.log('Referee ID: ', refereeId);
    isReferee = socket.id === refereeId;
    startGame();
});

socket.on('paddleMove', (paddleData) => {
    const opponentPaddleIndex = 1 - paddleIndex;
    paddleX[opponentPaddleIndex] = paddleData.xPosition;
});

socket.on('ballMove', (ballData) => {
    ({ ballX, ballY, score } = ballData);
});

socket.on('gameOver', (winner) => {
    showGameOverEl(winner);
})