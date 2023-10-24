const http = require('http');
const socket = require('websocket').server
const server = http.createServer(() => {});

server.listen(3000, () => {
    console.log("Server started listening on port 3000");
})

const websocket = new socket({httpServer:server});

websocket.on('request', (req) => {
    const connection = req.accept();
    console.log(connection);
})

websocket.on('create or join', function(room) {
    console.log('Received request to create or join room' + room);
    
});
