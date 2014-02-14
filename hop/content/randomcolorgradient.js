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

$(document.body).css({background: 'linear-gradient(to right, ' + colorBufferToString(randomColorBufferA({colors: [[0,0,0],[1,0,0],[0,1,0],[0,0,1],[1,1,1]]})) + ')'});
