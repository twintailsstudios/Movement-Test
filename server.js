const express = require('express');
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http)
const path = require('path')

const port = 3001;
app.use(express.static(__dirname + '/public'));


app.use('/', express.static(path.join(__dirname, 'client')))

const tilemap = require('./client/assets/tilemaps/level2.json');
console.log(tilemap);

//players object
var players = {};

io.on('connection', function (socket) {
  console.log('a user connected');
  //create a new player and add it to our players object
  players[socket.id] = {
    x: 4820,
    y: 5020,
    playerId: socket.id
  };
  console.log('players[socket.id] = ', players[socket.id]);
  //send the players object to the new players
  socket.emit('currentPlayers', players);
  //update all the other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);


  socket.on('disconnect', function () {
    console.log('user disconnected');
    //remove this player from our players object
    delete players[socket.id];
    //emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });

  socket.on('movementLeft', function (playerId) {
    //console.log(playerId);
    if (playerId === players[socket.id].playerId) {
      players[socket.id].x = players[socket.id].x - 2.5;
      io.sockets.emit('playerMoved', players[socket.id]);
      console.log(players[socket.id]);
    }
  })
  socket.on('movementRight', function (playerId) {
    //console.log(playerId);
    if (playerId === players[socket.id].playerId) {
      players[socket.id].x = players[socket.id].x + 2.5;
      io.sockets.emit('playerMoved', players[socket.id]);
      console.log(players[socket.id]);
    }
  })
  socket.on('movementUp', function (playerId) {
    //console.log(playerId);
    if (playerId === players[socket.id].playerId) {
      players[socket.id].y = players[socket.id].y - 2.5;
      io.sockets.emit('playerMoved', players[socket.id]);
      console.log(players[socket.id]);
    }
  })
  socket.on('movementDown', function (playerId) {
    //console.log(playerId);
    if (playerId === players[socket.id].playerId) {
      players[socket.id].y = players[socket.id].y + 2.5;
      io.sockets.emit('playerMoved', players[socket.id]);
      console.log(players[socket.id]);
    }
  })
});

http.listen(port, () => console.log('Listening on port:', port));
