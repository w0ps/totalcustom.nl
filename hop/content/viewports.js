(function(){
  var Viewport = Class.extend({
    init: function(options){
	  for(var i in options) this[i] = options[i];
	  this.inview = [];
	},
	relativeSize: 1,
	space: new Generics.Rect2D({x:-1, y:-1},{x:1, y:1}),
	parentElement: document.body,
	draw: function(object){
	  if(object instanceof HTMLElement){
	    
	  }
	}
  });
});