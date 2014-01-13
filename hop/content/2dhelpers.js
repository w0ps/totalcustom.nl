function getRelMouseCoords(element, coords){
    var totalOffsetX = 0,
        totalOffsetY = 0,
        canvasX = 0,
        canvasY = 0,
        currentElement = element;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop  - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)
    
    canvasX = coords.x - totalOffsetX;
    canvasY = coords.y - totalOffsetY;

    return new Generics.Point2D(canvasX, canvasY);
}

var Generics = {
  Point2D: function Point2D(x,y){
    this.x = x || 0;
    this.y = y || 0;
  },
  Rect2D: function Rect2D(ul,lr){
    this.ul = ul instanceof Generics.Point2D ? ul.clone() : new Generics.Point2D(ul.x, ul.y);
    this.lr = lr instanceof Generics.Point2D ? lr.clone() : new Generics.Point2D(lr.x, lr.y);
	this.setCenter();
  }
}

assign(
  { scope: Math,
    props: {
      pytha: function pytha() {
        var sum = 0,
            i = 0;
        while (i < arguments.length) {
          sum += Math.pow(arguments[i],2);
          i++;
        }
        return Math.sqrt(sum);
      }
    }
  },
  { scope: Generics.Point2D.prototype,
    props:{
      equals: function(point2D){
        return point2D.x == this.x && point2D.y == this.y;
      },
      clone: function(){
        return new Generics.Point2D(this.x, this.y);
      },
      add: function(amount){
        return new Generics.Point2D(this.x + amount, this.y + amount);
      },
      addPoint: function(point){
        return new Generics.Point2D(this.x + point.x, this.y + point.y);
      },
      multiply: function(factor){
        return new Generics.Point2D(this.x * factor, this.y * factor);
      },
      normalize: function(){
        return this.multiply(1 / this.length);
      },
      assume: function(point){
        this.x = point.x;
        this.y = point.y;
        return this;
      },
	  distance: function(point){
	    return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y));
	  },
      rotate: function(a){
        //return new rotated vector
      }
    }
  },
  { scope: Generics.Rect2D.prototype,
    props:{
      isInside: function(point2D){
        return
          point2D.x >= this.lr.x &&
          point2D.x <= this.ul.x &&
          point2D.y >= this.lr.y &&
          point2D.y <= this.ul.y;
      },
      limit: function(point2D){
        if(!this.isInside(point2D)) return new Generics.Point2D(
          Math.min(Math.max(this.lr.x, point2D.x), this.ul.x),
          Math.min(Math.max(this.lr.y, point2D.y), this.ul.y)
        );
        else return point2D.clone();
      },
      wrap: function(point2D){
        if(!this.isInside(point2D)) return new Generics.Point2D(
          point2D.x < this.lr.x ?
            this.ul.x - point2D.x - this.lr.x :
            this.lr.x + point2D.x - this.ul.x,
          point2D.y < this.lr.y ?
            this.ul.y - point2D.y - this.lr.y :
            this.lr.y + point2D.y - this.ul.y
        );
        else return point2D.clone();
      },
      clone: function(){
        return new Generics.Rect2D(this.ul, this.lr);
      },
	  setCenter: function(point){
	    this.center = point ?
		  (point instanceof Generics.Point2D ? point : new Generics.Point2D(point)) :
		  new Generics.Point2D((this.ul.x + this.lr.x) / 2, (this.ul.x + this.lr.x) / 2);
	  },
      assume: function(rect2d){
        this.lr = rect2d.lr.clone();
        this.ul = rect2d.ul.clone();
        return this;
      }
    }
  }
)

Object.defineProperty(Generics.Point2D.prototype, 'length', {get: function(){ return Math.pytha(this.x, this.y); }});