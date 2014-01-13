var spaceserver;

function Player(socket, callback){
  var player = this;
  this.socket = socket;
  
  this.socket.on('setname', function(data, callback){
    console.log('setname', data);
    player.socket.set('nickname', data);
    console.log(player.game.players);
    if(callback) callback(data);
  });
  
  this.socket.on('notify', function(data, callback){
    var eventTime = new Date().getTime() + player.game.highestLatency;
    callback({time: eventTime, data: 'ok'});
  });
  
  this.getLatencyAndTimeDifference(callback);
}
(function(){
  this.getLatencyAndTimeDifference = function(callback){
    var player = this,
        sendTime = new Date().getTime();
    this.socket.emit('gettime', {}, function(data){
      console.log('data: ', data);
      var receiveTime = new Date().getTime();
      
      player.latency = (receiveTime - sendTime) / 2;
      var timeDifference = (sendTime - player.latency) - data;
      
      //clients store own time offset. Else it would be impossible to use broadcasting.
      player.socket.emit('settime', timeDifference);
      
      player.game.highestLatency = Math.max(player.game.highestLatency, player.latency);
    });
  };
}).call(Player.prototype);

function Game(io){
  this.players = [];
  this.ai = [];
  this.objects = [];
  this.running = false;
  this.highestLatency = 0;
  this.granularity = 1000;
  
  this.server = io.of('/spacegameserver');
  
  var game = this;
  
  this.server.on('connection', function(socket){
    game.addPlayer(socket);
  });
}
(function(){
  this.addPlayer = function(socket){
    var game = this,
        newPlayer = new Player(socket, function(name){
          game.sendTimedEvent('timedevent', name + ' joined');
        });
    newPlayer.game = this;
    this.players.push( newPlayer );
    if(this.players.length == 1 && !this.running) this.start();
  };
  this.getHighestLatency = function(callback){
    for(var i in this.players){
      this.highestLatency = Math.max(this.highestLatency, this.players[i].latency);
    }
    if(callback) callback();
  };
  this.start = function(){
    var game = this;
    console.log('starting: ', this);
    this.running = true;
    this.interval = setInterval(function(){ game.step() }, this.granularity)
  };
  this.step = function(){
    console.log(this.players);
    //clean disconnected players
    for(var i in this.players){
      if(this.players[i].socket.disconnected) this.players.splice(i, 1);
    }
    if(!i) this.stop();
  };
  this.stop = function(){
    clearInterval(this.interval);
    this.running = false;
    console.log('game stopped');
  };
  this.sendTimedEvent = function(identifier, data){
    console.log('highestLatency: ', this.highestLatency, ', identifier: ', identifier, ', data: ', data);
    var eventTime = new Date().getTime() + this.highestLatency;
    console.log('eventTime: ', eventTime);
    this.server.emit(identifier || 'someevent', {time: eventTime, data: data});
  };
}).call(Game.prototype);

var game;

exports.start = function(io, app){
  game = new Game(io);
}