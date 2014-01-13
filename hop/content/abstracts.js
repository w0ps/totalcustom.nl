function assign(){
  for(var i in arguments){
    var pair = arguments[i];
    for(var p in pair.props) (pair.scope || this)[p] = pair.props[p];
  }
}

var Color = Class.extend({
  init: function(r,g,b,a){
    this.r = r || 0;
    this.g = g || 0;
    this.b = b || 0;
    this.a = a || 1;
  },
  toArray: function(){ return [this.r, this.g, this.b, this.a]; },
  toString: function(){ return 'rgba(' + [this.r, this.g, this.b, this.a].join(',') + ')'; },
  invert: function(){ return new Color(255 - this.r, 255 - this.g, 255 - this.b, 1); },
  clone: function(){ return new Color(this.r, this.g, this.b, this.a); },
  randomize: function(){ return new Color(Math.floor(Math.random() * 256 ),Math.floor(Math.random() * 256 ),Math.floor(Math.random() * 256 )); },
  averageWith: function(colors){
		if(colors instanceof Color) colors = [colors];
		var newColor = this.clone(), length = colors.length + 1,
				i = ['r', 'g', 'b', 'a'],  index, cIndex
		for(cIndex in colors){ for(index in i){ newColor[i[index]] = colors[cIndex][i[index]]; } }
		for(index in i){ newColor[i[index]] = Math.floor( newColor[i[index]] / length ); }
		return newColor;
	}
});


$('body').on('focus', '[contenteditable]', function() {
	var $this = $(this);
  $this.data('before', $this.html());
	return $this;
}).on('blur keyup paste input', '[contenteditable]', function() {
	var $this = $(this);
	if ($this.data('before') !== $this.html()) {
		$this.data('before', $this.html());
		$this.trigger('change');
	}
	return $this;
});

function getObjectFromString(string){
	string = string.split('<br>').join('');

	var object;
	try{
		eval("object = " + string);
	}
	catch(e){
		console.log(e);
		return false;
	}
	return object;
}
