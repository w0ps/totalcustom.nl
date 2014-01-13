var debug = false;

$.fn.slidePuzzle = function(options){
	if(!this.filter('img').length){
		alert('Bad target for slidePuzzle');
		return;
	}
	
	var defaults = {
				emptySquare: [-1,-1],
				shuffle: true,
				x: 3,
				y: 3,
				speed: 250,
				onSolve: function(){alert('Congratulations!');},
				useKeys: true
			},
			options = options ? $.extend({}, defaults, options) : defaults,
			$container = $('<div>', {id: 'slidePuzzle'}),
			originalPosition = this.position()
	;
	
	if(!options.shuffleCount) options.shuffleCount = Math.pow(options.x * options.y, 3) * 2;
	
	if(this.attr('class')) $container.addClass(this.attr('class'));
	if(this.attr('id')) $container.addClass(this.attr('id'));
	
	var x = options.x,
			y = options.y,
			src = this.attr('src'),
			xUnit = this.width() / x,
			yUnit = this.height() / y,
			ratio = xUnit / yUnit,
			margin = options.margin,
			border = options.border,
			holeLocation = [
				options.emptySquare[0] !== -1 ?
					options.emptySquare[0] : x - 1,
				options.emptySquare[1] !== -1 ?
					options.emptySquare[1] : y - 1
			],
			grid = new Grid([x,y]),
			matches = x * y,
			solved = true,
			i = 0,
			j = 0,
			currentlyMoving = false,
			nextMoves = [],
			lastStamp = 0,
			moveTable = {l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1]};
	
	$container.css({
		position: 'absolute',
		left: originalPosition.left,
		top: originalPosition.top
	})
	.width(this.width()).height(this.height());
	
	//create tiles and grid
	while(i < x){
		j = 0;
		while(j < y){
			var isHole = (i == holeLocation[0] && j == holeLocation[1]),
					position = [i,j],
					background = isHole ? 'transparent' : ('url("' + src + '") ' + - ( position[0] * xUnit) + 'px ' + - ( position[1] * yUnit) + 'px'),
					$tile = $('<div>', {
				css: {
					position: 'absolute',
					background: background,
					'background-size': 100 * x + '% ' + 100 * y + '%',
					width: xUnit,
					height: yUnit,
					left: i * xUnit + 'px',
					top: j * yUnit + 'px'
				},
				'data-cgridLoc': position.join(','),
				'data-ogridLoc': position.join(',')
			})	,
					tile = {element: $tile, homeCoords: [i,j], isHole: isHole};
			
			$container.append($tile);
			grid.set(tile, i, j);
			
			if(isHole) var theHole = tile;
			j++;
		}
		i++
	}
 
  function tileClick(e){
    if(currentlyMoving){
		  var thisFn = arguments.callee;
		  nextMoves.push(function(){
			  thisFn(e);
		  });
	    return;
    }
    currentlyMoving = true;
    if(lastStamp == 0) var speed = options.speed;
    else var speed = Math.min(e.timeStamp - lastStamp, options.speed);
    lastStamp = e.timeStamp;
    
    var thisTile = $(e.target),
		    originalLocation = thisTile.attr('data-oGridLoc'),
		    currentLocation = thisTile.attr('data-cGridLoc').split(','),
		    dataTile = grid.get(currentLocation[0],currentLocation[1]),
		    move = false;
    
    if(+currentLocation[0] == holeLocation[0]){
		  if((+currentLocation[1] + 1 == holeLocation[1]) || (+currentLocation[1] - 1 == holeLocation[1])) move = true;
    }
    else if(currentLocation[1] == holeLocation[1]){
		  if((+currentLocation[0] + 1 == holeLocation[0]) || (+currentLocation[0] - 1 == holeLocation[0])) move = true;
    }
    
    if(move){
		  toPos = {left: holeLocation[0] * xUnit, top: holeLocation[1] * yUnit};
		  fromPos = {left: currentLocation[0] * xUnit, top: currentLocation[1] * yUnit};;
		  
		  if(debug) debugger;
		  if(currentLocation.join(',') == originalLocation) matches--;
		  
		  var speedMultiplier = holeLocation[0] == currentLocation[0] ? yUnit/500 : xUnit/500 //1/ratio : ratio;
			
	    dataTile.element
		    .attr('data-cGridLoc', holeLocation[0] + ',' + holeLocation[1])
			  .animate({top: toPos.top, left: toPos.left}, speed * speedMultiplier, function(){
				  if(solved) solve();
				  currentlyMoving = false;
				  if(nextMoves.length) nextMoves.splice(0,1)[0]();
	      });
      theHole.element
			  .attr('data-cGridLoc', currentLocation[0] + ',' + currentLocation[1])
			  .animate({top: fromPos.top, left: fromPos.left}, speed * speedMultiplier);
	    grid.swapCells([currentLocation[0],currentLocation[1]], [holeLocation[0], holeLocation[1]]);
	    
	    if(originalLocation == holeLocation.join(',')) matches++;
	    if(matches == x * y - 1) solved = true;
	    else solved = false;
	    
	    holeLocation = [currentLocation[0], currentLocation[1]];
	  }
	  else {
		  nextMoves = [];
		  currentlyMoving = false;
    }
  }
	
	$container.on({
    click: tileClick,
     touchstart: function(e){
       //alert('touchstart!');
     },
     touchend: function(e){
       //alert('touchend!');
     }
  });
	
	if(options.shuffle){
		matches = 0,
		solved = false;
		var tilesMoved = 0,
				lastMove = null;
		while(tilesMoved < options.shuffleCount){
			var possibleMoves = [];
			if(holeLocation[1] < y - 1) possibleMoves.push('d');
			if(holeLocation[0] > 0) possibleMoves.push('l');
			if(holeLocation[0] < x - 1) possibleMoves.push('r');
			if(holeLocation[1] > 0) possibleMoves.push('u');
			//if(holeLocation[1] < y - 1) possibleMoves.push('d');
			if(lastMove) possibleMoves.splice(possibleMoves.indexOf(lastMove),1);
			
			var nextMove =  possibleMoves[ Math.floor( random() * possibleMoves.length ) ],
					offset = moveTable[nextMove];
					tileLocation = [holeLocation[0] + offset[0], holeLocation[1] + offset[1]],
					theTile = grid.get(tileLocation[0], tileLocation[1]);
			grid.swapCells([tileLocation[0], tileLocation[1]], [holeLocation[0], holeLocation[1]]);
			
			holeLocation = tileLocation;
			lastMove = nextMove;
			
			tilesMoved++;
		}
		
		// set tiles' data-attr to current position. No need to recreate the grid though
		var i = 0;
		while(i < x){
			var j = 0;
			while(j < y){
					var currentTile = grid.get(i, j);
					if(currentTile.isHole) holeLocation = [i,j];
					else if(currentTile.element.attr('data-ogridLoc') == i + ',' + j) matches++;
					currentTile.element.css({
						left: i * xUnit + 'px',
						top: j * yUnit + 'px'
					}).attr('data-cgridLoc', i + ',' + j);
				j++;
			}
			i++;
		}
		
		if(matches == x * y - 1) solved = true;
	}
	
	$container.appendTo(this.parent());
	
	this.remove();
	
	if(options.useKeys){
		$(window).off('keyup.slidePuzzle').on('keyup.slidePuzzle', function(event){
			var dir;
			switch(event.keyCode){
				case 40: dir = 'u'; break;
				case 37: dir = 'r'; break;
				case 38: dir = 'd'; break;
				case 39: dir = 'l';
			}
			
			if(dir){
				var offset = moveTable[dir],
						targetX = +holeLocation[0] + offset[0],
						targetY = +holeLocation[1] + offset[1],
						target = grid.get.apply(grid, [targetX, targetY]);
				
				if(target) target.element.click();
			}
		});
	}
	
	function solve(){
		theHole.element.css({
			background: 'url("' + src + '") ' + - ( holeLocation[0] * xUnit) + 'px ' + - ( holeLocation[1] * yUnit) + 'px',
			'background-size': 100 * x + '% ' + 100 * y + '%'
		})
		options.onSolve();
	}
	
	if(options.onReady) options.onReady();
}

