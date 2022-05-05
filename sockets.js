let readyPlayerCount = 0;

function listen(io) {  
    const pongNamespace = io.of('/pong');
    
    pongNamespace.on('connection', (socket) => {
        console.log(`user connected as ${socket.id}`);

        let room;
    
        socket.on('ready', (obj) => {
            room = `room ${Math.floor(readyPlayerCount / 2)}`;
            socket.join(room);

            readyPlayerCount++;
            console.log(`Player ${readyPlayerCount} ready in ${room}`, socket.id);
            if ((readyPlayerCount % 2) && obj.replay) {
                console.log('check')
                //Need to send this message to previous room, or figure out a better place to put this event to emit. The problem is that when New Game button is clicked it adds the player to a new room before it emits this event and so the other player doesn't get the message.
                socket.to(room).emit('playerReady');
            };
            if (!(readyPlayerCount % 2)) {
                pongNamespace.in(room).emit('startGame', socket.id);
            };
        });
    
        socket.on('paddleMove', (paddleData) => {
            socket.to(room).emit('paddleMove', paddleData);
        });
    
        socket.on('ballMove', (ballData) => {
            socket.to(room).emit('ballMove', ballData);
        });

        socket.on('gameOver', (winner) => {
            pongNamespace.in(room).emit('gameOver', winner);
        } )
    
        socket.on('disconnect', (reason) => {
            console.log(`Client ${socket.id} disconnected due to ${reason}`);
            socket.leave(room);
        });
    });
}

module.exports = {
    listen,
};

