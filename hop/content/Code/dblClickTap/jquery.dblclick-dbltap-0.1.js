(function($){
	$(document).on({click: clickHandler, touchEnd: clickHandler});
	
	var timeout = 500, margin = 100, minMargin = 100, arrayLimit = 20,
			lastClickedElement, lastClickedTime, delayedHandle,
			dblClickTimes = [];
	
	function clickHandler(e){
		var curTime = new Date().getTime();
		if(lastClickedElement && lastClickedElement == e.srcElement){
			clearTimeout(delayedHandle);
			$(e.srcElement).trigger('dblClickTap', e);
			timeout = getNewTimeout(curTime - lastClickedTime);
			lastClickedElement = undefined;
		}
		else{
			lastClickedElement = e.srcElement;
			lastClickedTime = curTime;
			delayedHandle = setTimeout(function(){
				$(e.srcElement).trigger('clickTap', e);
				lastClickedElement = undefined;
			}, timeout);
		}
	}
	
	function getNewTimeout(time){
		dblClickTimes.push(time);
		if(dblClickTimes.length > arrayLimit) dblClickTimes.shift();
		
		var sum = 0,
				i = 0,
				len = dblClickTimes.length,
				low = Infinity,
				high = -Infinity,
				n,
				avg;
		
		while(i < len){
			n = dblClickTimes[i];
			sum += n;
			low = Math.min(low, n);
			high = Math.max(high, n);
			i++;
		}
		avg = sum / len;
		
		margin = len > 1 ? Math.max(high - low, minMargin) : margin;
		
		return avg + margin;
	}
	
})(jQuery);