let readyPlayerCount = 0;

function listen(io) {
    io.on('connection', (socket) => {
        console.log(`user connected as ${socket.id}`);
    
        socket.on('ready', () => {
            console.log('Player ready', socket.id);
            readyPlayerCount++;
            if (readyPlayerCount % 2) {
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
            readyPlayerCount--;
        });
    });
} 

module.exports = {
    listen,
};