function Grid(dim, options){
	var opts = { wrap: false }
	options = $.extend({}, opts, options);
	this.base = [];
	this.dimensions = $.extend([], dim);
	var dims = $.extend([], dim),
			level = 0;
	while(dims.length){
		var currentDim = dims.splice(0,1)[0];
		if(dims.length) putInAll(this.base, currentDim);
		level++;
	}
}

function putInAll(array, amount){
	if(!array.length){
		var i = 0;
		while(i < amount){
			array.push([]);
			i++;
		}
	}
	else{
		$.each(array, function(index, object){
			putInAll(object, amount);
		});
	}
}


Grid.prototype.get = function(){
	var thisGrid = this,
			q = $.extend([],arguments),
			base = this.base,
			inRange = true;
	$.each(q, function(i, num){ if( num < 0 || num >= thisGrid.dimensions[i] ){ inRange = false; return false } });
	if(inRange){
		while(q.length){
			base = base[q.splice(0,1)[0]];
		}
		return base;
	}
	else {
		if(this.wrap){
			console.log('wrap!');
		}
		else return null;
	}
}

Grid.prototype.set = function(){
	if(arguments.length > this.dimensions.length){
		var args = $.extend([], arguments),
				data = args.splice(0,1)[0],
				lastIndex = args.pop();
		if(args.length) var base = this.get.apply(this,args);
		else var base = this.base;
		if(base !== null){
			base[lastIndex] = data;
			return data;
		}
		return;
	}
	throw('Insufficient parameters for Grid.set');
	return;
}

Grid.prototype.swapCells = function(cellA, cellB){
	var cellContentsA = this.get.apply(this, cellA),
			cellContentsB = this.get.apply(this, cellB),
			A = $.extend([], cellA);
			B = $.extend([], cellB);
	if(cellContentsA !== null && cellContentsB !== null){
		A.splice(0,0, cellContentsB);
		B.splice(0,0, cellContentsA);
		this.set.apply(this, A);
		this.set.apply(this, B);
		return true;
	}
	return false;
}