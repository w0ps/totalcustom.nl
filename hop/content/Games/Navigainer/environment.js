function getTopAngle(vector3) { //for YXZ Euler order
  var a = Math.atan2(vector3.x, vector3.z);
  while (a > 2 * Math.PI) {
    a -= 2 * Math.PI;
  }
  while (a < 0) {
    a += 2 * Math.PI;
  }
  return a;
}

function getSlopeAngle(vector3){ //for YXZ Euler order
  return Math.atan2(Math.sqrt(Math.pow(vector3.x, 2) + Math.pow(vector3.z, 2)), vector3.y) - Math.PI/2;
}

var directionVectors = {
      n: new THREE.Vector3( 0, 0, 1),
      e: new THREE.Vector3( 1, 0, 0),
      s: new THREE.Vector3( 0, 0,-1),
      w: new THREE.Vector3(-1, 0, 0)
    },
    opposites = {
      n: 's',
      e: 'w',
      s: 'n',
      w: 'e'
    },
    rightTurns = {
      n: 'w',
      w: 's',
      s: 'e',
      e: 'n'
    },
    leftTurns = {
      n: 'e',
      e: 's',
      s: 'w',
      w: 'n'
    }
;

var Map = Class.extend({
	init: function(options){
		if(!options) options = {};
		this.scene = new THREE.Scene(options.scene);
		this.elements = [];
		this.pickables = [];
	},
  baseLevel: 0,
	add: function(object){
		this.elements.push(object);
		this.scene.add(object.model);
		object.map = this;
		return this;
	},
	remove: function(object){
		this.elements.splice(this.elements.indexOf(object), 1);
		this.scene.remove(object.model);
		object.map = null;
		return this;
	}
})

function Street(lanes, oneWay, traffic){
  this.length;
  this.lanes;
  this.oneWay = oneWay || 0;
  this.lanes = lanes || 1;
  this.nodes = [];
}

var pt,
  axis = new THREE.Vector3,
  up = new THREE.Vector3( 0, -1, 0 ),
  tangent = 0,
  radians = 0;
	
var tempSpheres = [];

(function(){
  this.connectTo = function connectTo(start, end/*{d: 'n', intersection: Intersection}*/){
    if(arguments.length){
      
      while(this.nodes.length < 2){
	arguments[this.nodes.length].intersection.directions[arguments[this.nodes.length].d] = this;
	this.nodes.push(arguments[this.nodes.length]);
      }
      
      var vertexes = [];
      
      var startPos = start.intersection.model.position.clone(),
			endPos = end.intersection.model.position;
      
      var tweenAmount = start.intersection.model.position.distanceTo(end.intersection.model.position) / 3;
          tweenAmount1 = start.intersection.customTween ? tweenAmount * start.intersection.customTween : tweenAmount,
          tweenAmount2 =   end.intersection.customTween ? tweenAmount *   end.intersection.customTween : tweenAmount;
      
      if(!directionVectors[start.d]) throw "Street.connectTo: Not an intersection node";
			var firstCP = directionVectors[start.d].clone().multiplyScalar(tweenAmount1).applyMatrix4(start.intersection.model.matrix);
			var lastCP = directionVectors[end.d].clone().multiplyScalar(tweenAmount2).applyMatrix4(end.intersection.model.matrix);
			
			vertexes.push(startPos, firstCP, lastCP, endPos);
			
			this.path = new THREE.CubicBezierCurve3(vertexes[0], vertexes[1], vertexes[2], vertexes[3]);
			this.length = this.path.getLength();
			
      this.segments = Math.round(this.length / 10);
			//var tube = new THREE.Mesh(new THREE.TubeGeometry( this.path, /* segments: */ this.segments, /* radius: */ 1, /* radiusSegments: */ 6, /* closed: */ false, /* debug: */ false ), tubeMaterial);
      
			this.model = new THREE.Mesh(new RoadGeometry(this.radius, this.getSpacedOrientedData(this.segments), /* debug: */ false), roadMaterial);
			//spraw
			//this.model = tube;
      //this.model = testSphere.clone();
			return this;
		}
	};
  this.getSpacedOrientedData = function(n){
    var path = this.path,
        step = 1 / n,
        list = [],
        dist, point, tangent, angle, i = 0;
    while(i <= n){
      dist = step * i;
      point = path.getPointAt(dist);
      tangent = path.getTangentAt(dist);
      angle = getTopAngle(tangent),
      slope = getSlopeAngle(tangent);
      list.push({position: point.clone(), angle: angle, slope: slope});
      i++;
    }
    return list;
  };
  this.radius = 4;
	this.placeAt = function(object, distance){
		if(distance <= this.length && distance >= 0){
      
      var relativeDistance = distance / this.length,
					topAngle, slopeAngle;
      // set the marker position
      pt = this.path.getPoint( relativeDistance );
      object.position.set( pt.x, pt.y, pt.z );
      
      // get the tangent to the curve
      tangent = this.path.getTangentAt( relativeDistance );
      topAngle = getTopAngle(tangent);
			slopeAngle = getSlopeAngle(tangent);
			
      //object.rotation.y = Math.atan2( tangent.x, tangent.z);
      object.rotation.y = topAngle;
			
      //object.rotation.x = Math.atan2(Math.sqrt(Math.pow(tangent.x, 2) + Math.pow(tangent.z, 2)), tangent.y) - Math.PI/2;
      object.rotation.x = slopeAngle;
			
			return { distanceLeft: this.length - distance, slopeAngle: slopeAngle };
		}
		else return {error: 'not on path'};
	};
}).call(Street.prototype)

