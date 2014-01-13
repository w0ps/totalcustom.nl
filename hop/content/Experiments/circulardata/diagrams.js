//Author Ivo de Kler - totalcustom.nl

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

	if(devicePixelRatio) {
		this.size.multiplyScalar(devicePixelRatio);
	}
	
	this.centerView = this.size.clone().multiplyScalar(.5);
	
	this.$canvas = $('<canvas width="' + this.size.x + '" height="' + this.size.y + '">')
	.appendTo($parentElement || document.body)
	.css({ position:'absolute', width: this.cssSize.x + 'px', height: this.cssSize.y + 'px' });
	
	this.context = this.$canvas[0].getContext('2d');
	
	this.contents = [];
	
	this.camera = new Object2D();
  this.camera.scale = 1 * (devicePixelRatio || 1);
  
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

function Object2D(options){
	var options = options || {};
	this.position = options.position ?
		(options.position instanceof THREE.Vector2 ?
			options.position : new THREE.Vector2(options.position.x, options.positions.y) )
		: new THREE.Vector2;
	this.rotation = options.rotation || 0;
	this.rotationSpd = options.rotationSpd || 0;
	this.momentum = new THREE.Vector2;
}
Object2D.prototype.step = function(dt){
	this.position.add(this.momentum);
}

function DataCircle(data, options){
	var options = options || {};
	this.data = data || this.defaultData;
	this.position = options.position || new THREE.Vector2;
  this.rotation = options.rotation || 0;
	this.defaultClick = options.defaultClick || function(){};
  this.defaultOver = options.defaultHover || function(){};
}
DataCircle.prototype.draw = function drawDataCircle(context){
	var seg, tau = 2 * Math.PI, color = new THREE.Color;
		for(var i in this.data){
		seg = this.data[i];
    
		context.beginPath();
		context.arc(0, 0, seg.radius, seg.start * tau, seg.end * tau);
		context.strokeStyle = color.setRGB(seg.color.r / 255, seg.color.g / 255, seg.color.b / 255).getStyle();
		context.lineWidth = seg.width;
		context.stroke();
	}
};
DataCircle.prototype.defaultData = [
	{ start: 0, end: 1/3, radius: 20, width: 40, name: 'red',
	  color: {r: 255, g: 0, b: 0} },
	{ start: 1/3, end: 2/3, radius: 20, width: 40, name: 'yellow',
	  color: {r: 255, g: 255, b:0}, over: function(seg){ this.color.r = Math.random() * 255; this.color.g = Math.random() * 255; this.color.b = Math.random() * 255;} },
	{ start: 2/3, end: 1, radius: 20, width: 40, name: 'blue',
	  color: {r: 0, g: 0, b: 255}, click: function(seg){ console.log('seg click: ', seg, this); } }
];
DataCircle.prototype.click = function dataCircleClick(point){
	var seg, segments = this.getSegmentByPoint(point);
	console.log('segments to query: ', segments.length ? segments[0] : 'none');
	for(var i in segments){
		seg = segments[i];
		if(seg.click && typeof seg.click == 'function'){
			if(!(seg.click(seg) === false) ) this.defaultClick(seg);
		}
		this.defaultClick(seg);
	}
};
DataCircle.prototype.click = function dataCircleClick(point){
	var seg, segments = this.getSegmentByPoint(point);
	for(var i in segments){
		seg = segments[i];
		if(seg.click && typeof seg.click == 'function'){
			if(!(seg.click(seg) === false) ) this.defaultClick(seg);
		}
		this.defaultClick(seg);
	}
};
DataCircle.prototype.over = function dataCircleClick(point){
	var seg, segments = this.getSegmentByPoint(point);
	for(var i in segments){
		seg = segments[i];
		if(seg.over && typeof seg.over == 'function'){
			if(seg.over(seg) === false) return;
      this.defaultOver(seg);
		}
		this.defaultOver(seg);
	}
  if(segments.length) this.generalOver(segments);
};
DataCircle.prototype.generalOver = function(segments){};
DataCircle.prototype.getSegmentByPoint = function getSegmentByPoint(point){
	var angle = Math.atan2(point.y, point.x),
		tau = angle/(2*Math.PI),
		seg,
		foundSegments = [],
		radius = Math.sqrt( Math.pow(point.x, 2) + Math.pow(point.y, 2) );
  
	tau = tau < 0 ? tau + 1 : tau;
	
	for (var i in this.data) {
		seg = this.data[i];
		
		if (
			seg.start < tau &&
			seg.end > tau &&
			radius < seg.radius + (seg.width / 2) &&
			radius > seg.radius - (seg.width / 2) 
		){
			foundSegments.push(seg);
		}
	}
	return foundSegments;
};
