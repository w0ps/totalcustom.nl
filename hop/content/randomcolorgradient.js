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

function combineBuffers(buffer1, buffer2, ratio, bufferNew){
	if(buffer1.length !== buffer2.length) return 'buffer mismatch';
	ratio = ratio !== undefined ? ratio : .5;
	var newBuffer = bufferNew || [],
		invRatio = 1 - ratio,
		item1, item2;
	
	for(var i in buffer1){
		item1 = buffer1[i];
		item2 = buffer2[i];

		newBuffer[i] = {
			t: item1.t * invRatio + item2.t * ratio,
			color: [
				item1.color[0] * invRatio + item2.color[0] * ratio,
				item1.color[1] * invRatio + item2.color[1] * ratio,
				item1.color[2] * invRatio + item2.color[2] * ratio
			]
		};
	}
	
	return newBuffer;
}

function bufferToRGB(buffer){
	var newBuffer = [],
		item, color, colorScaled;

	for(var i in buffer){
		item = buffer[i];
		color = item.color;
		colorScaled = [
			Math.floor(color[0] * 256),
			Math.floor(color[1] * 256),
			Math.floor(color[2] * 256)
		];
		newBuffer.push({t: item.t, color: ryb2rgb(colorScaled)});
	}

	return newBuffer;
}

function colorBufferToString(buffer){
	var parts = [],
		workBuffer = buffer.slice(),
		item, color;
	while(workBuffer.length){
		item = workBuffer.shift();
		color = item.color;
		
		parts.push('rgb(' + Math.floor(color[0]) + ',' + Math.floor(color[1]) + ',' + Math.floor(color[2]) + ') ' + (item.t * 100) + '%');
	}

	return parts.join(', ');
}

var gradientColors = [[0,0,0],[1,0,0],[0,1,0],[0,0,1],[1,1,0],[1,0,1],[0,1,1]];

function getNiceColorRGB(colors){
	var colorRYB = combineColorsRandomly(colors || gradientColors);
	colorRYB[0] = Math.floor(colorRYB[0] * 256);
	colorRYB[1] = Math.floor(colorRYB[1] * 256);
	colorRYB[2] = Math.floor(colorRYB[2] * 256);
	return ryb2rgb(colorRYB);
}

function slowlyChangingBackgroundGradient(options){
	var n = options.n || 50,
		workBuffer = [],
		buffers = [],
		colors = window.gradientColors,
		t = 0;

	buffers.push(
		bufferToRGB(randomColorBufferA({n: n, colors: colors})),
		bufferToRGB(randomColorBufferA({n: n, colors: colors}))
	);

	function step(){
		if(window['noGradientAnimation']) return;
		$(document.body).css({
			background: 'linear-gradient(to right, ' + colorBufferToString(
				combineBuffers(buffers[0], buffers[1], (Math.cos(t) / -2 + .5), workBuffer)
			) + ')'
		});
		
		t += .02;
		if(t >= Math.PI){
			t -= Math.PI;
			buffers.shift();
			buffers.push(bufferToRGB(randomColorBufferA({n: n, colors: colors})));
		}
		setTimeout(step, 50);
	}

	setTimeout(step, 50);
}

$(document).ready(function(){
	//slowlyChangingBackgroundGradient({n: 50});
});