function Intersection(x, y, z, yrot, trafficLights, directions ){
	this.x = x;
	this.y = y;
	this.z = z;
	this.directions = { n: false, e: false, s: false, w: false };
	this.trafficLights = trafficLights ? { direction: true, transition: false, stablePeriod: 1000, transitionPeriod: 200 } : false;
	this.model = new THREE.Mesh( new THREE.CylinderGeometry(14,15,1), defMaterial);
	this.model.position.x = this.x || 0;
	this.model.position.y = this.y || 0;
	this.model.position.z = this.z || 0;
	this.model.rotation.y = yrot || 0;
	this.model.moveable = true;
	this.model.intersection = this;
	
	//var axis = new THREE.Vector3( 0, 1, 0 ),
	//		angle = this.model.rotation.y;
	//
	//this.matrix = new THREE.Matrix4().makeRotationAxis( axis, angle );
	
	for(var i in this.directions){
		this.directions[i] = new THREE.Mesh(new THREE.SphereGeometry(5), defMaterial);
		var subnode = this.directions[i];
		subnode.d = i;
		subnode.position = directionVectors[i].clone().multiplyScalar(5);
		subnode.intersection = this;
		this.model.add(subnode);
	}
}

(function(){
	this.doForChildren = function(callback){
		for(var d in this.directions){
			if(this.directions[d].intersection) callback(this.directions[d], d);
			else this.recreateStreet(this.directions[d], d);
		}
	};
	this.recreateStreet = function(street, d){
		var intersection = this;
		
		var streetpath = street.path;
		
		if(street.nodes[0].intersection == this){
			var otherNode = street.nodes[1],
					usedFirst = false;
		}
		else{
			var otherNode = street.nodes[0],
					usedFirst = true;
		}
		intersection.model.parent.remove(street.model);
		
		//street = new Street();
		
		if(usedFirst) street.connectTo(otherNode, {d: d, intersection: intersection});
		else street.connectTo({d: d, intersection: intersection}, otherNode);
		
		intersection.model.parent.add(street.model);
	}
	this.updateRotation = function(scene){
		var intersection = this;
		//		axis = new THREE.Vector3( 0, 1, 0 ),
		//		angle = this.model.rotation.y;
		//
		//this.matrix = new THREE.Matrix4().makeRotationAxis( axis, angle );
		
		this.doForChildren(function(subnode, d){
			//rotate a defaultAngle with a set rotation and multiply by distance from center(5)
			//subnode.position = new THREE.Vector3().add( intersection.matrix.multiplyVector3( directionVectors[d].clone() ).multiplyScalar(5), intersection.model.position)//new THREE.Vector3(this.x, this.y, this.z);
			//subnode.rotation.y = intersection.model.rotation.y;
		});
    return this.matrix;
	}
	this.updatePosition = function(position){
		var relativePosition = this.model.position.sub(position);
		this.model.position.set(position.x, position.y, position.z);
		
		this.doForChildren(function(subnode){
			//subnode.position.sub(relativePosition);
		});
    return relativePosition;
	}
}).call(Intersection.prototype);

function NodeGrid(x, z, gridSize, zvar){
	this.intersections = [];
	this.streets = [];
	this.gridSize = gridSize || 50;
	
	var i = 0,
			j,
			offsetX = (x * this.gridSize) / 2,
			offsetY = (z * this.gridSize) / 2;
	while(i < z){
		j = 0;
		while(j < x){
			this.intersections.push(new Intersection(
				j * this.gridSize - offsetX,
				Math.random() * (zvar || 0),
				i * this.gridSize - offsetY,
				Math.random() * (2 * Math.PI)
			));
			j++;
		}
		i++;
	}
}

function CreateIntersection(){
	//var refPlane = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), helpMaterial);
	//
	//if(!refPlaneHeight) {
	//	window.refPlaneHeight = 0;
	//	window.refplanegui = gui.addFolder('refPlane');
	//	replanegui.add( window, 'refPlaneHeight', [-100, 200]);
	//}
	//
	//refPlane.position = relativeVector.clone();
	//refPlane.rotation.x = Math.PI/2;
	
	var refPlane = new RefPlane();
	aNavigainer.scene.add(refPlane);
	
	testSphere.scale = {x: .1, y: .1, z: .1};
	
	var first = 1,
			$screen = $(aNavigainer.viewport.renderer.domElement);
	
	$screen.on('mousemove.pickspot', function(e){
			var intersects = aNavigainer.pickPoint(e);
			
			if(intersects.length){
				for(var i in intersects){
					if(intersects[i].object.isRefPlane) {
						if(first) aNavigainer.scene.add(testSphere);
						mouse.dragging = true;
						testSphere.position = intersects[i].point.clone();
						break;
					}
				}
			}
	}).one('mousedown.pickspot', function(e){
		var intersects = aNavigainer.pickPoint(e);
		
		if(intersects.length){
			for(var i in intersects){
				if(intersects[i].object.isRefPlane) {
					var point = intersects[i].point,
							intersection = new Intersection( point.x, point.y, point.z);
					aNavigainer.city.intersections.push(intersection);
					aNavigainer.scene.add(intersection.model);
					aNavigainer.scene.remove(testSphere);
					aNavigainer.scene.remove(refPlane);
					
					$screen.off('mousemove.pickspot');
					break;
				}
			}
		}
	});
}