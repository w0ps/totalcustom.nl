//when making this I was not aware of css method background-size contain and cover, available in everything > IE8
$.fn.specialFit = function(opts){
	//get rid of any lingering dimensions on this object
	this.css({
		position: 'absolute',
		width: 'auto',
		height: 'auto',
		top: 0,
		left: 0
	});
	
	var options = $.extend({}, {
		useX: true,
		useY: true,
		parent: document.body,
		crop: false
	}, opts )	,
			parent =
				this.parent().length ?
					this.parent() :
						options.parent instanceof $ ?
							options.parent :
								$(options.parent),
			width = this[0].width,
			height = this[0].height,
			aspect = width / height,
			spaceH = parent.innerWidth(),
			spaceV = parent.innerHeight(),
			spaceAspect = spaceH / spaceV,
			relativeAspect = spaceAspect / aspect;
			// if landscape, aspect will be bigger than 1
	
	if(!options.restrictions){
		//scale to fit container as good as possible
		if(options.crop ? relativeAspect > 1 : relativeAspect < 1) {
			var newImageHeight = ( spaceH / width ) * height;
			this.factor = height / newImageHeight;
			this.css({
				width: spaceH,
				top: (spaceV - newImageHeight) / 2 + 'px'
			});
		}
		else {
			var newImageWidth = ( spaceV / height ) * width;
			this.factor = width / newImageWidth;
			this.css({
				height: spaceV,
				left: (spaceH - newImageWidth) / 2 + 'px'
			});
		}
	}
	
	this.aspect = aspect;
	//else restrictions: todo
	return this;
}