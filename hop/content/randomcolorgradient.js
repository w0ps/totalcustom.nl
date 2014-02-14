function randomColorBufferA(options){
	options = options || {};
	var n = options.n || 100,
		colors = options.colors || [[0, 0, 0], [1, 1, 1]],
		buffer = [],
		startEndColor;

	while(buffer.length < n){
		buffer.push({
			t: Math.random(),
			color: combineColorsRandomly(colors)
		});
	}

	buffer.sort(function(a,b){
		return a.t - b.t;
	});

	startEndColor = combineColorsRandomly(colors);

	buffer.unshift({t: 0, color: startEndColor});
	buffer.push({t: 1, color: startEndColor});
	
	return buffer;
}

function combineColorsRandomly(passedColors){
	var ratioLeft = 1,
		colors = passedColors.slice(),
		newColor = [0, 0, 0],
		currentColor,
		currentRatio;

	while(colors.length){
		currentRatio = colors.length > 1 ? Math.random() * ratioLeft : ratioLeft; //pick a random ratio that's not too high, but can be.
		currentColor = colors.splice(Math.floor(Math.random() * colors.length), 1)[0]; //pick a random color
		
		newColor[0] += currentRatio * currentColor[0];
		newColor[1] += currentRatio * currentColor[1];
		newColor[2] += currentRatio * currentColor[2];

		ratioLeft -= currentRatio;
	}

	return newColor;
}

function combineBuffers(buffer1, buffer2, ratio){
	if(buffer1.length !== buffer2.length) return 'buffer mismatch';
	ratio = ratio !== undefined ? ratio : .5;
	var newBuffer = [],
		invRatio = 1 - ratio,
		item1, item2;
	
	for(var i in buffer1){
		item1 = buffer1[i];
		item2 = buffer2[i];

		newBuffer.push({
			t: item1.t * invRatio + item2.t * ratio,
			color: [
				item1.color[0] * invRatio + item2.color[0] * ratio,
				item1.color[1] * invRatio + item2.color[1] * ratio,
				item1.color[2] * invRatio + item2.color[2] * ratio
			]
		});
	}

	return newBuffer;
}

function colorBufferToString(buffer){
	var string = '',
		workBuffer = buffer.slice(),
		item, color, colorRybbed;
	while(workBuffer.length){
		item = workBuffer.shift();
		color = [
			Math.floor(item.color[0] * 256),
			Math.floor(item.color[1] * 256),
			Math.floor(item.color[2] * 256)
		];
		colorRybbed = ryb2rgb(color);
		string += 'rgb(' + colorRybbed[0] + ',' + colorRybbed[1] + ',' + colorRybbed[2] + ') ' + (item.t * 100) + '%';
		if(workBuffer.length) string += ', ';
	}

	return string;
}

function slowlyChangingBackgroundGradient(options){
	var buffers = [],
		colors = [[0,0,0],[1,0,0],[0,1,0],[0,0,1]],
		t = 0;

	buffers.push(
		randomColorBufferA({n: 50, colors: colors}),
		randomColorBufferA({n: 50, colors: colors})
	);
	setInterval(function(){
		if(window['noGradientAnimation']) return;
		$(document.body).css({
			background: 'linear-gradient(to right, ' + colorBufferToString(
				combineBuffers(buffers[0], buffers[1], (Math.cos(t) / -2 + .5))
			) + ')'
		});
		
		t += .02;
		if(t >= Math.PI){
			t -= Math.PI;
			buffers.shift();
			buffers.push(randomColorBufferA({n: 50, colors: colors}));
		}
	}, 50);
}

slowlyChangingBackgroundGradient();

