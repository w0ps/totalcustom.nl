var genericUVs = {
  topLeft: new THREE.Vector2(0,1),
  topRight: new THREE.Vector2(1,1),
  botLeft: new THREE.Vector2(0,0),
  botRight: new THREE.Vector2(1,0)
}

function RoadGeometry( width, dataPoints, debug ) {
  
	THREE.Geometry.call( this );
  
	this.width = width;
	var width_half = width / 2;
  
	//var normal = new THREE.Vector3( 0, 0, 1 );
  var normal = new THREE.Vector3( 0, 1, 0 ),
      i, point, vertex1, vertex2, sphere1, sphere2, distX, distZ;
  
  if(tempSpheres.length){
    for(i in tempSpheres){
      aNavigainer.scene.remove(tempSpheres[i]);
    }
    tempSpheres = [];
  }
  
  //generate vertices
  for(i in dataPoints){
    point = dataPoints[i];
    
    distX = Math.cos(-point.angle) * width_half;
    distZ = Math.sin(-point.angle) * width_half;
    
    vertex1 = point.position.clone();
    vertex1.x -= distX;
    vertex1.z -= distZ;
    
    vertex2 = point.position.clone();
    vertex2.x += distX;
    vertex2.z += distZ;
    
    if(debug){
      var sphere1 = testSphere.clone(), sphere2 = testSphere.clone();
      sphere1.position = vertex1.clone();
      sphere2.position = vertex2.clone();
      tempSpheres.push(sphere1, sphere2);
      aNavigainer.scene.add(sphere1);
      aNavigainer.scene.add(sphere2);
    }
    this.vertices.push(vertex1, vertex2);
  }
  
  //generate faces
  var uva, uvb, uvc, uvd,
      face;
  for(i = 0; i < dataPoints.length - 1; i++){
    uva = genericUVs.topLeft;
    uvb = new THREE.Vector2(0,1);
    uvc = new THREE.Vector2(1,1);
    uvd = new THREE.Vector2(1,0);
    
    face = new THREE.Face3(i*2, i*2+2, i*2+1);
    face.normal.copy(normal);
    face.vertexNormals.push(normal.clone(), normal.clone(), normal.clone());
    this.faces.push(face);
    this.faceVertexUvs[0].push([genericUVs.topLeft.clone() , genericUVs.botLeft.clone(), genericUVs.topRight.clone()]);
    
    face = new THREE.Face3(i*2+1, i*2+2, i*2+3);
    face.normal.copy(normal);
    face.vertexNormals.push(normal.clone(), normal.clone(), normal.clone());
    this.faces.push(face);
    this.faceVertexUvs[0].push([genericUVs.topRight.clone(), genericUVs.botLeft.clone(), genericUVs.botRight.clone()]);
  }
  
  this.computeCentroids();
};

RoadGeometry.prototype = Object.create( THREE.Geometry.prototype );

