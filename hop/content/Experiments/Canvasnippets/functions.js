function getFollowPointAndRotation(follower, leader, maxDistance, minDistance){
  var dX = leader.x - follower.x,
      dY = leader.y - follower.y,
      angle = Math.atan2(dY, dX),
      distance = Math.sqrt(Math.pow(dX,2) + Math.pow(dY, 2)),
      tooFar = distance > maxDistance,
      tooNear = distance < minDistance,
      x = follower.x,
      y = follower.y,
      distanceToMove, nX, nY;

  if(tooNear || tooFar){
    distanceToMove = tooFar ? distance - maxDistance : distance - minDistance;
    nX = Math.cos(angle) * distanceToMove;
    nY = Math.sin(angle) * distanceToMove;
    
    x += nX;
    y += nY;
  }

  return { position: {x: x, y: y}, orientation: angle };
}