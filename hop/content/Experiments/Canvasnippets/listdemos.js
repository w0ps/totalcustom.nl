function initMiniCircular(){
	var miniCircularCanvas = new SmartCanvas({}, $('#miniCircular')),
			miniCircle = new DataCircle(randomCircleData1(100, 75, 75));
  miniCircularCanvas.add(miniCircle);
}

function initMiniSeed(){
	var miniSeedCanvas = new SmartCanvas({ backgroundColor: 'black' }, $('#miniSeed')),
			seed = new SFF({n:7, radii: 50, color: {r: 1, g: 1, b:1 } });
	miniSeedCanvas.add(seed);
}

initMiniCircular();
initMiniSeed();