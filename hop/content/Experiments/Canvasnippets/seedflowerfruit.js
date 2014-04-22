(function(){
	/*
		options/defaults: {
			position:{x: 0, y: 0},
			radius: 100,
			color: 'black',
			width: 2
		}
	*/
	function Circle(options){
		options = options || {};
		
		this.position = options.position ? new THREE.Vector2(options.position.x, options.position.y) : new THREE.Vector2;
		this.radius = options.radius || 100;
		if(options.color) this.color = new THREE.Color(options.color);
		if(options.color) this.width = options.width;
		if(options.fill) this.fill = new THREE.Color(options.fill);
	}
	(function(){
		this.draw = function drawDataCircle(context){
			var position = this.position,
					tau = 2 * Math.PI;

			context.beginPath();
			context.arc(position.x, position.y, this.radius, 0, tau);
			if(this.color) context.strokeStyle = this.color.getStyle();
			if(this.width) context.lineWidth = seg.width;
			if(this.fill){
				context.fillStyle = this.fill;
				context.fill();
			}
			if(!this.noStroke) context.stroke();
		};
		this.getIntersections = function(object){
			var intersections = [],
					relativeVector,
					distance,
					angle;

			if(object instanceof Circle){
				relativeVector = this.position.clone().sub(object.position);
				distance = relativeVector.length();

				var biggerRadius = Math.max(this.radius, object.radius),
						smallerRadius = Math.min(this.radius, object.radius);

				if(distance >  this.radius + object.radius ) return; //further than both radii
				if(distance < biggerRadius - smallerRadius ) return; //big circle fully encloses smaller one
				if(distance == this.radius + object.radius ) {
					return [this.position.clone().add( relativeVector.multiplyScalar(biggerRadius / smallerRadius) )];
				}

				var centerCenterAngle = Math.atan2(relativeVector.y, relativeVector.x),
						cornerAngle = Math.acos( (Math.pow(this.radius,2) + Math.pow(distance, 2) - Math.pow(object.radius, 2) ) / (2 * this.radius * distance) );
					
				intersections.push(
					this.position.clone().sub( new THREE.Vector2(
						Math.cos(centerCenterAngle + cornerAngle) * this.radius,
						Math.sin(centerCenterAngle + cornerAngle) * this.radius
					) ),
					this.position.clone().sub( new THREE.Vector2(
						Math.cos(centerCenterAngle - cornerAngle) * this.radius,
						Math.sin(centerCenterAngle - cornerAngle) * this.radius
           ) )
				);

				return intersections;
			}
		};
	}).call(Circle.prototype);
	
	function SFF(options){
		options = options || {};
		
		this.position = new THREE.Vector2(options.position);
		this.color = new THREE.Color(options.color || 'black');
		this.radii = options.radii || 100;
		this.n = options.n || 7;
		this.circles = [];
		this.intersections = [];
		this.startAngle = options.startAngle || 0;
		this.treshold = 1e-3 / this.radii, //necessary because .1 + .2 != .3
		this.drawIntersections = options.drawIntersections;
		this.generate();
	}
	(function(){
		this.generate = function(){
			var circles = this.circles;
			while(circles.length < this.n){
				this.addCircle();
			}
		};
		this.addCircle = function(){
			var cursor,
					treshold = this.treshold,
					intersections = this.intersections,
					circles = this.circles,
					newIntersections = [],
					position = this.position,
					newCircle, circle;
			
			if(intersections.length) {
				cursor = intersections[0];
				intersections[0].used = true;
			}
			else if(circles.length == 1){
				cursor = new THREE.Vector2;
				cursor.x = Math.sin(this.startAngle || 0) * this.radii;
				cursor.y = Math.cos(this.startAngle || 0) * this.radii;
			}
			else cursor = this.position.clone();

			newCircle = new Circle({ position: cursor.clone(), color: this.getColor(), radius: this.radii });
			//newCircle.draw(sffCanvas.context);
			
			if(circles.length){

				//get all circle intersections
				$.each(circles, function(i, circle){
					newIntersections.push.apply( newIntersections, newCircle.getIntersections(circle) || []);
				});
						
				//add if not on existing intersection
				$.each(newIntersections, function(i, newIntersection){
					var closest = Infinity;
							
					$.each(intersections, function(i, intersection){
						closest = Math.min(closest, intersection.clone().sub( newIntersection ).length() );
					});

					if(closest < treshold) return;
								
					intersections.push(newIntersection);

					if(circles.length == 2){
						$.each(circles, function(i, circle){
							if(circle.position.clone().sub( newIntersection ).length() < treshold){
								newIntersection.used = true;
							}
						});
					}

				});

				intersections.sort(function(a,b){
					if(a.used) return 1;
					if(b.used) return -1;
					return position.clone().sub(a).length() - position.clone().sub(b).length();
				});

			}

			circles.push(newCircle);
		};
		this.getColor = function(){
			return this.color;
		};
		this.draw = function(context){
			var circles = this.circles,
					tau = 2 * Math.PI,
					len = this.circles.length,
					i = 0;
			
			while(i < len){
				circles[i].draw(context);

				i++;
			}

			if(this.drawIntersections){
				var intersections = this.intersections,
				intersection,
				len = intersections.length;
				i = 0;

				while(i < len){
					intersection = intersections[i];
					context.beginPath();
					context.arc(intersection.x, intersection.y, 50, 0, tau);
					context.stroke();
					i++
				}
			}
		}
	}).call(SFF.prototype);

	window.SFF = SFF;
	function createSFFExample(){
		var sffCanvas = new SmartCanvas({}, $('#sff'));
		$('#sff').parent().css('height', '300px');		
		//sffCanvas.camera.rotation = -Math.PI / 2;
		sffCanvas.camera.scale = .6;
		sffCanvas.context.strokeStyle = 'red';
		window.sffCanvas = sffCanvas;

		var mySFF = new SFF({startAngle: Math.random() * Math.PI, n: 37, radii: 55, color: 'white' });
		sffCanvas.add(mySFF);
		window.mySFF = mySFF;
		
		lastT = new Date().getTime();
		(function(){
			var t = new Date().getTime(),
					dt = t - lastT;
			lastT = t;

			sffCanvas.camera.rotation += dt * 1e-4;
			sffCanvas.draw();

			if(sffCanvas.camera.rotation < (2*Math.PI) ) setTimeout(arguments.callee);
		})();
		
	}

	createSFFExample();
})();
