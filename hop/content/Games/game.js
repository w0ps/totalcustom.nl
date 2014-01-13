var Phase = Class.extend({
  init: function Phase(props){
    console.log("phase created");  
  },
  fail: function fail(cause) {
    for (var i in this.failureFuncs) {
      this.failureFuncs[i](cause);
    }
  },
  succeed: function succees(cause){
    for (var i in this.failureFuncs) {
      this.succesFuncs[i](cause);
    }
  },
  failure: function failure(fun){
    this.failureFuncs.push(fun);
  },
  succeed: function succeed(fun) {
    this.succesFuncs.push(fun);
  }
});

var Game = Class.extend({
  init: function() {
    this.entities = [];
    this.agents = [];
    
    this.preparation = (new Phase.extend({
      init: function(){
        if (this.constructor.prototype.display) this.display();
      }
    }) ) ();
  },
  start: function(){
    if (!this.running) {
      console.log('starting game');
      if(!this.prepared) this.prepare(this.start);
      else{
        this.running = true;
        this.lastT = new Date().getTime();
        this.stepper();
      }
    }
    else console.log('already running');
  },
  stop: function(){
    this.running = false;
  },
  granularity: 50,
  step: function(dt){
    
  },
  stepper: function(){
    if(!this.running) return;
    var nT = new Date().getTime(),
	dt = nT - this.lastT;
    this.lastT = nT;
    this.step(dt);
    
    var game = this;
    setTimeout(function(){ game.stepper.call(game); }, this.granularity - (nT - new Date().getTime()) );
  },
  prepare: function(callback){
    console.log('preparing game');
    this.startTime = new Date().getTime();
    this.prepared = true;
    if(callback) callback.call(this);
  }
});