function RingGeometry(options) {
  
  THREE.Geometry.call(this);
  
  if (!options) options = {};
  
  this.outerRadius = options.outerRadius || this.defaults.outerRadius;
  this.innerRadius = options.innerRadius || this.defaults.innerRadius;
  this.segmentResolution = options.segmentResolution || this.defaults.segmentResolution;
  this.height = options.height || this.defaults.height;
  this.uvXRepeat = options.uvXRepeat || this.defaults.uvXRepeat;
  this.uvFit = options.uvFit !== undefined ? options.uvFit : this.defaults.uvFit;
  this.smooth = options.smooth !== undefined ? options.smooth : this.defaults.smooth;
  this.startAngle = options.startAngle !== undefined ? options.startAngle : this.defaults.startAngle;
  this.endAngle = options.endAngle !== undefined ? options.endAngle : this.defaults.endAngle;
  this.center = options.center || this.defaults.center.clone();
  
  var currentAngle = this.startAngle,
      angleRange = this.endAngle - this.startAngle,
      fullCircle = angleRange == (2 * Math.PI),
      segments = Math.round(angleRange / ((Math.PI * 2) / this.segmentResolution)),
      angleStep = angleRange / segments,
      i = 0,
      sin, cos,
      innerPointTop, innerPointBot, outerPointTop, outerPointBot;
  
  //debug
  if(options.debug && tempSpheres.length){
    for(var tsi in tempSpheres){
      aNavigainer.scene.remove(tempSpheres[tsi]);
    }
    tempSpheres = [];
  }
  
  //create inner verts
  while(i < segments ) {
    sin = Math.sin(currentAngle);
    cos = Math.cos(currentAngle);
    
    innerPointTop = new THREE.Vector3(sin * this.innerRadius, this.height / 2, cos * this.innerRadius);
    innerPointBot = innerPointTop.clone();
    innerPointBot.y = -(this.height / 2);
    
    outerPointTop = new THREE.Vector3(sin * this.outerRadius, this.height / 2, cos * this.outerRadius);
    outerPointBot = outerPointTop.clone();
    outerPointBot.y = -(this.height / 2);
    
    this.vertices.push(innerPointTop, innerPointBot, outerPointTop, outerPointBot);
    i++;
    currentAngle += angleStep;
  }
  
  if (!fullCircle) {
    currentAngle = this.endAngle;
    
    sin = Math.sin(currentAngle);
    cos = Math.cos(currentAngle);
    
    innerPointTop = new THREE.Vector3(sin * this.innerRadius, this.height / 2, cos * this.innerRadius);
    innerPointBot = innerPointTop.clone();
    innerPointBot.y = -(this.height / 2);
    
    outerPointTop = new THREE.Vector3(sin * this.outerRadius, this.height / 2, cos * this.outerRadius);
    outerPointBot = outerPointTop.clone();
    outerPointBot.y = -(this.height / 2);
    
    this.vertices.push(innerPointTop, innerPointBot, outerPointTop, outerPointBot);
  }
  
  //create faces
  var limit = segments * 4,
      topNormal = new THREE.Vector3(0,1,0),
      botNormal = new THREE.Vector3(0,-1,0),
      outFaceNormal,
      outVert1Normal,
      outVert2Normal,
      inFaceNormal,
      inVert1Normal,
      inVert2Normal,
      outerLeftTop,
      outerRightTop,
      innerLeftTop,
      innerRightTop,
      topFace1, topFace2,
      botFace1, botFace2,
      inFace1, inFace2,
      outFace1, outFace2;
      
  if(!fullCircle) limit -= 4;
  
  for(i = 4; i <= limit; i += 4){
    innerLeftTop = i - 4;
    innerLeftBot = i - 3;
    outerLeftTop = i - 2;
    outerLeftBot = i - 1;
    innerRightTop = i;
    innerRightBot = i + 1;
    outerRightTop = i + 2;
    outerRightBot = i + 3;
    
    if(i + 4 > limit){ //all right vertices are first instead!
      innerRightTop = 0;
      innerRightBot = 1;
      outerRightTop = 2;
      outerRightBot = 3;
    }
    
    topFace1 = new THREE.Face3(innerLeftTop, outerLeftTop, innerRightTop);
    topFace2 = new THREE.Face3(innerRightTop, outerLeftTop, outerRightTop);
    botFace1 = new THREE.Face3(innerLeftBot, innerRightBot, outerLeftBot);
    botFace2 = new THREE.Face3(innerRightBot, outerRightBot, outerLeftTop);
    outFace1 = new THREE.Face3(outerLeftTop, outerLeftBot, outerRightTop);
    outFace2 = new THREE.Face3(outerRightTop, outerLeftBot, outerRightBot);
    inFace1 = new THREE.Face3(innerLeftTop, innerRightTop, innerLeftBot);
    inFace2 = new THREE.Face3(innerRightTop, innerRightBot, innerLeftBot);
    
    outVert1Normal = this.vertices[outerLeftTop].clone().setY(0).normalize();
    outVert2Normal = this.vertices[outerRightTop].clone().setY(0).normalize();
    outFaceNormal = outVert1Normal.add(outVert2Normal).multiplyScalar(.5).normalize();
    inVert1Normal = outVert1Normal.clone().multiplyScalar(-1);
    inVert2Normal = outVert2Normal.clone().multiplyScalar(-1);
    inFaceNormal = outFaceNormal.clone().multiplyScalar(-1);
    
    topFace1.normal.copy(topNormal);
    topFace2.normal.copy(topNormal);
    botFace1.normal.copy(botNormal);
    botFace2.normal.copy(botNormal);
    
    outFace1.normal.copy(outFaceNormal);
    outFace2.normal.copy(outFaceNormal);
    
    inFace1.normal.copy(inFaceNormal);
    inFace2.normal.copy(inFaceNormal);
    
    topFace1.vertexNormals.push(topNormal.clone(), topNormal.clone(), topNormal.clone());
    topFace2.vertexNormals.push(topNormal.clone(), topNormal.clone(), topNormal.clone());
    botFace1.vertexNormals.push(botNormal.clone(), botNormal.clone(), botNormal.clone());
    botFace2.vertexNormals.push(botNormal.clone(), botNormal.clone(), botNormal.clone());
    
    outFace1.vertexNormals.push(outVert1Normal.clone(), outVert1Normal.clone(), outVert2Normal.clone());
    outFace2.vertexNormals.push(outVert2Normal.clone(), outVert1Normal.clone(), outVert2Normal.clone());
    
    inFace1.vertexNormals.push(inVert1Normal.clone(), inVert2Normal.clone(), inVert1Normal.clone());
    inFace2.vertexNormals.push(inVert2Normal.clone(), inVert2Normal.clone(), inVert1Normal.clone());
    
    this.faces.push(topFace1, topFace2, botFace1, botFace2, outFace1, outFace2, inFace1, inFace2);
    
    //topFace 1 & 2
    this.faceVertexUvs[0].push([genericUVs.botLeft.clone(), genericUVs.topLeft.clone(), genericUVs.botRight.clone()]);
    this.faceVertexUvs[0].push([genericUVs.botRight.clone(), genericUVs.topLeft.clone(), genericUVs.topRight.clone()]);
    //botFace 1 & 2
    this.faceVertexUvs[0].push([genericUVs.botLeft.clone(), genericUVs.botRight.clone(), genericUVs.topLeft.clone()]);
    this.faceVertexUvs[0].push([genericUVs.botRight.clone(), genericUVs.topRight.clone(), genericUVs.topLeft.clone()]);
    //outFace 1 & 2
    this.faceVertexUvs[0].push([genericUVs.topLeft.clone(), genericUVs.botLeft.clone(), genericUVs.topRight.clone()]);
    this.faceVertexUvs[0].push([genericUVs.topRight.clone(), genericUVs.botLeft.clone(), genericUVs.botRight.clone()]);
    //inFace 1 & 2
    this.faceVertexUvs[0].push([genericUVs.topRight.clone(), genericUVs.topLeft.clone(), genericUVs.botRight.clone()]);
    this.faceVertexUvs[0].push([genericUVs.topLeft.clone(), genericUVs.botLeft.clone(), genericUVs.botRight.clone()]);
  }
  if(!fullCircle){  
    var startFace1 = new THREE.Face3(0, 1, 2),
        startFace2 = new THREE.Face3(3, 2, 1),
        lastVert = this.vertices.length - 1;
        endFace1 = new THREE.Face3(lastVert - 3, lastVert, lastVert - 2),
        endFace2 = new THREE.Face3(lastVert, lastVert - 2, lastVert - 1);
    
    startFace1.normal.copy(botNormal); //todo set real
    startFace2.normal.copy(botNormal); //todo set real
    
    endFace1.normal.copy(botNormal); //todo set real
    endFace2.normal.copy(botNormal); //todo set real
    
    startFace1.vertexNormals.push(botNormal.clone(), botNormal.clone(), botNormal.clone()); //todo set real
    startFace2.vertexNormals.push(botNormal.clone(), botNormal.clone(), botNormal.clone()); //todo set real
    
    endFace1.vertexNormals.push(botNormal.clone(), botNormal.clone(), botNormal.clone()); //todo set real
    endFace2.vertexNormals.push(botNormal.clone(), botNormal.clone(), botNormal.clone()); //todo set real
    
    this.faces.push(startFace1, startFace2, endFace1, endFace2);
    
    //startFace 1 & 2
    this.faceVertexUvs[0].push([genericUVs.topLeft.clone(), genericUVs.botLeft.clone(), genericUVs.topRight.clone()]);
    this.faceVertexUvs[0].push([genericUVs.botLeft.clone(), genericUVs.topRight.clone(), genericUVs.botRight.clone()]);
    //endFace 1 & 2
    this.faceVertexUvs[0].push([genericUVs.topRight.clone(), genericUVs.topLeft.clone(), genericUVs.botLeft.clone()]);
    this.faceVertexUvs[0].push([genericUVs.botRight.clone(), genericUVs.topRight.clone(), genericUVs.botLeft.clone()]);
  }
  
  this.computeCentroids();
  
  if(options.debug){
    var sphere;
    for (var i in this.vertices) {
      sphere = testSphere.clone();
      sphere.position = this.vertices[i].clone();
      
      tempSpheres.push(sphere);
      aNavigainer.scene.add(sphere);
    }
  }
}

RingGeometry.prototype = Object.create( THREE.Geometry.prototype );
RingGeometry.prototype.defaults = {
  outerRadius: 10,
  innerRadius: 9,
  segmentResolution: 12,
  height: 1,
  startAngle: 0,
  endAngle: 2 * Math.PI,
  uvXRepeat: 1,
  uvFit: true,
  center: new THREE.Vector3(),
  smooth: true
  /*topOuterChamferSize: 0,
  topOuterChamferSegments: 0,
  topInnerChamferSize: 0,
  topInnerChamferSegments: 0*/
};
RingGeometry.prototype.constructSection = function(innerLeftTop, innerLeftBot, outerLeftTop, outerLeftBot, innerRightTop, innerRightBot, outerRightTop, outerRightBot){
  
}
