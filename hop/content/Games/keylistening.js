(function(){
  var keyListeners = [],
      listening = true,
      setKey,
      lastpressed,
      keyCodes = [],
      keyNames = [];
  
  function KeyListener(name, settings){
    this.name = name || 'a KeyListener';
    
    if(!settings) settings = {};
    this.enabled = settings.enabled || true;
    this.logging = settings.logging || true;
    
    this.keys = {};
    this.pressedKeys = {};
    
    keyListeners.push(this);
  }
  
  function Key(keyInfo){
    this.description = keyInfo.description || null;
    
    if(keyInfo.keyCode){
      this.keyCode = keyInfo.keyCode;
      this.keyName = keyNames[this.keyCode];
    }
    else if(keyInfo.keyName){
      this.keyName = keyInfo.keyName;
      this.keyCode = keyCodes[this.keyName];
    }
    
    this.pressed = false;
    this.pressHandlers = [];
    this.whilePressedHandlers = [];
    this.releaseHandlers = [];
    this.timeOuts = [];
    this.propagate = keyInfo.propagate;
    if(keyInfo.press) this.pressHandlers.push(keyInfo.press);
    if(keyInfo.release) this.releaseHandlers.push(keyInfo.release);
    if(keyInfo.whilePressed) this.whilePressedHandlers.push(
      typeof keyInfo.whilePressed == 'function' ?
        {run: keyInfo.whilePressed, interval: 1000 } :
        {run: keyInfo.whilePressed.run, interval: keyInfo.whilePressed.interval }
    )
  }
  
  assign(
    { scope: KeyListener.prototype,
      props: {
        addKeys: function addKeys(){
          var newKeys = [];
          for(var i in arguments){
            var key = arguments[i],
                newKey = key instanceof Key ? key : new Key(key);
            
            if(newKey.keyCode){
              this.keys[newKey.keyCode] = newKey;
            }
            else {
              listening = false;
              setKey = function(keyCode){
                newKey.keyCode = keyCode;
              };
            }
            newKey.listener = this;
            
            newKeys.push(newKey);
          }
          return newKeys.length == 1 ? newKeys[0] : newKeys.slice();
        },
        addKey: function(key){ return this.addKeys(key); },
        remove: function removeListener(){
          for(var i in this.pressedKeys){
            this.pressedKeys[i].pressed = false;
          }
          keyListeners.splice(keyListeners.indexOf(this),1);
        },
        press: function(event){
          if(this.enabled && this.keys[event.keyCode]) this.keys[event.keyCode].press(event);
        },
        release: function(event){
          if(this.enabled && this.keys[event.keyCode]) this.keys[event.keyCode].release(event);
        }
      }
    },
    { scope: Key.prototype,
      props: {
        press: function keyPress(event){
          if(this.pressed == false){
            var key = this;
            this.listener.pressedKeys[this.keyCode] = this;
            this.pressed = true;
            
            for(var i in this.pressHandlers) this.pressHandlers[i](event);
            
            for(var i in this.whilePressedHandlers){
              (function(handler){
                var index = key.timeOuts.length;
                key.timeOuts.push(setTimeout(function() {
                   handler.run();
                   if (key.pressed) key.timeOuts[index] = setTimeout(arguments.callee, handler.interval);
                }, handler.interval));
              })(this.whilePressedHandlers[i]);
            }
          }
          
          if(!this.propagate) event.stopPropagation();
          if(!this.allowDefault) event.preventDefault();
        },
        release: function release(event){
          this.pressed = false;
          for(var i in this.timeOuts) clearTimeout(this.timeOuts[i]);
          this.timeOuts = [];
          for(var i in this.releaseHandlers) this.releaseHandlers[i](event);
          
          if(!this.propagate) event.stopPropagation();
          if(!this.allowDefault) event.preventDefault();
        },
        setCode: function(keyCode){
          delete this.listener.keys[this.keyCode];
          this.keyCode = keyCode;
          this.keyName = keyNames[keyCode];
          this.listener.keys[this.keyCode] = this;
        },
        setName: function(keyName){
          if(keyCodes[keyName]){
            delete this.listener.keys[this.keyCode];
            this.keyCode = keyCodes[keyName];
            this.keyName = keyName;
            this.listener.keys[this.keyCode] = this;
          }
        }
      }
    }
  )
  
  function getKeyCode(keyname){
    if(typeof keyname === 'string' && keyCodes[keyname]) return keyCodes[keyname];
    else throw('specified key not found: ' + keyname);
  }
  function getKeyName(keycode){
    if(keyNames[keycode])return keyNames[keycode];
    else throw('specified key not named: ' + keycode);
  };
  
  var supportsAddEventListener = !!document.addEventListener
  
  document.body[supportsAddEventListener ? 'addEventListener' : 'attachEvent'](supportsAddEventListener ? 'keydown' : 'onkeydown', function(event){
    if(listening){
      for(var i in keyListeners) keyListeners[i].press(event);
    }
  }, false);
  document.body[supportsAddEventListener ? 'addEventListener' : 'attachEvent'](supportsAddEventListener ? 'keyup' : 'onkeyup', function(event){
    var keyCode = event.keyCode;
    if(listening) for(var i in keyListeners) keyListeners[i].release(event);
    else if(setKey){
      setKey(event.keyCode);
      listening = true;
      setKey = null;
    }
  }, false);
  
  
  (function declareKeys(names){
    //declare irregular keycodes
    for(var i in names){
      if(names[i][1].pop){ //is an array
        var set = names[i][1],
            start = names[i][0],
            end = set.length + start;
        for(var j = start; j < end; j++){
          keyNames[j] = set[j - start];
        }
      }
      else keyNames[names[i][0]] = names[i][1];
    }
    
    //add nums
    for(var i = 48; i < 59; i++){
      keyNames[i] = '' + (i - 48);
    }
    //add alphabet
    var alphas = 'abcdefghijklmnopqrstuvwxyz';
    for(var i = 65; i < 91; i++){
      keyNames[i] = alphas[i - 65];
    }
    //numkeys
    for(var i = 96; i < 106; i++){
      keyNames[i] = 'num' + (i - 96);
    }
    //fkeys
    for(var i = 112; i < 127; i++){
      keyNames[i] = 'f' + (i - 111);
    }
    
    //declare keynames
    for(var i in keyNames){
      keyCodes[keyNames[i]] = i;
    }
  })([
    [ 8,['backspace','tab']],
    [13, 'enter'],
    [16,['shift','ctrl','alt','pause','capslock']],
    [27, 'esc'],
    [32,['space','pageup','pagedn','end','home','left','up','right','down']],
    [44,['prtscrn','insert','delete']],
    [59,'semicolon'],
    [91,['windowsl','windowsr','select']],
    [106,['multiply','add','subtract','decimalpoint','divide']],
    [120,'backslash'],
    [129,'tilde'],
    [144,['numlock','scrollock','semi-colon']],
    [187,['equal','comma','dash','period','forwardslash']],
    [219,['openbracket','closebracket','singlequote']]
  ]);
  
  window.KL = {Key: Key, KeyListener: KeyListener, getKeyCode: getKeyCode, getKeyName: getKeyName};
  window.keyNames = keyNames;
  window.keyCodes = keyCodes;
})();