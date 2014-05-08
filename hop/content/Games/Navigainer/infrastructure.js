
//var CC = {};

(function defineInfrastructure(){
  var CC = this;

  this.Handle = Class.extend({
    
    init: function(owner){
      this.owner = owner;
      this.model = CC.handleModels[this.type].clone();
      if(this.offset) this.model.position = this.offset.clone();
      if(this.rotation) this.model.rotation = this.rotation.clone();
      this.model.handle = this;
    },

    type: 'abstract',
    pickable: true,
    material: defMaterial,
    highlightMaterial: highlightMat,
    highlightOn: function(){
      this.model.material = this.highlightMaterial;
    },
    highlightOff: function(){
      this.model.material = this.material;
    }
  });
  
  this.XZDragHandle = CC.Handle.extend({
    init: function(owner){
      CC.Handle.prototype.init.call(this, owner);
      
      var handle = this,
          splitter = this.owner;
      
      this.model.drag = function(point){
        var relativeVector = point.sub(splitter.position);
        
        var refPlane = new RefPlane({position: splitter.position.clone()});
        
        splitter.map.scene.add(refPlane);
        
        return {
          pointerMove: function(e){
            var intersects = splitter.map.scene.parent.game.pickPoint(e, [refPlane]);
            if (intersects[0]) {
              var point = intersects[0].point.sub(relativeVector);
              point.y = splitter.position.y;
              splitter.updatePosition(point);
            }
          },
          pointerUp: function(e){
            splitter.map.scene.remove(refPlane);
          }
        }
      }
    },
    type: 'XZDragHandle',
    material: defMaterial//moveIconMaterial --fix uv's or something
  });
  
  this.YDragHandle = CC.Handle.extend({
    init: function(owner){
      CC.Handle.prototype.init.call(this, owner);
      
      var handle = this,
          splitter = this.owner;
      
      //this.model = CC.YDragHandleModel.clone();
      this.model.position.y = 6;
      this.model.drag = function(point){
        var relativeVector = point.sub(splitter.position);
        
        var refPlane = new RefPlane({position: splitter.position.clone()});
        refPlane.rotation.x = 0;
        refPlane.rotation.y = aNavigainer.camera.rotation.y;
        
        splitter.map.scene.add(refPlane);
        
        return {
          pointerMove: function(e){
            var intersects = splitter.map.scene.parent.game.pickPoint(e, [refPlane]);
            if (intersects[0]) {
              var point = intersects[0].point.sub(relativeVector);
              point.x = splitter.position.x;
              point.z = splitter.position.z;
              splitter.updatePosition(point);
            }
          },
          pointerUp: function(e){
            splitter.map.scene.remove(refPlane);
          }
        }
      }
    },
    type: 'YDragHandle',
    offset: new THREE.Vector3(0, 5, 0)
  });
  
  this.SplitterConnectHandle = CC.Handle.extend({
    init: function(owner, start, end){			
			this.owner = owner;
      
      this.model = new THREE.Mesh(new RingGeometry({segmentResolution: 20, startAngle : start, endAngle: end}), this.material);
      if(this.offset) this.model.position = this.offset.clone();
      if(this.rotation) this.model.rotation = this.rotation.clone();
      this.model.rotation.y = start;
      this.model.handle = this;
      
      this.model.drag = function(point){
        return CC.dragConduitFromSplitter(this.handle, point);
      };
    },
    highlightOn: function(info){
      this.owner.showPreviewConnection(info.point);
    },
    highlightOff: function(){
      this.owner.hidePreviewConnection();
    },
    type: 'SplitterConnectHandle',
    interactiveHover: true,
    rotation: new THREE.Euler(Math.PI/2, 0, 0, "YXZ")
  });
  
  /* generic infrastructure superclass */
  this.driveableInfrastructure = Class.extend({
    init: function(options){
      if(!options) options = {};
      if(!options.position) options.position = new THREE.Vector3;
      this.model = new THREE.Object3D;
      this.model.position = options.position;
      this.position = this.model.position;
    },
    type: 'abstract',
    construct: function(){
      console.log('This class has no geometryGenerator yet');
    },
    showHandles: function(){
      console.log('This class has no handles yet');
    }
  });
  
  /* road superclass */
  this.Conduit = this.driveableInfrastructure.extend({
    init: function initConduit(a,b){
      this.sides = {left: [{lanes: [], borders: []}], right: [{lanes: [], borders: []}] };
      this.a = a;
      this.b = b;

      var vertexes = [a.position, a.tangent, b.tangent, b.position];
    },
    construct: function constructConduit(){
      this.path = new THREE.CubicBezierCurve3(this.a.position, this.a.tangent.clone().add(this.a.position), this.b.tangent.clone().add(this.b.position), this.b.position);
      this.length = this.path.getLength();
      
      this.segments = Math.round(this.length / 10);
      this.radius = 5;
      //todo generate rest of conduit model in own construct functions
      
      this.model = new THREE.Mesh(new RoadGeometry(this.radius, Street.prototype.getSpacedOrientedData.call(this, this.segments), /* debug: */ false), roadMaterial);
    },
    type: 'Conduit'
  });

  this.Road = this.Conduit.extend({
    init: function(a,b){
      CC.Conduit.prototype.init.call(this, a, b);
    },
    type: 'Road'
  });
  this.Road.prototype = _.extend(_.extend({}, this.Conduit.prototype), this.Road.prototype);
  
  /* intersection superclass */
  this.Splitter = this.driveableInfrastructure.extend({
    init: function(options){
      CC.driveableInfrastructure.prototype.init.call(this, options);
      
      this.connections = [];
      this.borders = [];
      this.position = options.position || new THREE.Vector3();
      this.handles = {};
    },
    radius: 10,
    defaultConduitType: 'Road',
    sortConnections: function(){
      this.connections.sort(function(a, b){
        return a.angle - b.angle
      });
    },
    updatePosition: function(point){
      this.position.copy(point);
    },
    replace: function(splitter){
      if(splitter instanceof CC.Splitter){
        var connections = this.connections,
            borders = this.borders,
            position = this.position;
      }
    },
    createHandles: function(){
      this.handles.xzDragHandle = new CC.XZDragHandle(this),
      this.handles.yDragHandle = new CC.YDragHandle(this),
      this.handles.splitterConnectHandle = new CC.SplitterConnectHandle(this,0, 2 * Math.PI);
    },
    showHandles: function(){
      if(!this.handles.length) this.createHandles();
      
      for(var i in this.handles){
        this.model.add(this.handles[i].model);
        //this.handles[i].model.splitter = this;
        
        this.map.pickables.push(this.handles[i].model);
      }
      //this.model.add(XZDragHandle.model);
    },
    showPreviewConnection: function(point){
      this.hidePreviewConnection();
      var previewConnection = testSphere.clone();
      this.previewConnection = previewConnection;
      
      point = point.sub(this.position);
      
      point.y = 0;
      point.setLength(this.radius);
      
      var angle = Math.atan2(point.z, point.x);
      
      //console.log(dist, xDiff, zDiff, angle / Math.PI);
      
      var position = new THREE.Vector3(Math.cos(angle) * this.radius, 0, Math.sin(angle) * this.radius);
      
      if(0) previewConnection.position.copy(point);
      previewConnection.position.copy(position);
      
      this.model.add(previewConnection);
      //debugger;
    },
    hidePreviewConnection: function(){
      if (this.previewConnection) {
        this.model.remove(this.previewConnection);
      }
    }
  });
  
  this.Connector = this.driveableInfrastructure.extend({
    init: function(splitter, conduit, angle, tangent){
      this.splitter = splitter;
      this.conduit = conduit;
      this.angle = angle;
      this.tangent = tangent || new THREE.Vector3(0, 0, this.splitter.tangentSize || this.splitter.radius) || getVectorFromAngle(0, this.splitter.tangentSize);
      this.updatePosition();
    },
    updatePosition: function updateConnectorPosition(){
      this.position = this.splitter.position.clone(); //todo should be splitter.radius * angle + splitter.position
    },
    type: 'Connector'
  });
  
  this.Lane = this.driveableInfrastructure.extend({
    init: function(start, end, options){
      this.sections = [];
      this.start = start;
      this.end = end;
      
      if(options.sections){
        //add
      }
      else{
        this.sections.push(new CC.Section);
      }
    }
  });
  
  this.Section = this.Lane.extend({
    init: function(lane, start, end, options){
      this.lane = lane;
      Lane.prototype.init.call()
    }
  });
  
  this.RoadEnd = this.Splitter.extend({
    init: function(options){
      CC.Splitter.prototype.init.call(this, options || {});
    }
  });
  
  this.Crossroad = this.Splitter.extend({
    init: function(options){
      CC.Splitter.prototype.init.call(this, options || {});
    },
    type: 'Crossroad'
  });

  this.dragConduitFromSplitter = function(handle, point){
    var owner = handle.owner,
        relativeVector = point.clone().sub(owner.position),
        clickAngle = Math.atan2(relativeVector.z, relativeVector.x),
        newSplitter = new CC.Crossroad(),
        newConnectorA = new CC.Connector(handle.owner, undefined, clickAngle),
        newConnectorB = new CC.Connector(newSplitter, undefined, clickAngle + Math.PI),
        tangentA = newConnectorA.tangent,
        tangentB = newConnectorB.tangent,
        newConduit = new CC[owner.defaultConduitType](newConnectorA, newConnectorB),
        otherSplitter,
        map = owner.map,
        refPlane = new RefPlane({position: owner.position.clone()}),
        hitList = [refPlane],
        pickables = map.pickables;
        //_street = new Street();

    newConnectorA.conduit = newConnectorB.conduit = newConduit;

    owner.connections.push(newConnectorA);
    newSplitter.connections.push(newConnectorB);
    
    for (var i in map.pickables) {
      if (pickables[i].handle.type == 'SplitterConnectHandle') {
        hitList.push(pickables[i]);
      }
    }
    
    map.scene.add(refPlane);
    
    point.y = owner.position.y;
    
    newSplitter.position.copy(point);
    map.add(newSplitter);
    handle.highlightOff();
    
    newSplitter.showHandles();
    newSplitter.handles.xzDragHandle.highlightOn();
    
    return {
      pointerMove: function(e){
        var intersects = map.scene.parent.game.pickPoint(e, hitList);
        if (intersects[0]) {
          var firstIntersect = intersects[0].object,
              point = intersects[0].point;
          
          point.y = owner.position.y;
          
          if (firstIntersect.isRefPlane) {
            if (otherSplitter) {
              otherSplitter.handles.splitterConnectHandle.highlightOff();
              newSplitter = new CC.Crossroad();
              newConnectorB.splitter = newSplitter;
              newSplitter.connections.push(newConnectorB);
              map.add(newSplitter);
              newSplitter.showHandles();
              newSplitter.handles.xzDragHandle.highlightOn();
              
              otherSplitter = null;
            }
            newSplitter.updatePosition(point);
          }
          else if (firstIntersect.handle && firstIntersect.handle.type == 'SplitterConnectHandle') {
            if (!otherSplitter) {
              otherSplitter = firstIntersect.handle.owner;
              newSplitter.map.remove(newSplitter);
              newSplitter = null;

              newConnectorB.splitter = otherSplitter;
              otherSplitter.connections.push(newConnectorB);
            }
            firstIntersect.handle.highlightOn({point: point});
          }
          newConnectorB.updatePosition();
          if(newConduit.model) map.scene.remove(newConduit.model);
          newConduit.construct();
          map.scene.add(newConduit.model);
          
        }
      },
      pointerUp: function(e){
        var splitter = newSplitter || otherSplitter;
        splitter.handles.xzDragHandle.highlightOff();
        splitter.handles.splitterConnectHandle.highlightOff();
        map.scene.remove(refPlane);
      }
    };
  }
  
;
}).call(CC);

var aMap = new Map;
var aCrossing = new CC.Crossroad;

aCrossing.position.x = Math.random() * 5;
aCrossing.position.z = Math.random() * 6;
aCrossing.position.z = Math.random() * 2;

aNavigainer.map = aMap;
aMap.game = aNavigainer;
aNavigainer.scene.add(aMap.scene);
aMap.add(aCrossing);
materialsLoad.done(function(){
  aCrossing.showHandles();
});
