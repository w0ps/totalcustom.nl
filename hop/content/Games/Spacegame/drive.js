$(document).ready(function() {
	if($('#Spacegame').hasClass('overview')) return;
	
	var $spacegame = $('#spacearea');
	var winwidth = Number($spacegame.innerWidth());
	var winheight = Number($spacegame.innerHeight());
	var graph = document.createElement("canvas");
	graph.setAttribute("id", "spacecanvas");
	graph.setAttribute("width", winwidth); 
	graph.setAttribute("height", winheight);
	$spacegame.append(graph);
	var canvas = graph;
	if (typeof canvas.getContext != "undefined"){
		var context = canvas.getContext("2d");	
	}
	var bulletslimit = 1000;
	var instance;
	var trails = 1;
	var beam = 0;
	var ctx = canvas.getContext('2d');
	ctx.lineWidth="3";
	ctx.lineJoin='miter';
	ctx.save();
	var environment = 'black';
	var I = "";
	var Il = 0;
	var Id = 0;
	var who = [];
	var bullets=[];
	var scenery = [];
	var zvar = 30;
	Starfield(75);
	//console.log(scenery.length);
	var camx = winwidth/2;
	var camy = winheight/2;
	ctx.translate(camx,camy);
	
	//Rotunda = new Planet(200,200,"rgb(150,130,200)",400,"Rotunda");
	//who.push(Rotunda);
	
	//setinterval and handlers
	var spawncounter = 0;
	var spawnfreq = 200;
	setInterval(kernel,50)
	//document.onkeydown = down;
	//document.onkeyup = up;
	
	var SpaceGameKeyListener = new KL.KeyListener();
	
	
	SpaceGameKeyListener.addKeys(
		{ keyName: 'up',
			press: function(){ I.throttle = 1; },
			release: function(){ I.throttle = 0; }
		},
		{ keyName: 'left',
			press: function(){ I.steer = -.05; },
			release: function(){ I.steer = 0; }
		},
		{ keyName: 'right',
			press: function(){ I.steer = .05; },
			release: function(){ I.steer = 0; }
		},
		{ keyName: 'down',
			press: function(){ I.throttle = -1; },
			release: function(){ I.throttle = 0; }
		},
		{ keyName: 'space',
			release: function(){ I.rocketfire = 1; }
		},
		{ keyName: 'ctrl',
			press: function(){ I.shooting = 1; },
			release: function(){ I.shooting = 0; }
		},
		{ keyName: 'tilde',
			release: function(){ I.minelay = 1; }
		},
		{ keyName: 't',
			release: function(){ instance = I; I.target = getclosesttarget(); }
		},
		{ keyName: 'enter',
			release: function(){
        spawn('ik');
      }
		},
		{ keyName: 'h',
			release: function(){ alert('arrows: move around.\nctrl: shoot.\nspace: spawn homing missile.\ncaps-lock: change color.\nenter: respawn\nshift: change trails.\ntilde: drop mine\n2: spawn enemy\nt: target closest enemy'); }
		},
		{ keyName: 'capslock',
			release: function(){
				if(I.kleur=='nongreen'){
					I.kleur='nonblue';}
				else if(I.kleur=='nonred'){
					I.kleur='nongreen';}
				else if(I.kleur=='blue'){
					I.kleur='nonred';}
				else if(I.kleur=='green'){
					I.kleur='blue';}
				else if(I.kleur=='red'){
					I.kleur='green';}
				else if(I.kleur=='white'){
					I.kleur='red';}
				else if(I.kleur=='nonblue'){
					I.kleur='white';
				}
			}
		},
		{ keyName: '2',
			release: spawnRenemy
		},
		{ keyName: '1',
			release: function(){ createnew('colorchg',Math.random()*winwidth,Math.random()*winheight,newRcolor(),0,0); }
		},
		{ keyName: 'f',
			press: function(){
				if(I.orbing == 0) I.orbsize = 1;
				I.orbing = 1;
				//createnew('orb',who[0].pos[0],who[0].pos[1],who[0].kleur,who[0].rota[0],who[0].speed);
			},
			release: function(){ I.orbing = 2; }
		},
		{ keyName: 'b',
			release: function(){ beam = (beam - 1) * -1; }
		}
	);
	
	//var camz = 1;
	
	function spawn(wie){
		if(wie=='ik'){
			I = new Player(0,0,newRcolor(),(2*Math.PI)*0.75,0);
			who.push(I);
			Il = who.length-1;
			Id = 0;
		}else {otherguy = new Player(0,0,'white',0,0);
			who.push(otherguy);
		}
	}	
	
	function spawnRenemy(){

		R = Math.random()*1+1;
		R = Math.round(Math.random()*R)+1;
		switch(R){
			case 1: Renemy = new Penemy((Math.random()*1500)-750+camx,(Math.random()*1500)-750+camy,newRcolor(),0,0);break;
			case 2: Renemy = new Minelayer((Math.random()*1500)-750+camx,(Math.random()*1500)-750+camy,newRcolor(),0,0);break;
		}
		who.push(Renemy);
	}

	function Player(iks,ij,klr,rot,spd){
		this.pos = [] ;
		this.pos.push(iks,ij);
		this.speed = spd;		
		this.vector = [];
		this.efftor = [];
		this.efftor.push(0,0);
		this.rota = []
		this.rota.push(rot,0);
		this.throttle = 0;
		this.steer = 0;
		this.d = 0;
		this.shooting = 0;
		this.rocketfire = 0;
		this.minelay = 0;
		this.orbing = 0;
		this.kleur = klr;
		this.alpha = 1;
		this.size = 10;
		this.health = 150;
		this.damage = 0;
		this.weight = 25;
		this.payload = 66;
		this.friction = 0.95;
		this.power = 35;
		this.target = "";
		this.run = function(){
			fmoverotate();
			orbability();
			if(renderstart(true) == true){
				fire();
				regenerate(0.2);
				_triangle();
				//_cruiser();
				engineeffect(5);
				damageeffect();
				return true;
			}else{
				explode();
				return false;
			}
		}
	}

	function Penemy(iks,ij,klr,rot,spd){
		this.pos = [] ;
		this.pos.push(iks,ij);
		this.speed = spd;
		this.vector = [];
		this.efftor = [];
		this.efftor.push(0,0);
		this.rota = [];
		this.rota.push(rot,0);
		this.throttle = 0;
		this.steer = 0;
		this.d = 0;
		this.shooting = 0;
		this.rocketfire = 0;
		this.kleur = klr;
		this.alpha = 1;
		this.size = 10;
		this.health = 75;
		this.damage = 0;
		this.weight = 30;
		this.payload = 40;
		this.friction = 0.96;
		this.power = 20;
		this.aim = "";
		instance = this;
		this.target = getclosesttarget();
		this.retreat = false;
		this.run = function(){
			morale(0.5);
			move2target(300);
			fmoverotate();
			if(renderstart(true) == true){//if lives...
				firewhenaim();
				fire();
				_penta();
				damageeffect();
				engineeffect(4);
				regenerate(0.3);
				return true;
			}else{
				explode();
				return false;
			}
		}
	}

	function Minelayer(iks,ij,klr,rot,spd){
		this.pos = [] ;
		this.pos.push(iks,ij);
		this.speed = spd;
		this.vector = [];
		this.efftor = [];
		this.efftor.push(0,0);
		this.rota = [];
		this.rota.push(rot,0);
		this.throttle = 0;
		this.steer = 0;
		this.d = 0;
		this.shooting = 0;
		this.rocketfire = 0;
		this.kleur = klr;
		this.alpha = 1;
		this.size = 20;
		this.health = 200;
		this.damage = 0;
		this.weight = 60;
		this.friction = 0.96;
		this.power = 25;
		this.payload = 50;
		this.aim = "";
		this.waypoints = [];
		this.retreat = false;
		this.minelay = 0;
		this.timer = 10;
		this.shooting = 0;
		this.rocketfire = 0;
		this.run = function(){
			move2waypoints(true);
			fmoverotate();
			if(renderstart(true) == true){//if lives...
				a = timedaction(75)
				if(a==false){
					instance.minelay = 0;
				}else if(a==true){
					instance.minelay = 1;
				}
				fire();
				_bulky();
				damageeffect();
				engineeffect(4);
				regenerate(0.05);
				return true;
			}else{
				explode();
				return false;
			}
		}
	}
	
	function Rocket(){
		this.pos = [] ;
		this.pos.push(instance.pos[0],instance.pos[1]);
		this.speed = instance.speed+15;
		this.vector = [];
		this.efftor = [];
		this.efftor.push(0,0);
		this.rota = [];
		this.rota.push(instance.rota[0],0);
		this.throttle = 1;
		this.alpha = 1;
		this.kleur = instance.kleur;
		this.d = 0;
		this.size = 5;
		this.health = 10;
		this.damage = 0;
		this.weight = 2;
		this.friction = 0.9;
		this.power = 5;
		this.payload = 33;
		this.target = instance.target;
		this.origin = instance;
		this.retreat = false;
		this.run = function(){
			move2target(0);
			fmoverotate();
			instance.damage+=0.1;
			if(instance.distance2t<instance.size+instance.target.size+instance.speed||instance.damage>instance.health){
				instance.d = 1;
			}
			if(renderstart(true)==true){
				_arrow();
				engineeffect(2);
				return true;
			}else{
				explode();
				return false;
			}
		}
	}

	function Mine(){
		this.pos = [] ;
		this.pos.push(instance.pos[0],instance.pos[1]);
		this.speed = instance.speed;
		this.vector = [];
		this.efftor = [];
		this.efftor.push(0,0);
		this.rota = [];
		this.rota.push(instance.rota[0],0);
		this.throttle = 0;
		this.steer = 0;
		this.d = 0;
		this.kleur = instance.kleur;
		this.alpha = 1;
		this.size = 7;
		this.health = 100;
		this.damage = 0;
		this.weight = 30;
		this.power = 20;
		this.payload = 33;
		this.origin = instance;
		this.distance2h = 0;
		this.run = function(){
			fmoverotate();
			if(hit(100)!==false){
				explode();
				this.d=1;
			}
			instance.damage += 0.1;
			if(instance.damage>instance.health){
				instance.d = 1;
				explode();
				return false;
			}
			if(renderstart(true)==true){
				damageeffect();
				_mine();
				return true;
			}else{
				explode();
				return false;
			}
		}
	}

	function Bullet(rot){
		this.speed = 25;
		this.vector = []
		this.vector.push(instance.speed*Math.cos(instance.rota[0]),instance.speed*Math.sin(instance.rota[0]));
		this.pos = [];
		this.pos.push(instance.pos[0],instance.pos[1]);
		this.rota = [];
		if(rot){
			this.rota.push(rot);
		}else {
			this.rota.push(instance.rota[0]);
		}
		this.vector[0]+=this.speed*Math.cos(this.rota[0])
		this.vector[1]+=this.speed*Math.sin(this.rota[0])
		this.speed = Math.sqrt(Math.pow(this.vector[0],2)+Math.pow(this.vector[1],2));
		this.rota[0] = Math.atan(this.vector[1]/this.vector[0]);
		if(this.vector[0]>=0){
			this.rota[0] += Math.PI;
		}
		if(this.rota[0]>2*Math.PI){
			this.rota[0]-=2*Math.PI;
		}
		if(this.rota[0]<0){
			this.rota[0] += 2*Math.PI;
		}
		this.kleur = instance.kleur
		this.alpha = 1
		this.friction = 0;
		this.d = 0;
		this.health = 1;
		this.damage = 0;
		this.weight = 1;
		this.origin = instance;
		this.distance2h = 0;
		this.run = function(){
			instance.pos[0]+= instance.vector[0];
			instance.pos[1]+= instance.vector[1];
			instance.damage+=0.023;
			if(instance.damage>instance.health){
				instance.d=1;
			}
			if(renderstart() == true){
			h = hit(instance.speed/2)
				if(h!==false){
					h.damage += 3;
					hiteffect();
					if(h.damage>h.health){
						h.d=1;
					}
					instance.d = 1;
				}
				ctx.beginPath();
				ctx.moveTo(-(instance.speed),0);
				ctx.lineTo(instance.speed,0);
				ctx.closePath();
				ctx.stroke();
				return true;
			}else{
				return false;
			}
		}
	}

	function Shockwave(strength){
		this.speed = strength/2;
		this.vector = [];
		this.vector.push(instance.speed*Math.cos(instance.rota[0]),instance.speed*Math.sin(instance.rota[0]));
		this.pos = [];
		this.pos.push(instance.pos[0],instance.pos[1]);
		this.rota = [];
		this.rota.push(0);
		this.kleur = instance.kleur
		this.alpha = 1
		this.d = 0;
		this.health = strength;
		this.damage = 0;
		this.weight = 1;
		this.size = 1;
		this.origin = instance;
		this.run = function(){
			instance.pos[0]+= instance.vector[0];
			instance.pos[1]+= instance.vector[1];
			instance.vector[0]*=0.7;
			instance.vector[1]*=0.7;
			instance.damage+=0.023;
			//instance.size += 15;
			instance.size += instance.speed
			instance.damage+=1.5
			instance.speed -= 0.5;
			if(instance.damage>instance.health){
				instance.d=1;
			}
			if(renderstart() == true){
				ringhit(instance.size);
				ctx.beginPath();
				ctx.arc(0,0,instance.size,0,2*Math.PI,true);
				ctx.closePath();
				ctx.stroke();
				return true;
			}else{
				return false;
			}
		}
	}

	function Planet(iks,ij,color,grootte,naam){
		this.pos = [];
		this.pos.push(iks,ij);
		this.rota = [];
		this.rota[0] = 0;
		this.kleur = color
		this.alpha = 1
		this.d = 0;
		this.health = grootte*100;
		this.damage = 0;
		this.weight = grootte*10;
		this.size = grootte;
		this.payload = grootte;
		this.speed = 0;
		this.origin = "god";
		this.run = function(){
			if(instance.damage>instance.health){
				instance.d=1;
				explode();
				return false;
			}else{
				ctx.restore();
				ctx.save();
				ctx.fillStyle=instance.kleur;
				ctx.translate(Number(instance.pos[0]-camx+winwidth/2),Number(instance.pos[1]-camy+winheight/2));
				ctx.rotate(instance.rota[0]);
				ctx.beginPath();
				ctx.arc(0,0,instance.size,0,2*Math.PI,true);
				ctx.closePath();
				ctx.fill();
				a = gravity(true);
				//surfacehits();
				return true;
			}
		}
	}
	
	function Hitpart(rot,inherit){
		this.speed = 8;
		this.pos = [];
		this.pos.push(instance.pos[0],instance.pos[1]);
		this.vector = []
		if(inherit==true){
			this.vector.push(instance.speed*Math.cos(who[j].rota[0]),instance.speed*Math.sin(instance.rota[0]));
		}else{
			this.vector.push(0,0);
		}
		this.rota = [];
		this.rota.push(rot);
		this.vector[0]+=this.speed*Math.cos(this.rota[0])
		this.vector[1]+=this.speed*Math.sin(this.rota[0])
		this.speed = Math.sqrt(Math.pow(this.vector[0],2)+Math.pow(this.vector[1],2));
		this.rota[0] = Math.atan(this.vector[1]/this.vector[0]);
		if(this.vector[0]>=0){
			this.rota[0] += Math.PI;
		}
		if(this.rota[0]>2*Math.PI){
			this.rota[0]-=2*Math.PI;
		}
		if(this.rota[0]<0){
			this.rota[0] += 2*Math.PI;
		}
		this.kleur = who[j].kleur
		this.alpha = 1
		this.d = 0;
		this.health = 2;
		this.damage = 0;
		this.weight = 1;
		this.friction = 1;
		this.run = function(){
			instance.pos[0]+= instance.vector[0];
			instance.pos[1]+= instance.vector[1];
			instance.vector[0] *= instance.friction;
			instance.vector[1] *= instance.friction;
			instance.damage+=0.11;
			if(instance.damage>instance.health){
				instance.d=1;
			}
			if(renderstart() == true){
				ctx.beginPath();
				ctx.moveTo(-(instance.speed),0);
				ctx.lineTo(instance.speed,0);
				ctx.closePath();
				ctx.stroke();
				return true;
			}else{
				return false;
			}
		}
	}
	
	function Farstar(iks,ij,zet){
		this.x = iks;
		this.y = ij;
		this.z = zet;
		this.alpha = 1-(this.z/zvar);
	}

	function Starfield(amount){
		i = 1.5;
		while(i<zvar){
			sterretje = new Farstar((Math.random()*winwidth)-winwidth/2,(Math.random()*winheight)-winheight/2,i);
			scenery.push(sterretje);
			i+= zvar/amount;
		}
	}

	function getclosesttarget(){
		closest = [];
		for(j=0;j<who.length;j+=1){
			distance2h = Math.sqrt(Math.pow(instance.pos[0]-who[j].pos[0],2)+Math.pow(instance.pos[1] - who[j].pos[1],2));
			if(closest.length>0){
				if(who[j].size/distance2h>closest[0]&&who[j].kleur!==instance.kleur){
					closest[0] = who[j].size/distance2h;
					closest[1] = j;
				}
			}else if(who[j].kleur!==instance.kleur){
				closest[0] = who[j].size/distance2h;
				closest[1] = j;
			}
		}
		if(closest[1]!==undefined){
			return who[closest[1]];
		}else{
			return false
		}
	}
		
	function move2target(range){//moves instance to target(preffered distance)
		//ai script
		//check player location
		if(instance.target == ""||instance.target == false||instance.target.d==1){
			instance.target = getclosesttarget();
		}
		if(instance.target!==false){
			abstarx = instance.pos[0] - instance.target.pos[0];
			abstary = instance.pos[1] - instance.target.pos[1];
			
			instance.distance2t = Math.sqrt(Math.pow(abstary,2)+Math.pow(abstarx,2));
			
			if(instance.distance2t>3){	
				//relative positions establishing
				reltarx = abstarx/instance.distance2t;
				if(reltarx ==0){reltarx = 0.01;}
				reltary = abstary/instance.distance2t;
				if(reltary==0){reltary = 0.01;}
				
				//establishing rad angle from instance to target
				//and setting the desired direction (desirot) appropiately. after that keep it between 2PI and 0
				desirot = Math.atan(reltary/reltarx);
				if(reltarx>=0){
					desirot += Math.PI;
				}
				if(instance.retreat==true){
					desirot+=Math.PI;
				}
				if(desirot>2*Math.PI){
					desirot-=2*Math.PI;
				}
				if(desirot<0){
					desirot += 2*Math.PI;
				}
				instance.aim = 0;//fires only if aim is 1
				//Left-Right distinguish and angular difference
				if(instance.rota[0]<Math.PI){
					if(desirot<instance.rota[0]){
						rotie=instance.rota[0]-desirot;
					}else if (desirot<instance.rota[0]+Math.PI){
						rotie=desirot-instance.rota[0];
					}else{
						rotie=instance.rota[0]+(2*Math.PI-desirot);
					}
					if (desirot>instance.rota[0]&&desirot<(instance.rota[0]+Math.PI)){
						instance.steer= 0.05;
						
					}else {
						instance.steer = -0.05;
						if(instance.rota[0]-0.07<desirot&&instance.rota[0]+0.07>desirot){
							instance.steer = 0;
							instance.aim = 1;
						}
					}
				}else {
					if (desirot>instance.rota[0]){
						rotie=desirot-instance.rota[0];
					}else if (desirot>instance.rota[0]-Math.PI){
						rotie=instance.rota[0]-desirot;
					}else{
						rotie=(2*Math.PI-instance.rota[0])+desirot;
					}

					if(desirot>(instance.rota[0]-Math.PI)&&desirot<instance.rota[0]){
						instance.steer= -0.05;
						
					}else {
						instance.steer = 0.05;
						
						if(instance.rota[0]-0.07<desirot&&instance.rota[0]+0.07>desirot){
							instance.steer = 0;
							instance.aim = 1;
							
						}
					}
				}
				if(instance.distance2t > range && instance.retreat == false){
					instance.throttle = 1-(rotie/Math.PI);
				}else if(instance.retreat==false){
					instance.throttle = 0;
					//instance.strafe = instance.steer;
				}else{
					instance.throttle = 1-(rotie/Math.PI);
					instance.aim = 0;
				}
			}
			return true;
		}else{
			instance.aim = 0;
			return false;
		}
	}
	
	function move2waypoints(wander,neww){//moves instance to the next destination on it's waypoint list. wander = creates a random new wp when finished, neww is a method to add a new wp.
		if(instance.waypoints.length == 0&&wander == true){
			instance.waypoints.push((Math.random()*1500)-750+camx,(Math.random()*1500)-750+camy);;
		}
		
		abswpx = instance.pos[0] - instance.waypoints[0];
		abswpy = instance.pos[1] - instance.waypoints[1];
		
		instance.distance2wp = Math.sqrt(Math.pow(abswpy,2)+Math.pow(abswpx,2));
		
		if(instance.distance2wp>3){	
			//relative positions establishing
			relwpx = abswpx/instance.distance2wp;
			if(relwpx ==0){relwpx = 0.01;}
			relwpy = abswpy/instance.distance2wp;
			if(relwpy==0){relwpy = 0.01;}
			
			//establishing rad angle from instance to target
			//and setting the desired direction (desirot) appropiately. after that keep it between 2PI and 0
			desirot = Math.atan(relwpy/relwpx);
			if(relwpx>=0){
				desirot += Math.PI;
			}
			if(instance.retreat==true){
				desirot+=Math.PI;
			}
			if(desirot>2*Math.PI){
				desirot-=2*Math.PI;
			}
			if(desirot<0){
				desirot += 2*Math.PI;
			}
			//Left-Right distinguish and angular difference
			if(instance.rota[0]<Math.PI){
				if(desirot<instance.rota[0]){
					rotie=instance.rota[0]-desirot;
				}else if (desirot<instance.rota[0]+Math.PI){
					rotie=desirot-instance.rota[0];
				}else{
					rotie=instance.rota[0]+(2*Math.PI-desirot);
				}
				if (desirot>instance.rota[0]&&desirot<(instance.rota[0]+Math.PI)){
					instance.steer= 0.05;
					
				}else {
					instance.steer = -0.05;
					if(instance.rota[0]-0.07<desirot&&instance.rota[0]+0.07>desirot){
						instance.steer = 0;
						instance.aim = 1;
					}
				}
			}else {
				if (desirot>instance.rota[0]){
					rotie=desirot-instance.rota[0];
				}else if (desirot>instance.rota[0]-Math.PI){
					rotie=instance.rota[0]-desirot;
				}else{
					rotie=(2*Math.PI-instance.rota[0])+desirot;
				}

				if(desirot>(instance.rota[0]-Math.PI)&&desirot<instance.rota[0]){
					instance.steer= -0.05;
					
				}else {
					instance.steer = 0.05;
					
					if(instance.rota[0]-0.07<desirot&&instance.rota[0]+0.07>desirot){
						instance.steer = 0;
						instance.throttle = 1;
					}
				}
			}
			instance.throttle = 1-(rotie/Math.PI);
			if(instance.distance2wp<instance.size+instance.speed){
				instance.waypoints.splice(0,2);
			}
			return true;
		}else{
			return false;
		}
	}
	
	function firewhenaim(){//pulls trigger
		if(instance.aim == 1){
			instance.shooting = 1;
		}else if(instance.aim == 0){
			instance.shooting = 0;
		}
	}

	function fmoverotate(){//nonbullet physics and rudder/throttle
		//algemeen beweging
		//instance.speed = Math.sqrt(Math.pow(instance.vector[0],2)+Math.pow(instance.vector[1],2));
		if(instance.throttle!==0){
			
			//instance.speed += (instance.throttle/instance.weight)*instance.power;
			instance.speed += (instance.throttle*instance.power)/instance.weight;
			
		}
		
		if(instance.steer!==0){
			instance.rota[1]+= instance.steer;
		}
		instance.speed *= 0.95;
		instance.rota[1]*= 0.83;
		
		instance.speed = (Math.round(instance.speed*100))/100;
		
		if (instance.speed < 0.2&&instance.speed > -0.2){instance.speed = 0;}
		if(instance.rota[1] < 0.0001&&instance.rota[1]>-0.0001){instance.rota[1]=0;}
	
		instance.rota[0]+=instance.rota[1];
		
		//keep rota[0] between 2PI and 0
		if(instance.rota[0]>=2*Math.PI){instance.rota[0] -= 2*Math.PI;}
		if(instance.rota[0]<=0){instance.rota[0] += 2*Math.PI;}
		
		//voorwaartse snelheid:
		instance.vector[0] = instance.speed*Math.cos(instance.rota[0]);
		instance.vector[0] += instance.efftor[0]
		instance.pos[0]+= instance.vector[0];
		instance.vector[1] = instance.speed*Math.sin(instance.rota[0]);
		instance.vector[1] += instance.efftor[1]
		instance.pos[1]+= instance.vector[1];
	}	

	function timedaction(when){
		if(instance.timer <= 0){
			instance.timer = when;
			return true;
		}else{
			instance.timer--;
			if(instance.timer == 0){
				return false
			}
		}
	}
	
	function morale(wimp){//makes instance flee(wimp: 1= when at full hp 0.5 = at half hp etc)
		if(instance.damage>0){
			if((instance.health-instance.damage)/instance.health<wimp){
				instance.retreat = true;
			}else{
				instance.retreat = false;
			}
		} else {
			instance.retreat = false;
		}
	}
	
	function fire(){//creates bullets and rockets and mines if instance pulls triggers
		if(instance.shooting==1){			
			nb = new Bullet(instance.rota[0]);
			bullets.push(nb);
		}
		if(instance.rocketfire==1){
			if(instance.target==""||instance.target==false||instance.target.d==1){
				instance.target = getclosesttarget();
			}
			if(instance.target!==false){
				Orocket = new Rocket();
				who.push(Orocket);
				instance.rocketfire = 0;
			}else{
				instance.rocketfire = 0;
			}
		}
		if(instance.minelay == 1){
			landmine = new Mine(100);
			who.push(landmine);
			instance.minelay = 0;
		}
	}
		
	function hit(sizes){//checks if instance hits anything, returns false if not, otherwise returns hit object
		j = 0
		while(j<who.length){
			if(who[j].kleur!==instance.kleur){
				instance.distance2h = Math.sqrt(Math.pow(instance.pos[0]-who[j].pos[0],2)+Math.pow(instance.pos[1] - who[j].pos[1],2));
				if(instance.distance2h<who[j].size+sizes){
					return who[j];
				}
			}
			j+=1
		}
		return false;
	}

	function ringhit(sizes){//checks if instance hits anything, returns false if not, otherwise returns hit object
		j = 0
		while(j<who.length){
			if(who[j].kleur!==instance.kleur){
				instance.distance2h = Math.sqrt(Math.pow(instance.pos[0]-who[j].pos[0],2)+Math.pow(instance.pos[1] - who[j].pos[1],2));
				if(instance.distance2h<who[j].size+sizes){
					if(instance.distance2h>who[j].size+sizes-instance.speed){
						who[j].damage += instance.health-instance.damage;
						instance = who[j];
						hiteffect();
						if(who[j].damage>who[j].health){
						who[j].d=1;
						}
					}
				}
			}
			j+=1
		}
	}

	function explode(){//circle of bullets
		tt = Math.round((Math.random()*16)+16);
		for(t=1;t<=tt;t++){
			nb = new Bullet(Math.random()*(2*Math.PI));
			bullets.push(nb);
		}
		ns = new Shockwave(instance.payload);
		bullets.push(ns);	
	}
	
	function hiteffect(){//little hit explosion
		tt = Math.round((Math.random()*8)+8);
		t = 1;
		while(t<=tt&&bullets.length<bulletslimit){
			nb = new Hitpart(Math.random()*(2*Math.PI),true);
			bullets.push(nb);
			t +=1 ;
		}
	}
	
	function damageeffect(){//makes instance emit little explosions according to damage%
		r = Math.random()*instance.health;
		r = Math.random()*r;
		r = Math.random()*r;
		if(r>instance.health-instance.damage){
			j = i;
			hiteffect();
		}
	}
	
	function engineeffect(amount){//creates engine fire trail
		ang = instance.rota[0]+Math.PI;
		j = i;
		t = 1;
		while(t<(amount*instance.throttle)){
			ran = Math.random()*((2*Math.PI)/3)-(Math.PI/3);
			ran = Math.random()*ran;
			ran = Math.random()*ran;
			nang = ang + ran;
			if(nang>2*Math.PI){
				nang -= 2*Math.PI;
			}
			if(bullets.length<bulletslimit){
				nb = new Hitpart(nang,false);
				bullets.push(nb);
			}
			t +=1 ;
		}	
	}
	
	function regenerate(amount){//regenerates amount% per turn
		instance.damage -= amount*(instance.health/100);
		if(instance.damage<0){
			instance.damage = 0;
		}
	}
			
	function gravity(direction){
		j = 0;
		while(j<who.length){
			if(j!=i){
				absplx = instance.pos[0] - who[j].pos[0];
				absply = instance.pos[1] - who[j].pos[1];
				distance2pl = Math.sqrt(Math.pow(absply,2)+Math.pow(absplx,2));
				relplx = absplx/distance2pl;
				relply = absply/distance2pl;
				if(relplx ==0){relplx = 0.01;}
				relply = absply/distance2pl;
				if(relply==0){relply = 0.01;}
				gravrot = Math.atan(relply/relplx);
				if(relplx>=0){
					gravrot += Math.PI;
				}
				if(gravrot>2*Math.PI){
					gravrot-=2*Math.PI;
				}
				if(gravrot<0){
					gravrot += 2*Math.PI;
				}
				gravpower = instance.weight/distance2pl
				if(direction == true){
					gravpower *= -1;
				}
				gravpower*=0.01
				who[j].efftor[0]+= gravpower*Math.cos(gravrot);
				who[j].efftor[1]+= gravpower*Math.sin(gravrot);
			}
			j+=1
		}
	}

	function orbability(){
		if(instance.orbing ==2&&instance.orbsize>10){
			createnew('orb',instance.pos[0],instance.pos[1],instance.kleur,instance.rota[i],instance.speed);
			instance.orbing=0
		}
	}
	
	function renderstart(alphaoverride){
		if(instance.d==0){
			instance.alpha = alphaoverride ? 1 : (instance.health-instance.damage)/instance.health;
			ctx.restore();
			ctx.save();
			ctx.strokeStyle=definecolor(instance.kleur,instance.alpha);
			ctx.fillStyle=definecolor(instance.kleur,instance.alpha);
			ctx.translate(Number(instance.pos[0]-camx+winwidth/2),Number(instance.pos[1]-camy+winheight/2));
			ctx.rotate(instance.rota[0]);
			return true
		}else{
			return false
		}
	}
		
	function definecolor(color,alfa){
		if(color=='red'){
			return "rgba(255,"+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+alfa+")";
		}else if(color=='nonred'){
			return "rgba(0,"+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+alfa+")";
		}else if(color=='blue'){
			return "rgba("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+",255,"+alfa+")";
		}else if(color=='nonblue'){
			return "rgba("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+",0,"+alfa+")";
		}else if(color=='green'){
			return "rgba("+Math.round(Math.random()*255)+",255,"+Math.round(Math.random()*255)+","+alfa+")";
		}else if(color=='nongreen'){
			return "rgba("+Math.round(Math.random()*255)+",0,"+Math.round(Math.random()*255)+","+alfa+")";
		}else if(color=='black'){
			return "rgba(0,0,0,"+alfa+")";
		}else{
			return "rgba("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+alfa+")";
		}
	}
	
	function newRcolor(){
			klos = Math.round(Math.random()*6)
			if(klos==0){
				klos='white';
			}else if(klos==1){
				klos='red';
			}else if(klos==2){
				klos='green';
			}else if(klos==3){
				klos='blue';
			}else if(klos==4){
				klos='nonred';
			}else if(klos==5){
				klos='nongreen';
			}else if(klos==6){
				klos='nonblue';
			}
			return klos;
	}

	function _triangle(){
		ctx.beginPath();
		ctx.moveTo(-10,6);
		ctx.lineTo(10,0);
		ctx.lineTo(-10,-6);
		ctx.lineTo(-10,6);
		ctx.stroke();
		ctx.closePath();
	}
		
	function _arrow(){
		ctx.beginPath();
		ctx.moveTo(-10,0);
		ctx.lineTo(10,0);
		ctx.lineTo(7,2.5);	
		ctx.lineTo(7,-2.5);
		ctx.lineTo(10,0);
		ctx.stroke();
		ctx.closePath();
	}
	
	function _penta(){
		ctx.beginPath();
		ctx.moveTo(15,0);
		ctx.lineTo(-10,5);
		ctx.lineTo(3,-7);	
		ctx.lineTo(3,7);
		ctx.lineTo(-10,-5);
		ctx.lineTo(15,0);
		ctx.stroke();
		ctx.closePath();
	}

	function _bulky(){
		ctx.beginPath();
		ctx.moveTo(22,0);
		ctx.lineTo(13,9);
		ctx.lineTo(2,10);	
		ctx.lineTo(-2,12);
		ctx.lineTo(-12,9);
		ctx.lineTo(-12,-9);
		ctx.lineTo(-2,-12);
		ctx.lineTo(2,-10);
		ctx.lineTo(13,-9);
		ctx.lineTo(22,0);
		ctx.stroke();
		ctx.closePath();
	}

	function _cruiser(){
		ctx.beginPath();
		ctx.moveTo(55,0);
		ctx.lineTo(50,8);
		ctx.lineTo(5,15);	
		ctx.lineTo(-30,10);
		ctx.lineTo(-40,5);
		ctx.lineTo(-50,9);
		ctx.lineTo(-47,0);
		ctx.lineTo(-50,-9);
		ctx.lineTo(-40,-5);
		ctx.lineTo(-30,-10);
		ctx.lineTo(5,-15);
		ctx.lineTo(50,-8);
		ctx.lineTo(55,0);
		ctx.stroke();
		ctx.closePath();
	}
	
	function _mine(){
		ctx.beginPath();
		ctx.arc(0,0,5,0,2*Math.PI,true);
		ctx.moveTo(5,0);
		ctx.lineTo(9,0);
		ctx.moveTo(-5,0);
		ctx.lineTo(-9,0);
		ctx.moveTo(0,5);
		ctx.lineTo(0,9);
		ctx.moveTo(0,-5);
		ctx.lineTo(0,-9);
		ctx.closePath();
		ctx.stroke();
	}

	function _target(){
		ctx.beginPath();
		ctx.moveTo(-10,6);
		ctx.lineTo(-10,10);
		ctx.lineTo(-6,10);
		ctx.moveTo(10,6);
		ctx.lineTo(10,10);
		ctx.lineTo(6,10);
		ctx.moveTo(-10,-6);
		ctx.lineTo(-10,-10);
		ctx.lineTo(-6,-10);
		ctx.moveTo(10,-6);
		ctx.lineTo(10,-10);
		ctx.lineTo(6,-10);
		ctx.stroke();
		ctx.closePath();
	}
	
	function _phealthbar(){
		if(who.length>0&&I.d!==1){
			ctx.restore()
			ctx.save();
			ctx.strokeStyle=definecolor(I.kleur,1);
			ctx.lineWidth="15"
			ctx.beginPath();
			ctx.moveTo(8,winheight);
			ctx.lineTo(8,winheight-((I.health-I.damage)/I.health)*winheight);
			ctx.closePath();
			ctx.stroke();
			ctx.restore();
		}
	}	
	
	function _thealthbar(){
		if(who.length>0&&I.d==0&&I.target!==""&&I.target!==false&&I.target.d==0){
			ctx.restore()
			ctx.save();
			ctx.strokeStyle=definecolor(I.target.kleur,1);
			ctx.lineWidth="15"
			ctx.beginPath();
			ctx.moveTo(winwidth-8,winheight);
			ctx.lineTo(winwidth-8,winheight-((I.target.health-I.target.damage)/I.target.health)*winheight)
			ctx.closePath()
			ctx.stroke();
			ctx.restore();
			ctx.save();
			
			abstarx = I.target.pos[0] - I.pos[0];
			abstary = I.target.pos[1] - I.pos[1];
			
			distance2t = Math.sqrt(Math.pow(abstary,2)+Math.pow(abstarx,2));
			
			// reltarx = abstarx/distance2t;
			// reltary = abstary/distance2t;

			// if(reltarx ==0){reltarx = 0.01;}
			// reltary = abstary/distance2t;
			// if(reltary==0){reltary = 0.01;}
			trot = Math.atan(abstary/abstarx);
			if(abstarx<=0){
				trot += Math.PI;
			}
			if(trot>2*Math.PI){
				trot-=2*Math.PI;
			}
			if(trot<0){
				trot += 2*Math.PI;
			}
			
			ctx.fillStyle=definecolor(I.target.kleur,1);
			ctx.translate(Number(I.pos[0]-camx+winwidth/2),Number(I.pos[1]-camy+winheight/2));
			ctx.rotate(trot);
			_pointer()
			ctx.restore();
			ctx.save()
		}
	}	
	
	function _pointer(){
		ctx.beginPath();
		ctx.moveTo(23,7);
		ctx.lineTo(40,0);
		ctx.lineTo(23,-7);
		ctx.closePath();
		ctx.fill();
	}
	
	function kernel(){
		//TRAILS
		if(I!==''&&Id==0){
			camx = I.pos[0]+(I.speed*8*Math.cos(I.rota[0]));
			camy = I.pos[1]+(I.speed*8*Math.sin(I.rota[0]));
			trails = 1-(I.damage/I.health);
		}else if(who.length>0){
			camx = who[0].pos[0]+(I.speed*8*Math.cos(I.rota[0]));
			camy = who[0].pos[1]+(I.speed*8*Math.sin(I.rota[0]));
		}else{
			trails = 1;
		}
		ctx.restore();
		
		ctx.fillStyle = definecolor(environment,trails);
		ctx.fillRect(0,0,winwidth,winheight)
		//\TRAILS
		spawncounter++;
		if(spawncounter == spawnfreq){
			spawncounter = 0;
			spawnRenemy();
		}
		//MAIN WHO LOOP
		
		_phealthbar();
		_thealthbar();
		
		if(scenery.length>0){
			i = 0;
			while(i<scenery.length){
				ctx.restore();
				ctx.save();
				ctx.translate(Number(scenery[i].x-(camx/scenery[i].z)+winwidth/2),Number(scenery[i].y-(camy/scenery[i].z)+winheight/2));
				ctx.fillStyle = "rgba(255,255,255,"+scenery[i].alpha+")";
				ctx.beginPath();
				ctx.arc(0,0,4/scenery[i].z,0,2*Math.PI,true);
				ctx.closePath();
				ctx.fill();
				i+=1;
			}
		}
		// ctx.restore();
		// ctx.save();
		
		if(who.length>0){
			i = 0;
			while(i<who.length){
				instance = who[i];
				if(I.target == instance&&I.d!==1){
						ctx.restore();
						ctx.save();
						ctx.translate(Number(instance.pos[0]-camx+winwidth/2),Number(instance.pos[1]-camy+winheight/2));
						ctx.strokeStyle = "rgb(255,255,255)";
						_target();
					}
				a = instance.run();
				
				if (a==false){
					who.splice(i,1);
					i-=1;
				}
				i+=1;
			}
		}
		//bullet loop
		
		if(bullets.length>0){
			i = 0;
			while(i<bullets.length){
				instance = bullets[i];
				a = instance.run()
				if (a==false){
					bullets.splice(i,1);
					i-=1;
				}
				i+=1;
			}
		}
		
	}	
});