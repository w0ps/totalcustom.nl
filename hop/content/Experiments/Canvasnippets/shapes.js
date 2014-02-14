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
};

function Arrow(color, size, x, y, orientation){
  this.color = color;
  this.size = size || 10;
  this.x = x || 0;
  this.y = y || 0;
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
};