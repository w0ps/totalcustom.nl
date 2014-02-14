//Author Ivo de Kler - totalcustom.nl



function initDemo() {

  var $overlay = $('body').overlay();
  
  window.mySmartCanvas = new SmartCanvas({backgroundColor: 'rgba(0,0,0,1)'}, $overlay);
  window.myCam = mySmartCanvas.camera;
  window.myCircle = new DataCircle(randomCircleData1(100, 500), {
    defaultHover: function(seg){
      seg.radius = Math.max(seg.radius * .9, 10);
      seg.width = Math.min(seg.radius, seg.width * 1.1);
    }
  });
  
  var t = Math.random() * 1000000,
      lastTime = new Date().getTime();
  var loop = setInterval(function(){
    
    var newTime =  new Date().getTime(),
        dt = newTime - lastTime;
    lastTime = newTime;
    
    t += .001;
    var dist = fit(Math.sin(t / 21), -1, 1, 0, 1000);
    myCam.position.x = Math.sin(t * (233/144)) * dist;
    myCam.position.y = Math.cos(t * (144/233)) * dist;
    
    myCam.scale = fit(Math.sin(t / .35), -1, 1, 1/3, 1.2);
    
    mySmartCanvas.backgroundColor = 'rgba(' +
      Math.round(fit(Math.sin(t / 5), -1, 1, 0, 255)) + ',' +
      Math.round(fit(Math.sin(t / 8), -1, 1, 0, 255)) + ',' +
      Math.round(fit(Math.sin(t / 13), -1, 1, 0, 255)) + ',' +
      (.004) + ')'
    
    mySmartCanvas.step();
  });
  
  var autoAddRestart, autoAddTime = 5000;
  mySmartCanvas.$canvas.on('click', function(e){
    var coordinates = mySmartCanvas.toWorldSpace({x: e.offsetX, y: e.offsetY});
    
    var treshold = 150, newClosest = Infinity, theClosest,
        closest = Infinity, i = 1, circles = mySmartCanvas.contents, len = circles.length;
    while (i < len) {
      newClosest = Math.min(closest, coordinates.clone().sub(circles[i].position).length());
      if (closest !== newClosest) {
        closest = newClosest;
        theClosest = circles[i];
      }
      i++;
    }
    
    if(!(closest < treshold)) createRandomCircle1(coordinates);
    else{
      var position = theClosest.position.clone(), rotationSpd = theClosest.rotationSpd;
      mySmartCanvas.contents.splice(mySmartCanvas.contents.indexOf(theClosest), 1);
      createRandomCircle1(position, rotationSpd);
    }
    clearInterval(autoAddRestart);
    autoAddRestart = setInterval(autoCreateCircle, autoAddTime);
  });
  
  autoAddRestart = setInterval(autoCreateCircle, autoAddTime);
}
var stopAutoCreate = false;

function autoCreateCircle() {
  var coordinates = mySmartCanvas.toWorldSpace(mySmartCanvas.centerView);
  
  var treshold = 150, newClosest = Infinity, theClosest,
      closest = Infinity, i = 1, circles = mySmartCanvas.contents, len = circles.length;
  while (i < len) {
    newClosest = Math.min(closest, coordinates.clone().sub(circles[i].position).length());
    if (closest !== newClosest) {
      closest = newClosest;
      theClosest = circles[i];
    }
    i++;
  }
  if(!(closest < treshold)) createRandomCircle1(coordinates);
  else{
    var position = theClosest.position.clone(), rotationSpd = theClosest.rotationSpd;
    mySmartCanvas.contents.splice(mySmartCanvas.contents.indexOf(theClosest), 1);
    createRandomCircle1(position, rotationSpd);
  }
}

var newCircleCooldown;

function createRandomCircle1(coordinates, rotSpd) {
  var newDataCircle = new DataCircle(randomCircleData1(6, 50));
    
  newDataCircle.position.copy(coordinates);
  
  newDataCircle.maxAge = 20;
  newDataCircle.age = 0;
  
  newDataCircle.generalOver = function(segments){
    if (newCircleCooldown) return;
    if (this.rotationSpd > 2){
      newCircleCooldown = true;
      
      var position = this.position.clone(), rotationSpd = this.rotationSpd;
      mySmartCanvas.contents.splice(mySmartCanvas.contents.indexOf(this), 1);
      createRandomCircle1(position, rotationSpd);
      setTimeout(function(){ newCircleCooldown = false; }, 1000);
    }
    else this.rotationSpd = this.rotationSpd * 4;
  };
  newDataCircle.generalClick = function(segments){
    this.rotationSpd = this.rotationSpdFloor;
    return false;
  };
  newDataCircle.step = function(dt){
    
    this.rotationSpd = Math.max(this.rotationSpd * .999, this.rotationSpdFloor);
    var diff = this.rotationSpd - this.rotationSpdFloor;
    this.scale = 1 / Math.sqrt((1 + diff));
    this.age += .01;
    if (this.age > this.maxAge) {
      //this.scale = this.scale / (  (this.age - this.maxAge) / (this.maxAge / 5)  );
      //if (this.scale < 0.01) {
        //mySmartCanvas.contents.splice(mySmartCanvas.contents.indexOf(this));
        //console.log('circle removed');
      //}
    }
  }
  //mySmartCanvas.toWorldSpace(
  //mySmartCanvas.camera.position.copy(coordinates);
  //myCam.scale = Math.random();
  
  //newDataCircle.scale = .5 + (Math.random() * 5) / 3;
  newDataCircle.rotationSpd = Math.random() * .05 + .005;
  newDataCircle.rotationSpdFloor = newDataCircle.rotationSpd;
  newDataCircle.rotationSpd = rotSpd || newDataCircle.rotationSpd;
  
  var diff = this.rotationSpd - this.rotationSpdFloor;
  this.scale = 1 / Math.sqrt((1 + diff));
  
  newDataCircle.rotation = Math.PI * 2 * Math.random();
  
  mySmartCanvas.add( newDataCircle );
  return newDataCircle;
}

window.randomCircleData1 = function randomCircleData1(amount, maxRadius, maxWidth) {
  var data = [],
      start, end, width, radius, color;
  
  while (data.length < amount) {
    start = Math.random();
    radius = (maxRadius || 300) - (Math.random() * Math.random() * (maxRadius || 300));
    end = start + Math.random() * Math.random() * ((25) / radius);
    width = Math.min(Math.random() * (maxWidth || 20), radius);
    color = {r: Math.round(Math.random() * 255), g: Math.round(Math.random() * 255), b: Math.round(Math.random() * 255) };
    
    data.push({
      start: start,
      end: end,
      radius: radius,
      width: width,
      color: {r: color.r, g: color.g, b: color.b},
      name: 'randomRing' + data.length
    });
  }
  
  return data;
}

$('#initDemo').on('click', initDemo);
