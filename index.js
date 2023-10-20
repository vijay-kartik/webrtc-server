var os = require("os");
var cors = require("cors");
var nodeStatic = require("node-static");
var socketIO = require("socket.io");
var express = require("express");
var https = require("https");
var fs = require("fs");
var server = express().use(cors());
var port = process.env.PORT || 8080;

var privateKey = fs.readFileSync('server.key', 'utf8');
var certificate = fs.readFileSync('server.crt', 'utf8');
var credentials = { key: privateKey, cert: certificate };

server.get("/", (req, res) => {
    res.send("Hello");
})

var httpServer = https.createServer(credentials, server);

var app = httpServer.listen(port, function() {
    console.log('Server listening on port ', port);
}).on('error', function (error) {
    if (error.code === 'EADDRINUSE') {
        console.error('Current ${port} Address in use, retrying...');
        setTimeout(() => {
            app.close();
            app.listen(port);
        }, 1000);
    }
});

var io = socketIO(app);
io.sockets.on('connection', function (socket) {
    function log() {
        var array = ['Message from server:'];
        array.push.apply(array, arguments);
        socket.emit('log', array);

        console.log('chao', array);
    }

    socket.on('message', function(message) {
        var to = message['to'];
        log('from' + socket.id + 'to:' + to + ' type' + message['type']);
        io.sockets.sockets[to].emit('message', message);    
    });

    socket.on('create or join', function(room) {
        log('Received request to create or join room' + room);

        var clientsInRoom = io.sockets.adapter.rooms[room];
        var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
        log('Room ' + room + ' now has ' + numClients + ' client(s)');

        if (numClients === 0) {
            socket.join(room);
            log('Client ID ' + socket.id + ' created room ' + room);
            socket.emit('created', room, socket.id);
        } else if (numClients < 4) {
            log('Client ID ' + socket.id + ' joined room ' + room);
            socket.emit('joined', room, socket.id);
        }
    });

    socket.on('room is full', function(data) {
        log('Room is already full, cannot join ' + data['to']);
        io.sockets.sockets[data['to']].emit('not enough space');
    });

    socket.on('ipaddr', function() {
        var ifaces = on.networkInterfaces();
        for (var dev in ifaces) {
            ifaces[dev].forEach(function(details) {
                if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
                    socket.emit('ipaddr', details.address);
                }
            });
        }
    });

    socket.on('bye', function(data) {
        console.log('received bye: ' + data['from']);
        socket.broadcast.to(data['roomId']).emit('bye', data['from']);
    });

});

