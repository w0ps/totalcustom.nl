var timeDifference;

function connectToServer(gameid, username, callback){
  socketConnectionAvailable(function(){
    var socket = io.connect('/' + gameid);
    localStorage.username = username;
    
    socket.of('/').on('reload', function (data) {
      if(data.path.indexOf(location.pathname) !== -1 || data.path == '/') location.reload();
    });
    
    
    socket.on('gettime', function(name, callback){
      //socket.emit('sendtime', new Date().getTime());
      callback(new Date().getTime());
      console.log(name);
    });
    
    socket.on('settime', function(data){
      timeDifference = data;
      console.log(timeDifference);
      
      socket.emit('setname', username, function(){
        if(callback) callback(socket);
      });
    });
    
    socket.on('timedevent', function(data){
      var now = new Date().getTime();
      setTimeout(function(){ alert(data.data); }, now + data.time + timeDifference);
    });
  });
}

function socketConnectionAvailable(callback){
  if(window['io']) callback();
  else $.getScript("/socket.io/socket.io.js", function(){
    callback();
  });
}