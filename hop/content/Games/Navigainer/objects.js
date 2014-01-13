var CC = {};

function LoadSkySphere(callback){
  THREE.ImageUtils.loadTexture("/textures/predawn.jpg", {}, function(texture){
    callback( new THREE.Mesh(
      new THREE.SphereGeometry(10000, 12, 12),
      new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        ambient: 0xFFFFFF,
        map: texture,
        side: THREE.BackSide
      })
    ));
  });
}

var testSphere = new THREE.Mesh(new THREE.SphereGeometry(10, 12, 12), highlightMat);
testSphere.scale = {x: .1, y: .1, z: .1};
testSphere.takeStreet = function(street, speed){
  game.scene.add(testSphere);
  if(game.dynamicMembers.indexOf(testSphere) == -1) game.dynamicMembers.push(testSphere);
  var pos = 0;
  testSphere.fun = function(){
    var result = street.placeAtDistance(testSphere, pos);
    pos += speed;
    if(result.error) testSphere.takeStreet(street, speed);
  }
}



function RefPlane(options){
  if(!options) var options = {};
  
  var refPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(options.x || 1000, options.y || 1000, options.xDim || 10, options.yDim || 10),
    options.material || helpMaterial
  );
  
  
  refPlane.position = options.position || new THREE.Vector3;
  refPlane.rotation.x = options.rotation || Math.PI/2;
  
  refPlane.isRefPlane = true;
  
  return refPlane;
}

CC.handleModels = {
  XZDragHandle: new THREE.Mesh( new THREE.CylinderGeometry(6, 7, 1), defMaterial),
  YDragHandle: new THREE.Mesh(new THREE.CylinderGeometry(0, 3, 6), defMaterial)
};



//js loading tools
var loader = new THREE.JSONLoader();

var geometries = {};

loader.load( "/models/simpleCar-xyflip.js", function( geometry ) {
    //var geometry = new THREE.CubeGeometry(5,10,5);
  var carGeometry = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
  geometries['carGeometry'] = carGeometry;
});