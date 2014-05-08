var selection = null;

//simple
var requestAnimationFrame = window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.webkitRequestAnimationFrame || window.requestAnimationFrame;

var Navigainer = Game.extend({
  init: function(){
    this.entities = [];
    //this.collisionObjects = {};
    //this.bullets = [];
    //
    //this.players = [];
    
    
    //spawn hack
    //this.add('Player', 'randomID', {x:0, y:0}, 0, 'red');
    
    this.viewport = new Viewport3D();
    
    //this.viewport.context.translate(this.viewport.center.x, this.viewport.center.y);
    //this.viewport.context.save();
    
    var game = this;
    
    this.zoom = 1;
    this.dynamicEntities = [];
    //this.player = new LocalPlayer();
    this.city = new NodeGrid(0, 0, 100, 25);
    
    this.scene = new THREE.Scene();
    this.scene.game = this;
    
    LoadSkySphere(function(skysphere){
      skysphere.position = game.camera.position;
      game.scene.add(skysphere);
      game.skysphere = skysphere;
    });
    
    for(var i in this.city.intersections){
    	this.scene.add(this.city.intersections[i].model);
    }
    for(var i in this.city.streets){
    	this.scene.add(this.city.streets[i].model);	
    }
    
    var pointLight = new THREE.PointLight( 0xFFFFFF);
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 30;
    
    var ambientLight = new THREE.AmbientLight(0xFFFFFF);
    
    this.camera = (function(options){
      options = options ? $.extend({
              angle: 45,
              aspect: 1,
              clip: {near: 0.1, far: 10000 }
      }, options) : {angle: 45, aspect: 1, clip: {near: 0.1, far: 10000 }};
      var cam = new THREE.PerspectiveCamera(options.angle, options.aspect, options.clip.near, options.clip.far);
      
      cam.rotation.order = "YXZ";
      
      return cam;
    })({ aspect: this.viewport.width / this.viewport.height });
    
    this.scene.add(this.camera);
    
    this.camera.position.y = 45.4316732724453;
    this.camera.position.z = 80.82026537997581;
    this.camera.rotation.x = 5.923957245071458;
    
    
    this.scene.add(pointLight);
    this.scene.add(ambientLight);
    
    this.camera.step = function(){
            
    }
    this.dynamicEntities.push(this.camera);
    
    window.fspeed = 1;
    
    this.render();
    
    this.viewport.$overlay.on('remove', function(){
      console.log('stopping');
      game.stop();
    });
    
  },
  constants: {
    CIRCLE: 2 * Math.PI,
    HALFCIRCLE: Math.PI,
    roadResolution: 100
  },
  speed: 1,
  granularity: 50,
  addEntity: function(entity){
    this.entities.push(entity);
    if (entity.dynamic) this.dynamicEntities.push(entity);
    if (entity.model) this.scene.add(entity.model);
  },
  remove: function(entity){
    //
  },
  //getShipById: function(id, callback){
  //  for(var i in this.entities){
  //    if(this.entities[i].id == id){
  //      callback(this.entities[i], i);
  //    }
  //  }
  //},
  step: function(dt){
    var i = 0,
        len = this.dynamicEntities.length;
    //    entity;
    //while (i < len) {
    //  this.entities[i].preTurn(dt);
    //  i++;
    //}
    
    //TURN
    //i = 0;
    while (i < len) {
      this.dynamicEntities[i].step(dt * this.speed);
      i++;
    }
        
    this.render();
  },
  render: function(){
    var game = this;
    requestAnimationFrame(function(time){
      game.viewport.renderer.render(game.scene, game.camera);
      if(game.renderOn) requestAnimationFrame(arguments.callee);
    });
  },
  pickPoint: function(e, collection){
    return getIntersects(e.clientX, e.clientY, this.viewport.width, this.viewport.height, new THREE.Projector(), this.camera, collection || this.scene.children);
  },
  createStreet: function(node1, node2){
    var newStreet = new Street().connectTo(
      {
        d: node1.d,
        intersection: node1.intersection
      },
      {
        d: node2.d,
        intersection: node2.intersection
      }
    );
    this.city.streets.push(newStreet);
    this.scene.add(newStreet.model);
    return newStreet;
  }
});

function Viewport3D() {
  this.$overlay = $('body').overlay();
  
  this.width = this.$overlay.width();
  this.height = this.$overlay.height();
  
  this.renderer = Detector.webgl ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
  this.$overlay.append(this.renderer.domElement);
  this.renderer.setSize(this.width, this.height);
  
  this.zoom = 1;
  this.offset = new Generics.Point2D(0,0);
  this.center = new Generics.Point2D(this.width / 2, this.height / 2);
}

function getIntersects(x, y, width, height, projector, camera, collection){
  x =  ( x / width  ) * 2 - 1;
  y = -( y / height ) * 2 + 1;
  var vector = new THREE.Vector3(x, y, .5);
  projector.unprojectVector(vector, camera);
  
  //Raycaster( origin, direction, near, far )
  var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
  //debugger;
  return ray.intersectObjects( collection );
}


var aNavigainer = new Navigainer();
    aNavigainer.start();


var intersections = aNavigainer.city.intersections,
    streets = aNavigainer.city.streets;
function pickAnIntersection(){ return intersections[Math.floor(Math.random() * intersections.length)]; }
function pickADirection(intersection){ return intersection.directions[(Math.round(Math.random()) ? (Math.round(Math.random()) ? 'n' : 's') : (Math.round(Math.random()) ? 'e' : 'w') )]; }
function pickAStreet(){ return streets[Math.floor(Math.random() * streets.length)]; }
