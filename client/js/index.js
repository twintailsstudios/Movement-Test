var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 800,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);
var debugGraphics;
var localPlayerInfo = {playerId:'', username:'', descrip:'', headColor:'',bodyColor:'', specialList:[]};


function preload() {
  this.load.image('spritesheet', 'assets/images/spritesheet.png');
  this.load.tilemapTiledJSON('level_2', 'assets/tilemaps/level2.json');
  this.load.spritesheet('testBody', 'assets/spritesheets/testBody.png', {frameWidth: 32, frameHeight: 96});
  this.load.spritesheet('testFur', 'assets/spritesheets/testFur.png', {frameWidth: 32, frameHeight: 96});
  this.load.spritesheet('dude', 'assets/spritesheets/dude.png', {frameWidth: 32, frameHeight: 48});
  this.load.image('scroll2', 'assets/images/Scroll_02.png');
}

function create() {
  const map = this.make.tilemap({key: 'level_2'});
    const tileset = map.addTilesetImage('spritesheet');

    //Creates "layers" of different map tiles to be placed on top of one another
    const roof2_layer = map.createStaticLayer('roof2', tileset, 0, 0);
    const roof_layer = map.createStaticLayer('roof', tileset, 0, 0);
    const grass_layer = map.createStaticLayer('grass', tileset, 0, 0);
    const background_layer = map.createStaticLayer('background', tileset, 0, 0);
    const background2_layer = map.createStaticLayer('background2', tileset, 0, 0);
    const background3_layer = map.createStaticLayer('background3', tileset, 0, 0);
    const ground_layer = map.createStaticLayer('blocked', tileset, 0, 0);
    const ground2_layer = map.createStaticLayer('blocked2', tileset, 0, 0);
    const spawn_layer = map.createStaticLayer('spawn', tileset, 0, 0);

    //defines the height that each map layer is displayed at and what tile IDs player can collide with

    roof2_layer.depth = 4;
    roof2_layer.setCollision(-1);
    roof_layer.depth = 3;
    roof_layer.setCollision(-1);
    grass_layer.depth = 2;
    grass_layer.setCollision(-1);
    //ground_layer.setCollisionByProperty({ collide: true });
    ground_layer.setCollisionBetween(2367, 2499);
    ground_layer.depth = 0;
    ground_layer.setCollisionFromCollisionGroup();
    ground2_layer.setCollision(-1);
    background_layer.setCollision(-1);
    background2_layer.setCollision(-1);
    background3_layer.setCollision(-1);
    spawn_layer.setCollision(-1);



    if (this.game.config.physics.arcade.debug == true) {
      spawn_layer.depth = 5;
      console.log('this.debugMode = ', this.game.config.physics.arcade.debug);

      const debugGraphics = this.add.graphics().setAlpha(0.75);
      ground_layer.renderDebug(debugGraphics, {
        tileColor: null, //Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), //color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255) //color of colliding face edges
      });
      console.log(ground_layer);
    }








  var self = this;
  this.socket = io();
  this.otherPlayers = this.physics.add.group();
  this.cursors = this.input.keyboard.createCursorKeys();
  console.log('self.socket = ', self.socket);
  this.socket.on('currentPlayers', function (players, spells) {
    Object.keys(players).forEach(function (id) {
      console.log('Local players socket Id = ', players[id].playerId);
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
    spawnSpells(spells);
  });
  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
  this.socket.on('disconnect', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
  this.socket.on('playerMoved', function (playerInfo) {
    //console.log('playerMoved called successfully');
    //console.log(playerInfo.x, playerInfo.y);
    if (playerInfo.playerId === self.socket.id) {
      //console.log(playerInfo.x, playerInfo.y);
      self.stack.setPosition(playerInfo.x, playerInfo.y);
      self.stack2.setPosition(playerInfo.x, playerInfo.y);
      //self.stack3.setPosition(playerInfo.x, playerInfo.y);
      //localPlayerInfo.sprite.setPosition(playerInfo.x, playerInfo.y);
    } else {
      //console.log('someone else is moving')
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.setPosition(playerInfo.x, playerInfo.y)
          //console.log(otherPlayer);
        }
      });
    }
  });

  function addPlayer(self, playerInfo) {
    console.log(playerInfo.playerId, 'Spawn Location = ', 'X: ', playerInfo.x, 'Y: ', playerInfo.y);
    self.stack = self.physics.add.image(playerInfo.x, playerInfo.y, 'testBody');
    self.stack2 = self.physics.add.image(playerInfo.x, playerInfo.y, 'testFur');
    //self.stack3 = self.physics.add.image(playerInfo.x, playerInfo.y, 'dude');
    localPlayerInfo.playerId = playerInfo.playerId;
    //localPlayerInfo.sprite = self.stack
    let cam1 = self.cameras.main.setSize(920, 920).startFollow(self.stack).setName('Camera 1');
    self.stack2.setCollideWorldBounds(false);
    self.physics.add.collider(self.stack2, ground_layer);
    self.stack2.setMaxVelocity(200);
    self.stack2.setSize(8, 8);
    self.stack2.setOffset(12, 88);
    console.log(localPlayerInfo.sprite)
  }

  function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'testBody');
    otherPlayer.setTint(0xe978e1);
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
    //console.log(otherPlayer, otherPlayer.x);
  }

  function spawnSpells(spells) {
    var spell0 = self.add.image(spells[0].x, spells[0].y, spells[0].Icon).setInteractive();
    var spell1 = self.add.image(spells[1].x, spells[1].y, spells[1].Icon).setInteractive();
    var spell2 = self.add.image(spells[2].x, spells[2].y, spells[2].Icon).setInteractive();
    var spellInfo = {selection:'', Name:'', Descrip:'',locationX:'', locationY:''};
    spell0.on('pointerdown', function (pointer){
      //clickFunction();
      if (pointer.rightButtonDown()) {
        spellInfo.Name = spells[0].Name;
        console.log(spellInfo.Name, ' was Right clicked');
      } else {
        console.log('spell was Left clicked');
      }
    });
    spell1.on('pointerdown', function (pointer){
      //clickFunction();
      if (pointer.rightButtonDown()) {
        spellInfo.Name = spells[1].Name;
        console.log(spellInfo.Name, ' was Right clicked');
      } else {
        console.log('spell was Left clicked');
      }
    });
    spell2.on('pointerdown', function (pointer){
      //clickFunction();
      if (pointer.rightButtonDown()) {
        spellInfo.Name = spells[2].Name;
        console.log(spellInfo.Name, ' was Right clicked');
      } else {
        console.log('spell was Left clicked');
      }
    });
  }
}

function update() {
  if (this.stack) {
    if (this.cursors.left.isDown) {
      //console.log(localPlayerInfo.playerId);
      this.socket.emit('movementLeft', localPlayerInfo.playerId);

    } else {
      if (this.cursors.right.isDown) {
        this.socket.emit('movementRight', localPlayerInfo.playerId);

      }
    }
    if (this.cursors.up.isDown) {
      this.socket.emit('movementUp', localPlayerInfo.playerId);

    } else {
      if (this. cursors.down.isDown) {
        this.socket.emit('movementDown', localPlayerInfo.playerId);

      }
    }
    if (this.cursors.left.isUp && this.cursors.right.isUp) {

    }
    if (this.cursors.up.isUp && this.cursors.down.isUp) {

    }
  }
}
