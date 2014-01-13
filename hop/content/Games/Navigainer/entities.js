var Car = Class.extend({
  init: function(){
    this.model = geometries.carGeometry.clone();
    this.model.scale.x = .1;
    this.model.scale.y = .1;
    this.model.scale.z = .1;
    
    this.model.rotation.order = "YXZ";
    
    //this.positionAt()
    this.location = pickAStreet();
    this.currentOffset = 0;
    this.speed = 10;
    this.placement = this.location.placeAt(this.model, this.currentOffset);
  },
  directionIntent: false,
  step: function(dt){
    var delta = this.speed * (dt/1000);
    if (this.placement.distanceLeft < delta) {
      //console.log('reaching end');
      //change a path or do something;
      this.currentOffset = 0;
      this.placement = this.location.placeAt(this.model, this.currentOffset);
      
    }
    else{
      this.currentOffset += delta;
      this.placement = this.location.placeAt(this.model, this.currentOffset);
    }
  },
  dynamic: true,
  tangent: 0,
  radians: 0,
  axis: new THREE.Vector3
});