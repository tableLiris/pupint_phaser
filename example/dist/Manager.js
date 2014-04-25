/**
 * Manager
 * Définition du manager
 * Gestionnaire global des patterns, des blobs, de la gestuelle et de la physique
 */
function Manager() {
    window.touchList = [];
    window.onGesture = null;
	this.patternList = [];
    this.circleList = [];
    this.rectangleList = [];
	window.screenH = 0;
	window.screenW = 0;
    this.all_events = ["tap", "drag", "pinch", "rotate", "hold", "touch", "release"];
    this.hammertime = Hammer(window).on(this.all_events.join(" "), function(event) {
        window.onGesture(event);
    })
    this.doSleep = true;
    this.world = null;
                
    if( typeof Manager.initialized == "undefined" ) { 

       
        Manager.prototype.getWorld = function() {
            return this.world;
        };

        Manager.prototype.setOnGesture = function (func) {
            window.onGesture = func;
        };

        Manager.prototype.setScreenSize = function (screenWidth, screenHeight) {
            window.screenW = screenWidth;
            window.screenH = screenHeight;
        };

        Manager.prototype.addPattern = function(newBlob) {
            this.patternList.push(newBlob);
        };

        Manager.prototype.removeAllPatterns = function() {
            while (this.patternList.length > 0) {
                this.patternList.pop();
            }
        };

        Manager.prototype.addEvent = function(blob) {
            var exist = false;
            for (var i = 0; i < window.touchList.length; i++) {
                if (window.touchList[i].id == blob.getSessionId()) {
                    exist = true;
                }
            }
            if (!exist) {
                window.touchList.push({id:blob.getSessionId(), startX:blob.getScreenX(window.screenW), startY:blob.getScreenY(window.screenH), posX:blob.getScreenX(window.screenW), posY:blob.getScreenY(window.screenH)});
                for (var i = 0; i < this.patternList.length; i++) {
                    if (this.blobMatchPattern(blob,this.patternList[i])) {
                        if (this.patternList[i].isGestureEnable()) {
                            var evt = document.createEvent("MouseEvents");
                            evt.initMouseEvent("mousedown", true, true, window,
                                0, 0, 0, 0, 0, false, false, false, false, 0, document.elementFromPoint(blob.getScreenX(window.screenW), blob.getScreenY(window.screenH)));
                            document.elementFromPoint(blob.getScreenX(window.screenW), blob.getScreenY(window.screenH)).dispatchEvent(evt);
                        }
                    }
                }
            }
        };

        Manager.prototype.updateEvent = function(blob) {
            for (var i = 0; i < window.touchList.length; i++) {
                if (window.touchList[i].id == blob.getSessionId()) {
                    window.touchList[i].posX = blob.getScreenX(window.screenW);
                    window.touchList[i].posY = blob.getScreenY(window.screenH);
                    for (var j = 0; j < this.patternList.length; j++) {
                        if (this.blobMatchPattern(blob,this.patternList[j])) {
                            if (this.patternList[j].isGestureEnable()) {
                                var evt = document.createEvent("MouseEvents");
                                evt.initMouseEvent("mousemove", true, true, window,
                                    0,blob.getScreenX(window.screenW), blob.getScreenY(window.screenH), blob.getScreenX(window.screenW), blob.getScreenY(window.screenH), false, false, false, false, 0, document.elementFromPoint(blob.getScreenX(window.screenW), blob.getScreenY(window.screenH)));
                                evt.distance = 10;
                                document.elementFromPoint(blob.getScreenX(window.screenW), blob.getScreenY(window.screenH)).dispatchEvent(evt);
                            }
                        }
                    }
                }
            }
        };

        Manager.prototype.removeEvent = function(blob) {
            match = false;
            
            for (var i = 0; i < window.touchList.length; i++) {
                if (window.touchList[i].id == blob.getSessionId()) {
                    window.touchList.splice(window.touchList.indexOf(window.touchList[i]),1);
                    var j = 0;
                    while(j < this.patternList.length && !match) {
                        if (this.blobMatchPattern(blob,this.patternList[j])) {
                            if (this.patternList[j].isGestureEnable()) {
                                var evt = document.createEvent("MouseEvents");
                                evt.initMouseEvent("mouseup", true, true, window,
                                    0, 0, 0, 0, 0, false, false, false, false, 0, document.elementFromPoint(blob.getScreenX(window.screenW), blob.getScreenY(window.screenH)));
                                document.elementFromPoint(blob.getScreenX(window.screenW), blob.getScreenY(window.screenH)).dispatchEvent(evt);
                                match = true;
                            }
                        }
                        j++;
                    }
                }
            }
        };

        Manager.prototype.blobMatchPattern = function(blob, pattern) {
            if (pattern.isSizeLimited()) {
                if (blob.getArea() > (pattern.getSizeLimit() + pattern.getDeltaSize()) || blob.getArea() < (pattern.getSizeLimit() - pattern.getDeltaSize())) {
                    return false;
                }
            } 
            if (pattern.isAngleLimited()) {
                if (blob.getAngle() > (pattern.getAngleLimit() + pattern.getDeltaAngle()) || blob.getAngle() < (pattern.getAngleLimit() - pattern.getDeltaAngle())) {
                    return false;
                }
            }
            if (pattern.isXLimited()) {
                if ((blob.getX() + blob.getWidth() / 2) > pattern.getXMaxLimit() || (blob.getX() + blob.getWidth() / 2) < pattern.getXMinLimit()) {
                    return false;
                }
            }
            if (pattern.isYLimited()) {
                if ((blob.getY() + blob.getHeight() / 2) > pattern.getYMaxLimit() || (blob.getY() + blob.getHeight() / 2) < pattern.getYMinLimit()) {
                    return false;
                }
            }
            
            return true;
        };

        Manager.prototype.drawBlobs = function(blobs) {
            var drawn = false;
            var j;
            for (var i in blobs) {
                j = 0;
                while (j < this.patternList.length && !drawn) {
                    if (blobs[i].getContext) {
                        if (this.blobMatchPattern(blobs[i],this.patternList[j])) {
                            this.patternList[j].draw(blobs[i]);
                            drawn = true;
                        }
                    }
                    j++
                }
                drawn = false;
            }
        };

        Manager.initialized = true;
    }
}(this); 

(function(Hammer) {
    Hammer.plugins.fakeMultitouch = function() {
        // test for msMaxTouchPoints to enable this for IE10 with only one pointer (a mouse in all/most cases)
        Hammer.HAS_POINTEREVENTS = navigator.msPointerEnabled && navigator.msMaxTouchPoints && navigator.msMaxTouchPoints >= 1;
        Hammer.event.getTouchList = function(ev, eventType) {
            // get the fake pointerEvent touchlist
            if(Hammer.HAS_POINTEREVENTS) {
                return Hammer.PointerEvent.getTouchList();
            }
            // get the touchlist
            else if(ev.touches) {
                return ev.touches;
            }

            var result = [];

            

            for (var i = 0; i < window.touchList.length; i++) {
                result.push({identifier:window.touchList[i].id, pageX:window.touchList[i].posX, pageY:window.touchList[i].posY, target:null});
            }
            return result;
        };
    };
})(window.Hammer);
