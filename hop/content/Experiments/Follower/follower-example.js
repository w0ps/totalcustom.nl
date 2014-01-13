$(document).ready(followerInit);

//var $dragMaster = $('#followerMaster');

function followerInit(){
  createTrailers(100);
}

function createTrailers(numFollowers){
  var $canvas = $('<canvas width="1000" height="500">')
      .appendTo('#Follower.exclusive')
      .css({border: '1px solid black', position: 'absolute', top: $('#Follower').offset().top + 'px' }),
      context = $canvas[0].getContext('2d'),
      $secondCanvas = $('<canvas width="1000" height="500">')
      .prependTo('#Follower')
      .css({border: '1px solid black', position: 'absolute', top: $canvas.position().top + 'px', left: $canvas.position().left + 'px'}),
      secondContext = $secondCanvas[0].getContext('2d'),
      leader = new Circle('rgb(255,0,0)', 10, 50, 70),
      followers = [];
  
  $('#Follower.exclusive').css({height: 700});
  
  context.clear = function(){
    context.clearRect(0,0,1000,500);
  }
  secondContext.fillWithColor = function(color){
    context.fillStyle = color;
    context.fillRect(0,0,1000,500);
  }
  
  while(followers.length < numFollowers){
    followers.push(new Arrow(
      'rgb(' + Math.round(Math.random()*255) + ',' + Math.round(Math.random()*255) + ',' + Math.round(Math.random()*255) + ')',
      20, 500, 0, 0
    ));
  }
  //leader.draw(context);
  //firstArrow.draw(context);
  
  var $doc = $(document),
      dragging;
  
  var alertedBefore = false;
  
  function dragStart(e){
    e.preventDefault();
    dragging = true;
    $doc.on({
      'touchmove.dragFollower': touchMove,
      'mousemove.dragFollower': mouseMove,
      'touchend.dragFollower': dragEnd,
      'mouseup.dragFollower': dragEnd
    });
    return false;
  }
  function mouseMove(e){
    var coords = getRelMouseCoords($canvas[0], {x: e.clientX, y: e.clientY});
    dragMove(coords);
  }
  
  function touchMove(e){
    e.preventDefault;
    var coords = new Generics.Point2D(Math.random()*1000, Math.random() * 1000);  
    
    if(!alertedBefore){
      alert(e.changedTouches.length || 'hoi');
      alert(coords.x + ', ' + coords.y);
      alertedBefore = true;
    }
    dragMove(coords);
  }
  function dragMove(relCoords){
    context.clear();
    var offset = $canvas.offset(),
        follower;
    leader.x = relCoords.x;
    leader.y = relCoords.y;
    leader.draw(context);
    for(var i in followers){
      follower = followers[i];
      if(i == 0) follower.follow(leader, 20, 0);
      else follower.follow(followers[i-1], 20, 0);
      follower.draw(context);
      follower.draw(secondContext);
    }
  }
  function dragEnd(e){
    dragging = false;
    $doc.off('touchmove.dragFollower');
    $doc.off('mousemove.dragFollower');
    $doc.off('mouseup.dragFollower');
    $doc.off('touchend.mousemove');
  }
  
  $canvas.on({
    'mousedown.dragFollower': dragStart,
    'touchstart.dragFollower': dragStart
  });
  
  var $canvasOffset = $canvas.offset();
  
  console.log({top: $canvasOffset.top + $canvas.height() / 2 + 'px', left: $canvasOffset.left + $canvas.width() / 2 + 'px'});
  
  //pep and dragmaster effectively replaces all regular drag handlers
  var $dragMaster = $('<div id="followerMaster" class="circle red"/>'),
      dmW = $dragMaster.width() / 2,
      dmH = $dragMaster.height() / 2;
  
  $dragMaster
    .appendTo(document.body)
    .css({top: $canvasOffset.top + $canvas.height() / 2 + 'px', left: $canvasOffset.left + $canvas.width() / 2 + 'px'})
    .pep({
      drag: function(e){
        console.log(e);
        var position = $dragMaster.position(),
            coords = getRelMouseCoords($canvas[0], {x: position.left, y: position.top});
        coords.x += dmW;
        coords.y += dmH;
        dragMove(coords);
      }
    })
  ;
}

function Circle(color, radius, x, y){
  this.color = color;
  this.radius = radius;
  this.x = x;
  this.y = y;
}
Circle.prototype.draw = function(context){
  context.save();
  context.beginPath();
  context.arc(this.x, this.y, this.radius, 0, 2*Math.PI, true);
  context.fillStyle = this.color;
  context.fill();
  context.restore();
}

function Arrow(color, size, x, y, orientation){
  this.color = color;
  this.size = size;
  this.x = x;
  this.y = y;
  this.orientation = orientation || 0;
}
Arrow.prototype.draw = function(context){
  context.save();
  var size = this.size;
  context.translate(this.x,this.y);
  context.rotate(this.orientation + Math.PI/2);
  context.beginPath();
  context.moveTo(0, -size/2);
  context.lineTo(size/3, size/5);
  context.lineTo(size/6, size/4);
  context.lineTo(size/6, size/2);
  context.lineTo(-size/6, size/2);
  context.lineTo(-size/6, size/4);
  context.lineTo(-size/3, size/5);
  context.lineTo(0, -size/2);
  context.fillStyle = this.color;
  context.fill();
  context.restore();
}
Arrow.prototype.follow = function(leader, maxDistance, minDistance){
  var dX = leader.x - this.x,
      dY = leader.y - this.y,
      angle = Math.atan2(dY, dX),
      distance = Math.sqrt(Math.pow(dX,2) + Math.pow(dY, 2)),
      tooFar = distance > maxDistance,
      tooNear = distance < minDistance;
  if(tooNear || tooFar){
    var distanceToMove = tooFar ? distance - maxDistance : distance - minDistance,
        nX = Math.cos(angle) * distanceToMove,
        nY = Math.sin(angle) * distanceToMove;
    
    this.x += nX;
    this.y += nY;
  }
  this.orientation = angle;
}
