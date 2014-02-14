function Object2D(options){
	options = options || {};
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
	options = options || {};
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