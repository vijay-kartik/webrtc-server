const http = require("http");
const Socket = require("websocket").server;
const server = http.createServer(() => {});
const port = process.env.PORT
server.listen(port, () => {
    console.log("Server started listening on port ", port);
});

const websocket = new Socket({httpServer:server});

websocket.on('request', (req) => {
    const connection = req.accept();
    console.log(connection);
});

// websocket.on('create or join', function(room) {
//     console.log('Received request to create or join room' + room);
    
// });
