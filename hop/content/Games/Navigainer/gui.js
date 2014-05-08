var gui = new dat.GUI({
});

var mouse = {
  //rollOffList: [],
  //rollOff: function(){
  //  
  //}
};

$('.dg.ac').appendTo('div[data-role="overlay"]');

var gameControls = gui.addFolder('Game controls');
gameControls.add(aNavigainer, 'start');
//gameControls.add(aNavigainer, 'pause');
gameControls.add(aNavigainer, 'stop');
gameControls.add(aNavigainer, 'granularity', 0, 1000);
gameControls.add(aNavigainer, 'speed', 0.01, 2);

var cameraControls = gui.addFolder('Camera controls');
cameraControls.add(window, 'fspeed', -5, 5);
var fovcontroller = cameraControls.add(aNavigainer.camera, 'fov', 25, 120).listen();
fovcontroller.onChange(function(arg){
  aNavigainer.camera.updateProjectionMatrix()  ;
});
cameraControls.add(aNavigainer.camera.position, 'x', -1000, 1000);
cameraControls.add(aNavigainer.camera.position, 'y',  -100, 200);
cameraControls.add(aNavigainer.camera.position, 'z', -1000, 1000);

var classicRotation = cameraControls.addFolder('Classic Rotation');
classicRotation.add(aNavigainer.camera.rotation, 'x', 0, 2 * Math.PI);
classicRotation.add(aNavigainer.camera.rotation, 'y', 0, 2 * Math.PI);
classicRotation.add(aNavigainer.camera.rotation, 'z', 0, 2 * Math.PI);
//classicRotation.add(aNavigainer.camera, 'eulerOrder', ['XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY', 'ZYX']);

//var quaternionRotation = cameraControls.addFolder('Quaternion Rotation');
//quaternionRotation.add(aNavigainer.camera.quaternion, 'w', -1 , 1);
//quaternionRotation.add(aNavigainer.camera.quaternion, 'x', -4 , 4);
//quaternionRotation.add(aNavigainer.camera.quaternion, 'y', -4 , 4);
//quaternionRotation.add(aNavigainer.camera.quaternion, 'z', -4 , 4);

gui.add(window, 'CreateIntersection');
gui.add(window, 'CreateRandomStreet');
gui.add(window, 'CreateRandomCar');

assignEditorHandlers();

function CreateRandomStreet(){
  aNavigainer.createStreet(pickADirection(pickAnIntersection()), pickADirection(pickAnIntersection()));
}

function CreateRandomCar() {
  var car = new Car;
  window.car = car;
  aNavigainer.addEntity(car);
  //aNavigainer.camera.lookAt(car.model);
}

