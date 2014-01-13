//var net = new brain.NeuralNetwork();
//
//net.train([{input: [0, 0], output: [0]},
//           {input: [0, 1], output: [1]},
//           {input: [1, 0], output: [1]},
//           {input: [1, 1], output: [0]}]);
//
//var output = net.run([1, 0]);  // [0.987]

function Car(options){
  this.initialDistance = Math.random() * this.MAXDISTANCE;
  this.speed = Math.random() * this.MAXSPEED;
  this.width = Math.random() * this.MAXWIDTH;
  this.distance = this.initialDistance;
  this.length = this.width * 1.6181;
}
(function(){
  this.MAXDISTANCE = 50;
  this.MAXSPEED = 10;
  this.MAXWIDTH = 3;
  this.step = function(){
    this.distance -= this.speed;
  };
  this.draw = function(context){
    context.beginPath();
    context.rect(this.distance * 10, 0, this.length * 10, this.width * 10);
    context.fillStyle = 'rgb(0,0,0)';
    context.fill();
  }
}).call(Car.prototype);

function Person(options){
  this.distanceTravelled = 0;
  this.speed = 0;
  this.distanceFromCurb = Math.random() * this.MAXDISTANCEFROMCURB;
  this.acceleration = Math.random() * this.MAXACCELERATION;
  this.maxSpeed = Math.random() * this.MAXSPEED;
}
(function(){
  this.MAXDISTANCEFROMCURB = 5;
  this.MAXSPEED = 6;
  this.MAXACCELERATION = 2;
  this.step = function(){
    this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
    this.distanceTravelled += this.speed;
  };
  this.draw = function(context){
    context.beginPath();
    context.arc(0, this.distanceTravelled * 10, 10, 0, 2*Math.PI, true);
    context.fillStyle = 'rgb(255,0,0)';
    context.fill();
  }
}).call(Person.prototype);

//first generate training data...
function CrossScenario(){
  this.car = new Car();
  this.person = new Person();
}
CrossScenario.prototype.draw = function(){
  this.context.save();
  this.context.beginPath();
  this.context.rect(0, 0, 550, 80);
  this.context.fillStyle = 'rgba(255,255,255,0.8)';
  this.context.fill();
  this.context.translate(50, 0);
  this.person.draw(this.context);
  this.context.translate(0, this.person.distanceFromCurb * 10)
  this.car.draw(this.context);
  this.context.restore();
}
CrossScenario.prototype.canICrossSafely = function(drawSpeed, $container){
  if(drawSpeed){
    var $container = $container || $('#streetcrosser');
    this.$canvas = $('<canvas width="550" height="80">').appendTo($container);
    this.context = this.$canvas[0].getContext('2d');
    this.draw();
  }
  
  var CS = this,
      dfd = new $.Deferred();
  
  var crossed = false,
      carAtJunction = false;
  
  function simulationStep(){
    CS.person.step();
    CS.car.step();
    
    if(drawSpeed !== undefined) CS.draw(); 
    
    carAtJunction = CS.car.distance <= 0;
    crossed = CS.person.distanceTravelled >= CS.person.distanceFromCurb + CS.car.width;
    
    if(!crossed && !carAtJunction) setTimeout(simulationStep, drawSpeed || 0);
    else{
      if(drawSpeed !== undefined) CS.$canvas.remove();
      dfd.resolve(CS, crossed && !carAtJunction);
    }
  }
  simulationStep();
  return dfd;
}

