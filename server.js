const server = require('http').createServer();
const io = require('socket.io')(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
});

const PORT = 3000;

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

let readyPlayerCount = 0;

io.on('connection', (socket) => {
    console.log(`user connected as ${socket.id}`);

    socket.on('ready', (obj) => {
        readyPlayerCount++;
        console.log(`Player ${readyPlayerCount} ready`, socket.id);
        if ((readyPlayerCount % 2) && obj.replay) {
            socket.broadcast.emit('playerReady');
        };
        if (!(readyPlayerCount % 2)) {
            io.emit('startGame', socket.id);
        };
    });

    socket.on('paddleMove', (paddleData) => {
        socket.broadcast.emit('paddleMove', paddleData);
    });

    socket.on('ballMove', (ballData) => {
        socket.broadcast.emit('ballMove', ballData);
    });

    socket.on('gameOver', (winner) => {
        io.emit('gameOver', winner);
    } )

    socket.on('disconnect', (reason) => {
        console.log(`Client ${socket.id} disconnected due to ${reason}`);
    });
});