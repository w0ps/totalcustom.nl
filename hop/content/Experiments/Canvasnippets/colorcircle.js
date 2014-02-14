function initColorCircle(){
	var $exampleDiv = $('#colorCircle');

	window.simpleSmartCanvas = new SmartCanvas({}, $exampleDiv);
	simpleSmartCanvas.camera.rotation = -Math.PI / 2;

	var dataCircle = new DataCircle();
	simpleSmartCanvas.add(dataCircle);

	$('code#editableRing').html(JSON.stringify(DataCircle.prototype.defaultData, null, '\t'), true).on('change', function(e){
		var object = getObjectFromString($(this).html()),
				index = simpleSmartCanvas.contents.indexOf(dataCircle);
		if(object){
			$(this).css({color: 'white'});
			simpleSmartCanvas.contents.splice(index, 1);
			dataCircle = new DataCircle(object);
			simpleSmartCanvas.add(dataCircle);
		}
		else{
			$(this).css({color: 'red'});
		}
	});
}

initColorCircle();