const express = require('express');
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http)
const path = require('path')

const port = 3001;
app.use(express.static(__dirname + '/public'));


app.use('/', express.static(path.join(__dirname, 'client')))

const tilemap = require('./client/assets/tilemaps/level2.json');
//console.log(tilemap.layers);
let blockingLayer = {};
for (let i = 0; i < tilemap.layers.length; i++) {
  let layer = tilemap.layers[i];
  if (layer.name === 'blocked') {
    blockingLayer = layer;
    //blockingLayer.data.push(" ,0");
    break;
  }
}




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
      var temporary = {
        x: players[socket.id].x,
        y: players[socket.id].y,
      };
      temporary.x = temporary.x - 2.5;
      //console.log(players[socket.id]);
      collision(players[socket.id].x, players[socket.id].y, temporary.x, temporary.y);
    }
  })
  socket.on('movementRight', function (playerId) {
    //console.log(playerId);
    if (playerId === players[socket.id].playerId) {
      var temporary = {
        x: players[socket.id].x,
        y: players[socket.id].y,
      };
      temporary.x = temporary.x + 2.5;
      //console.log(players[socket.id]);
      collision(players[socket.id].x, players[socket.id].y, temporary.x, temporary.y);
    }
  })
  socket.on('movementUp', function (playerId) {
    //console.log(playerId);
    if (playerId === players[socket.id].playerId) {
      var temporary = {
        x: players[socket.id].x,
        y: players[socket.id].y,
      };
      temporary.y = temporary.y - 2.5;
      //console.log(players[socket.id]);
      collision(players[socket.id].x, players[socket.id].y, temporary.x, temporary.y);
    }
  })
  socket.on('movementDown', function (playerId) {
    //console.log(playerId);
    if (playerId === players[socket.id].playerId) {
      var temporary = {
        x: players[socket.id].x,
        y: players[socket.id].y,
      };
      temporary.y = temporary.y + 2.5;
      //console.log(players[socket.id]);
      collision(players[socket.id].x, players[socket.id].y, temporary.x, temporary.y);
    }
  })

  function collision (x, y, tempX, tempY) {
    //console.log('collision function called');
    //console.log(x, y);
    //console.log('X: ', (Math.ceil(Math.ceil(x) / 200)) , 'Y: ', (Math.ceil(Math.ceil(y) / 200)));
    //console.log('blockingLayer', blockingLayer.data);
    //console.log('leingth', blockingLayer.data.length);
    console.log('blockingLayer.data: ', blockingLayer.data[(Math.ceil(Math.ceil(Math.ceil(tempY) / 48)) * 200) + (Math.ceil(Math.ceil(tempX - 48) / 48))] - 1);
    if (blockingLayer.data[(Math.ceil(Math.ceil(Math.ceil(tempY) / 48)) * 200) + (Math.ceil(Math.ceil(tempX - 48) / 48))] - 1 > 0) {
      //console.log('blocked');
      return;
    } else {
      players[socket.id].x = tempX
      players[socket.id].y = tempY
      io.sockets.emit('playerMoved', players[socket.id]);
    }
  }
});

http.listen(port, () => console.log('Listening on port:', port));