function assignEditorHandlers(){
    var projector = new THREE.Projector(),
        $screen = $(aNavigainer.viewport.renderer.domElement);
    
    var mouseMoveFun, mouseMoveCooldown = 0;
    
    var firstPicked, highlighted;
    
    $screen.on({'mousemove.editMap': function(e){
      if (mouse.dragging) return;
      
      clearTimeout(mouseMoveFun);
      
      mouseMoveFun = setTimeout(function(){
        var intersects = aNavigainer.pickPoint(e, aNavigainer.map.pickables);
        
        if(intersects.length){
          //console.log(intersects);
          firstPicked = intersects[0].object.handle;
          
          if(firstPicked.interactiveHover || firstPicked !== highlighted){
            mouse.over = firstPicked;
            
            if(highlighted && highlighted !== firstPicked) highlighted.highlightOff()
            highlighted = firstPicked;
            highlighted.highlightOn(intersects[0]);
          }
        }
        else{
          if(mouse.over){
            if(highlighted) {
              highlighted.highlightOff();
              highlighted = null;
            }
            delete mouse.over;
          };
        }
        
      }, mouseMoveCooldown);
      
    }});
    
    function pointerDown(e) {
      if (selection) return;
      
      var intersects = aNavigainer.pickPoint(e, aNavigainer.map.pickables),
          firstIntersect;
      
      //this is for the old intersections
      if (!intersects.length) {
        intersects = aNavigainer.pickPoint(e);
      }//
      
      if (intersects.length) {
        firstIntersect = intersects[0];
        
        if (firstIntersect.object.drag) {
          mouse.dragging = true;
          
          var handlers = firstIntersect.object.drag(firstIntersect.point);
          function moveHandler(e) {
            handlers.pointerMove(e);
          }
          function upHandler(e) {
            $screen.off('mousemove.dragObject');
            $screen.off('touchmove.dragObject');
            handlers.pointerUp();
            mouse.dragging = false;
          }
          $screen.on('mousemove.dragObject', moveHandler);
          $screen.on('touchmove.dragObject', moveHandler);
          $screen.one('mouseup.dragObject', upHandler);
          $screen.one('touchend.dragObject', upHandler);
        }
        
        if(firstIntersect.object.moveable){
          mouse.dragging = true;
          
          var relativeVector = firstIntersect.point.clone().sub(firstIntersect.object.position),
              mover = firstIntersect.object;
          
          var refPlane = new RefPlane({position: relativeVector.clone()});
          aNavigainer.scene.add(refPlane);
          
          $screen.on('mousemove.dragObject', function(e){
            var intersects = aNavigainer.pickPoint(e);
            
            if(intersects.length){
              for(var i in intersects){
                if(intersects[i].object.isRefPlane) {
                  if(!mover.done);
                  mover.done = false;
                  mover.done = mover.intersection.updatePosition(intersects[i].point);
                  //game.camera.position.sub(mover.done.clone().multiplyScalar(.5));
                  mover.done = true;
                }
              }
            }
          });
          
          $screen.one('mouseup', function(){ $screen.off('mousemove.dragObject'); aNavigainer.scene.remove(refPlane); mouse.dragging = false;});
          
        }
          
      }
      
      else{
        //start moving the view. this part is a mess right now and needs to be cleaned
        var position = aNavigainer.camera.position.clone();
        position.y = aNavigainer.map.baseLevel;
        var refPlane = new RefPlane({position: position});
        aNavigainer.scene.add(refPlane);
        
        intersects = aNavigainer.pickPoint(e, [refPlane]);
        if(intersects.length){
          mouse.dragging = true;
          var originalLocation = intersects[0].point,
              originalCamLocation = aNavigainer.camera.position.clone(),
              lastLocation = originalLocation.clone(),
              relativeToCam = originalLocation.clone().sub(aNavigainer.camera.position),
              relativeAngle = Math.atan2(relativeToCam.z, relativeToCam.x),
              lastRelativeAngle = relativeAngle,
              relativeAngleToCam = relativeAngle - aNavigainer.camera.rotation.y,
              lastRelativeAngleToCam = relativeAngleToCam;
          
          console.log('originalLoc: ', relativeToCam, originalLocation, relativeAngle);
          
          function dragCamera(e){
            
            var intersects = aNavigainer.pickPoint(e, [refPlane]),
                currentLocation = intersects.length ? intersects[0].point : false;
            if (!currentLocation) {
              $screen.trigger('mouseup');
              console.log('failed to find point!');
              return;
            }
            //console.log('currentLoc: ', currentLocation);
            
            var relativeDistance = currentLocation.clone().sub(originalLocation);
            relativeDistance.y = 0;
            
            //console.log('relDist: ', relativeDistance);
            //aNavigainer.camera.position.copy(originalCamLocation.clone().sub(relativeDistance));
            
            var nRelativeToCam = currentLocation.clone().sub(aNavigainer.camera.position),
                nRelativeAngle = Math.atan2(nRelativeToCam.z, nRelativeToCam.x),
                nRelativeAngleToCam = nRelativeAngle - aNavigainer.camera.rotation.y;
            
            console.log(nRelativeToCam, nRelativeAngle);
            console.log(nRelativeAngle - relativeAngle);
            aNavigainer.camera.rotation.y += nRelativeAngleToCam - lastRelativeAngleToCam;
            
            nRelativeToCam = currentLocation.clone().sub(aNavigainer.camera.position);
            nRelativeAngle = Math.atan2(nRelativeToCam.z, nRelativeToCam.x);
            nRelativeAngleToCam = nRelativeAngle - aNavigainer.camera.rotation.y;
            
            lastRelativeAngle = nRelativeAngle;
            lastRelativeAngleToCam = nRelativeAngleToCam;
            
            lastLocation.copy(currentLocation);
          }
          function endDragCamera(){ $screen.off('mousemove.dragCamera'); $screen.off('touchmove.dragCamera'); aNavigainer.scene.remove(refPlane); }
          
          $screen.on('mousemove.dragCamera', dragCamera);
          $screen.on('touchmove.dragCamera', dragCamera);
          $screen.one('mouseup', endDragCamera)
          $screen.one('touchend', endDragCamera);
        }
        else aNavigainer.scene.remove(refPlane);
      }
    }
    
    $screen.on('mousedown', pointerDown);
    $screen.on('touchstart', pointerDown);
    
    $screen.on('click.default', function(e){
      if(mouse.dragging) {
        mouse.dragging = false;
        return;
      }
      
      var intersects = aNavigainer.pickPoint(e);
      
      if(intersects[0] && intersects[0].object.children) {
        var childrenChildren = aNavigainer.pickPoint(e, intersects[0].object.children);
        if(childrenChildren.length) {
          intersects = childrenChildren.concat(intersects);
          console.log('detected subobjects!', intersects);
        }
      }
      
               
      if(!selection){
        console.log('default click action', intersects);
        if ( intersects.length > 0 ) {
          ////has children?
          //if(intersects[0].object.children) {
          //  var childrenChildren = game.pickPoint(e, intersects[0].object.children);
          //  if(childrenChildren.length) {
          //    intersects = childrenChildren.concat(intersects);
          //    console.log('detected subobjects!', intersects);
          //  }
          //}
          
          
          
          if(intersects[0].object.removeable){
            aNavigainer.scene.remove( intersects[0].object );
          }
          else if(intersects[0].object.d){ //clicked 
            console.log('a direction', intersects[0].object.d);
            selection = intersects[0].object;
            selection.material = highlightMat;
          }
          else if(intersects[0].object.intersection){
            var intersection = intersects[0].object.intersection,
              xrotController = gui.add(intersection.model.rotation, 'y', 0, 2*Math.PI),
              doneController;
                            
            xrotController.onChange(function(){
              var matrix = intersection.updateRotation(aNavigainer.scene);
            });
            
            xrotController.onFinishChange(function(){
              gui.remove(xrotController);
            });
          }
        }
      }
      else{
        if(selection.d && intersects.length && intersects[0].object.d){
          console.log('creating street');
          
          aNavigainer.createStreet(selection, intersects[0].object);
          
          //clear clicknodes
          selection.intersection.model.remove(selection)
          intersects[0].object.intersection.model.remove(intersects[0].object);
          
          selection = null;
          
        }
      }
    });
  }
