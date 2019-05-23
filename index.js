const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let connectionsCount = 0;

app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));
app.use(express.static('public'))

io.on('connection', (socket) => {
    console.log("a user connected - number of connections: ", ++connectionsCount);

    socket.on('disconnect', () => console.log("a user disconnected"));
    socket.on('chat message', (message) => socket.broadcast.emit('chat message', message));
  }
);

http.listen(3000, () => console.log("listening on port: 3000..."));
