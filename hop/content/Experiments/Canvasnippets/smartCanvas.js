//Author Ivo de Kler - totalcustom.nl

var root = window; //todo set appropriately

function wrap(val, max, min) {
  var range;
  if (!max) max = 1;
  if (!min) min = 0;
  range = max - min;
  if (val < min) return val + range;
  if (val > max) return val - range;
  return val;
}
function fit(value, min, max, start, end) {
  value = Math.max(Math.min(value, max), min);
  var range1 = max - min,
      range2 = end - start;
  return (((value - min) / range1) * range2) + start;
}


function SmartCanvas(options, $parentElement){
	var smartCanvas = this;

	options = options || {};
	this.backgroundColor = options.backgroundColor;
	
	this.size = new THREE.Vector2(
	  options.size ? options.size.x : ($parentElement ? $parentElement.innerWidth() : window.innerWidth),
		options.size ? options.size.y : ($parentElement ? $parentElement.innerHeight() : window.innerHeight)
	);
	this.cssSize = this.size.clone();

	if(root['devicePixelRatio']) {
		this.size.multiplyScalar(devicePixelRatio);
	}
	
	this.centerView = this.size.clone().multiplyScalar(.5);
	
	this.$canvas = $('<canvas width="' + this.size.x + '" height="' + this.size.y + '">')
	.appendTo($parentElement || document.body)
	.css({ width: this.cssSize.x + 'px', height: this.cssSize.y + 'px' });
	
	this.context = this.$canvas[0].getContext('2d');
	
	this.contents = [];
	
	this.camera = new Object2D();
  this.camera.scale = 1 * (root[devicePixelRatio] || 1);
  
  this.contents.push(this.camera);
	
	this.context.fillStyle = 'black';
	
  this.noDraw = options.noAutoDraw;
  this.noClear = options.autoClear;
	if(!this.noDraw) this.draw();
	
	//this.defaultClick =   
	
	
	function canvasOver(e) {
		var worldSpacePoint = smartCanvas.toWorldSpace({x: e.offsetX, y: e.offsetY }),
        items = smartCanvas.contents,
        itemSpacePoint,
        item;
    
		for(var i in items){
      item = items[i];
      itemSpacePoint = smartCanvas.toItemSpace(item, worldSpacePoint)
			if(item.over && typeof item.over == 'function') {
        item.over(itemSpacePoint);
			}
		}
	};
	
	function canvasClick(e) {
		var camSpacePoint = smartCanvas.toWorldSpace({x: e.offsetX, y: e.offsetY}),
        itemSpacePoint, item, angle;
		
		for(var i in smartCanvas.contents){
			item = smartCanvas.contents[i];
			itemSpacePoint = smartCanvas.toItemSpace(item, camSpacePoint)
      
			if(item.click && typeof item.click == 'function') {
        item.click(itemSpacePoint);
			}
		}
	}
	
	this.$canvas.on({ mousemove: canvasOver, click: canvasClick });
}
(function(){
	this.add = function(item){
		this.contents.push(item);
		if(!this.noDraw) this.draw();
	};
	this.clear = function(){
    if (!this.backgroundColor) this.context.clearRect(0, 0, this.size.x, this.size.y);
    else{
      this.context.fillStyle = this.backgroundColor;
      this.context.fillRect(0, 0, this.size.x, this.size.y);
    }
	},
  this.step = function(dt){
    var item;
    for (var i in this.contents) {
      item = this.contents[i];
      if (item.step) {
        item.step(dt);
      }
      if (item.momentum) {
        item.position.add(item.momentum);
      }
      if (item.rotationSpd) {
        item.rotation = wrap(item.rotation + item.rotationSpd, Math.PI * 2);
      }
    }
    if (!this.noDraw) this.draw();
  };
	this.draw = function(){
		this.context.resetTransform();
		
		if(!this.noClear) this.clear();
		
		this.context.translate(this.centerView.x, this.centerView.y);
    
    this.context.rotate(this.camera.rotation);
    
    this.context.scale(this.camera.scale, this.camera.scale);
    
		this.context.translate(this.camera.position.x, this.camera.position.y);
		
    
		
		var item;
		for(var i in this.contents){
      item = this.contents[i];
      if (!item.draw) continue;
			this.context.save();
			if (item.opacity) this.context.globalAlpha = item.opacity;
			if(item.position) this.context.translate(item.position.x, item.position.y);
			if(item.rotation) this.context.rotate(item.rotation);
			if(item.scale) this.context.scale(item.scale, item.scale);
      
			item.draw(this.context);
			this.context.restore();
		}
		this.context.save();
	};
	this.toWorldSpace = function toWorldSpace(screenPoint){
		var camPoint = new THREE.Vector2(screenPoint.x, screenPoint.y);

		camPoint.multiplyScalar(root['devicePixelRatio'] || 1);

    	camPoint.sub(this.centerView);
    
		var sin = Math.sin(-this.camera.rotation),
        cos = Math.cos(-this.camera.rotation);
    
		camPoint.set(
			camPoint.x * cos - camPoint.y * sin,
			camPoint.x * sin + camPoint.y * cos
		);
    
    camPoint.multiplyScalar(1 / this.camera.scale);
    
    camPoint.sub(this.camera.position);
		
		return camPoint;
	};
  this.toItemSpace = function toItemSpace(item, worldSpacePoint){
    var itemSpacePoint = worldSpacePoint.clone();
    if(item.position) itemSpacePoint.sub(item.position);
    if(item.rotation){
      var sin = Math.sin(-item.rotation),
          cos = Math.cos(-item.rotation);
      
      itemSpacePoint.set(
        itemSpacePoint.x * cos - itemSpacePoint.y * sin,
        itemSpacePoint.x * sin + itemSpacePoint.y * cos
      )
    }
    if (item.scale) itemSpacePoint.multiplyScalar(1 / (item.scale || 1));
    return itemSpacePoint;
  };
	//this.startDrag = function(e){
	//	var originalLocation = smartCanvas.toWorldSpace({x: e.offsetX, y: e.offsetY});
	//	
	//	//this.drag = 
	//	this.$canvas.on({mousemove: function(e){
	//		var currentLocation ;
	//		this.camera.position;
	//	}});
	//};
}).call(SmartCanvas.prototype);