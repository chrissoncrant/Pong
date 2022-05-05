const http = require('http');

const apiServer = require('./api');
const httpServer = http.createServer(apiServer);
const socketServer = require('socket.io');

const socket = require('./sockets');

const io = socketServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
});

const PORT = 3000;

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

socket.listen(io);