function generateTrainingData(amt, spd, $container){
  var data = [],
      dfd = new $.Deferred().progress(function(scenario, result){
        var car = scenario.car,
            person = scenario.person;
        data.push({
          input: {
            carDistance: car.initialDistance / car.MAXDISTANCE,
            carSpeed: car.speed / car.MAXSPEED,
            carWidth: car.width / car.MAXWIDTH,
            personDistanceFromCurb: person.distanceFromCurb / person.MAXDISTANCEFROMCURB,
            personAcceleration: person.acceleration / person.MAXACCELERATION,
            personMaxSpeed: person.maxSpeed / person.MAXSPEED
          },
          output: {
            madeIt: result ? 1 : 0
          }
        });
        if(data.length == amt) dfd.resolve(data);
      }),
      instantiatedScenarios = 0;
  while(instantiatedScenarios < amt){
    new CrossScenario().canICrossSafely(spd, $container).then(function(scenario, result){ dfd.notify(scenario, result); });
    instantiatedScenarios++;
  }
  return dfd;
}

function CrossBrain(trainAmt, trainDelay){
  var net = new brain.NeuralNetwork(),
      dfd = new $.Deferred();
  
  generateTrainingData(trainAmt, trainDelay)
  .then(function(data){
		Parallel.require("javascripts/Experiments/brain.js");
    Parallel.spawn(
      function(dataWrapper){
        var net = new brain.NeuralNetwork();
        return {trainingResults: net.train(dataWrapper.data), netJSON: net.toJSON()};
      },
      {data: data}
    ).fetch(function(results){
      net.fromJSON(results.netJSON);
      dfd.resolve(net, results.trainingResults, data);
    });
  });
  
  return dfd;
}

function makeABrainAndTestIt(amt){
  var dfd = new $.Deferred;
  CrossBrain(amt).then(function(net, results, data){
    var correctPredictions = 0,
        tooRisky = 0,
        tooCautious = 1,
        currentPrediction,
        currentOutcome;
    for(var i in data){
      currentPrediction = Math.round(net.run(data[i].input).madeIt);
      currentOutcome = data[i].output.madeIt;
      if(currentPrediction != currentOutcome){
        if(currentOutcome) tooCautious++;
        else tooRisky++;
      }
      else correctPredictions++;
      correctPredictions += ( currentPrediction == currentOutcome) ? 1 : 0;
    }
    
    dfd.resolve('net accuracy: ' + (correctPredictions / amt) + ', tooCautious: ' + (tooCautious / amt) + ', tooRisky: ' + (tooRisky / amt ) + ', error: ' + results.error + ', iterations: ' + results.iterations);
  });
  return dfd;
}


function setUIHandlers(){

	var $trainButton = $('#trainButton').on('click', function(){
		$trainButton.hide();
		$('#showResults2').empty().append('training...');
		makeABrainAndTestIt(1000)
		.then(function(result){
			$trainButton.show();
			$('#showResults2').empty().append(result);
		});
	});
	
	var $kSimulations = $('#kSimulations').on('click', function(){
		$('#showResults').empty();
		generateTrainingData(1000, 50,$('#showScenarios'))
		.then(function(results){
			var succesful = 0;
			for(var i in results){
				succesful += results[i].output.madeIt;
			}
			$('#showResults').append('Total safe crossings: ' + succesful);
		});
	});
	
	var $oneSimulation = $('#oneSimulation').on('click', function(){
		$('#showResults').empty();
		new CrossScenario().canICrossSafely(200, $('#showScenarios'))
		.then(function(scenario, madeIt){
			$('#showResults')
			.append(
				'<ul><li>Carspeed: '
				+ scenario.car.speed.toFixed(2)
				+ '</li><li>Car size: '
				+ scenario.car.width.toFixed(2)
				+ '</li><li>Car distance: '
				+ scenario.car.initialDistance.toFixed(2)
				+ '</li><li>Pedestrian distance: '
				+ scenario.person.distanceFromCurb.toFixed(2)
				+ '</li><li>Pedestrian maxspeed: '
				+ scenario.person.maxSpeed.toFixed(2)
				+ '</li><li>Pedestrian acceleration: '
				+ scenario.person.acceleration.toFixed(2)
				+ '</li><li style=\'font-weight: bold\'>Made it to the other side: '
				+ madeIt + '</li></ul>'
			);
		});
	});
}

$(document).ready(setUIHandlers);