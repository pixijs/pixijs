/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */



/**
The interaction manager deals with mouse and touch events. At this moment only Sprite's can be interactive.
This manager also supports multitouch.
@class InteractionManager
@constructor
@param stage {Stage}
@type Stage
*/
PIXI.InteractionManager = function(stage)
{
	/**
	 * a refference to the stage
	 * @property stage
	 * @type Stage
	 */
	this.stage = stage;

	// helpers
	this.tempPoint = new PIXI.Point();
	//this.tempMatrix =  mat3.create();
	
	this.mouseoverEnabled = true;
	
	/**
	 * the mouse data 
	 * @property mouse
	 * @type InteractionData
	 */
	this.mouse = new PIXI.InteractionData();
	
	/**
	 * an object that stores current touches (InteractionData) by id reference 
	 * @property touchs
	 * @type Object
	 */
	this.touchs = {};
	
	//tiny little interactiveData pool!
	this.pool = [];

	this.last = 0;
}

// constructor
PIXI.InteractionManager.constructor = PIXI.InteractionManager;

PIXI.InteractionManager.prototype.setTarget = function(target)
{
	if (window.navigator.msPointerEnabled) 
	{
		// time to remove some of that zoom in ja..
		target.view.style["-ms-content-zooming"] = "none";
    	target.view.style["-ms-touch-action"] = "none"
    
		// DO some window specific touch!
	}
	
	
	{
		
		this.target = target;
		target.view.addEventListener('mousemove',  this.onMouseMove.bind(this), true);
		target.view.addEventListener('mousedown',  this.onMouseDown.bind(this), true);
	 	document.body.addEventListener('mouseup',  this.onMouseUp.bind(this), true);
	 	target.view.addEventListener('mouseout',   this.onMouseUp.bind(this), true);
		
		// aint no multi touch just yet!
		target.view.addEventListener("touchstart", this.onTouchStart.bind(this), true);
		target.view.addEventListener("touchend", this.onTouchEnd.bind(this), true);
		target.view.addEventListener("touchmove", this.onTouchMove.bind(this), true);
	}
	
	
	
}

PIXI.InteractionManager.prototype.update = function()
{
	// frequency of 30fps??
	var now = Date.now();
	var diff = now - this.last;
	diff = (diff * 30) / 1000;
	if(diff < 1)return;
	this.last = now;

	if (this.target) {
		this.target.view.style.cursor = 'default';
	}

	if (this.mouse.global.x != 0 || this.mouse.global.y != 0) {
		this.iterateDisplayObjects(this.stage, this.mouse.global, function (displayObject, isHit) {
			if (!displayObject.interactive) {
				return;
			}

			if (displayObject.mouseover || displayObject.mouseout || displayObject.buttonMode) {
				if (isHit) {
					if (displayObject.buttonMode) {
						this.target.view.style.cursor = "pointer";
					}

					if (!displayObject.__isOver) {
						if (displayObject.mouseover) {
							displayObject.mouseover(this.mouse);
						}
						displayObject.__isOver = true;
					}
				} else {
					if(displayObject.__isOver) {
						// roll out!
						if (displayObject.mouseout) {
							displayObject.mouseout(this.mouse);
						}

						displayObject.__isOver = false;
					}
				}
			}
		}.bind(this));
	}
}

PIXI.InteractionManager.prototype.onMouseMove = function(event)
{
	event.preventDefault();
	
	var rect = this.target.view.getBoundingClientRect();

	this.mouse.global.x = (event.clientX - rect.left) * (this.target.width / rect.width);
	this.mouse.global.y = (event.clientY - rect.top) * ( this.target.height / rect.height);

	this.iterateDisplayObjects(this.stage, this.mouse.global, function (displayObject, isHit) {
		if (!displayObject.interactive) {
			return;
		}

		if (displayObject.mousemove) {
			displayObject.mousemove(this.mouse);
		}
	}.bind(this));
}

PIXI.InteractionManager.prototype.onMouseDown = function(event)
{
	event.preventDefault();

	this.iterateDisplayObjects(this.stage, this.mouse.global, function (displayObject, isHit) {
		if (!displayObject.interactive) {
			return;
		}
		
		if (displayObject.mousedown || displayObject.click) {
			displayObject.__mouseIsDown = true;

			if (isHit) {
				if (!this.mouse.target) {
					this.mouse.target = displayObject;
				}

				if (displayObject.mousedown) {
					displayObject.mousedown(this.mouse);
				}
				displayObject.__isDown = true;
			}
		}
	}.bind(this));
}

PIXI.InteractionManager.prototype.onMouseUp = function(event)
{
	event.preventDefault();

	this.iterateDisplayObjects(this.stage, this.mouse.global, function (displayObject, isHit) {
		if (!displayObject.interactive) {
			return;
		}

		if(displayObject.mouseup || displayObject.mouseupoutside || displayObject.click) {
			if(isHit) {
				if(displayObject.mouseup) {
					displayObject.mouseup(this.mouse);
				}
				if(displayObject.__isDown) {
					if(displayObject.click) {
						displayObject.click(this.mouse);
					}
				}
			} else {
				if(displayObject.__isDown) {
					if(displayObject.mouseupoutside) {
						displayObject.mouseupoutside(this.mouse);
					}
				}
			}

			displayObject.__isDown = false;
		}
	}.bind(this));

	this.mouse.target = null;
}

PIXI.InteractionManager.prototype.iterateDisplayObjects = function(displayObject, position, iterator) {
	var hitDisplayObjects = [];

	if (!displayObject.visible) {
		return hitDisplayObjects;
	}
	
	var initialFoundLength = hitDisplayObjects.length;
	
	if (displayObject instanceof PIXI.DisplayObjectContainer) {
		var children = displayObject.children;
		
		for (var i = children.length - 1; i >= 0; i--) {
			var child = children[i];
			
			hitDisplayObjects = hitDisplayObjects.concat(this.iterateDisplayObjects(child, position, iterator));
		}
	}
	
	var isHit = false;
	if (displayObject.hitArea) {
		var worldTransform = displayObject.worldTransform;
		var hitArea = displayObject.hitArea;

		var a00 = worldTransform[0], a01 = worldTransform[1], a02 = worldTransform[2],
			a10 = worldTransform[3], a11 = worldTransform[4], a12 = worldTransform[5],
			id = 1 / (a00 * a11 + a01 * -a10);

		var x = a11 * id * position.x + -a01 * id * position.y + (a12 * a01 - a02 * a11) * id;
		var y = a00 * id * position.y + -a10 * id * position.x + (-a12 * a00 + a02 * a10) * id;

		if (displayObject.hitArea instanceof PIXI.Polygon) {
			var inside = false;

			// https://github.com/substack/point-in-polygon/blob/master/index.js
			for (var i = 0, j = displayObject.hitArea.points.length - 1; i < displayObject.hitArea.points.length; j = i++) {
				var xi = displayObject.hitArea.points[i].x, yi = displayObject.hitArea.points[i].y;
				var xj = displayObject.hitArea.points[j].x, yj = displayObject.hitArea.points[j].y;

				var intersect = ((yi > y) != (yj > y))
					&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
				if (intersect) inside = !inside;
			}

			if (inside) {
				isHit = true;
			}
		} else {
			var x1 = hitArea.x;
			if(x > x1 && x < x1 + hitArea.width) {
				var y1 = hitArea.y;

				if(y > y1 && y < y1 + hitArea.height) {
					isHit = true;
				}
			}
		}
	} else if (displayObject instanceof PIXI.Sprite) {
		var worldTransform = displayObject.worldTransform;

		var a00 = worldTransform[0], a01 = worldTransform[1], a02 = worldTransform[2],
			a10 = worldTransform[3], a11 = worldTransform[4], a12 = worldTransform[5],
			id = 1 / (a00 * a11 + a01 * -a10);

		var x = a11 * id * position.x + -a01 * id * position.y + (a12 * a01 - a02 * a11) * id;
		var y = a00 * id * position.y + -a10 * id * position.x + (-a12 * a00 + a02 * a10) * id;

		var width = displayObject.texture.frame.width;
		var height = displayObject.texture.frame.height;

		var x1 = -width * displayObject.anchor.x;

		if(x > x1 && x < x1 + width) {
			var y1 = -height * displayObject.anchor.y;

			if(y > y1 && y < y1 + height) {
				isHit = true;
			}
		}
	} else if (displayObject instanceof PIXI.DisplayObjectContainer) {
		if (hitDisplayObjects.length > initialFoundLength) {
			isHit = true;
		}
	}
	
	if (isHit) {
		hitDisplayObjects.push(displayObject);
	}
	iterator(displayObject, isHit);
	
	return hitDisplayObjects;
}


PIXI.InteractionManager.prototype.onTouchMove = function(event)
{
	event.preventDefault();

	var rect = this.target.view.getBoundingClientRect();
	var changedTouches = event.changedTouches;

	for (var i=0; i < changedTouches.length; i++) {
		var touchEvent = changedTouches[i];
		var touchData = this.touchs[touchEvent.identifier];

		// update the touch position
		touchData.global.x = (touchEvent.clientX - rect.left) * (this.target.width / rect.width);
		touchData.global.y = (touchEvent.clientY - rect.top)  * (this.target.height / rect.height);
	}

	this.iterateDisplayObjects(this.stage, touchData.global, function (displayObject, isHit) {
		if (!displayObject.interactive) {
			return;
		}

		if (displayObject.touchmove) {
			displayObject.touchmove(touchData);
		}
	}.bind(this));
}

PIXI.InteractionManager.prototype.onTouchStart = function(event)
{
	event.preventDefault();

	var rect = this.target.view.getBoundingClientRect();

	var changedTouches = event.changedTouches;
	for (var i=0; i < changedTouches.length; i++) {
		var touchEvent = changedTouches[i];

		var touchData = this.pool.pop();
		if (!touchData) {
			touchData = new PIXI.InteractionData();
		}

		this.touchs[touchEvent.identifier] = touchData;
		touchData.global.x = (touchEvent.clientX - rect.left) * (this.target.width / rect.width);
		touchData.global.y = (touchEvent.clientY - rect.top)  * (this.target.height / rect.height);

		this.iterateDisplayObjects(this.stage, touchData.global, function (displayObject, isHit) {
			if (!displayObject.interactive) {
				return;
			}
			
			if (isHit) {
				if (displayObject.touchstart || displayObject.tap) {
					if (!touchData.target) {
						touchData.target = displayObject;
					}

					if (displayObject.touchstart) {
						displayObject.touchstart(touchData);
					}

					displayObject.__isDown = true;
					displayObject.__touchData = touchData;
				}
			}
		}.bind(this));
	}
}

PIXI.InteractionManager.prototype.onTouchEnd = function(event)
{
	event.preventDefault();

	var rect = this.target.view.getBoundingClientRect();
	var changedTouches = event.changedTouches;

	for (var i=0; i < changedTouches.length; i++) {

		var touchEvent = changedTouches[i];
		var touchData = this.touchs[touchEvent.identifier];
		var up = false;
		touchData.global.x = (touchEvent.clientX - rect.left) * (this.target.width / rect.width);
		touchData.global.y = (touchEvent.clientY - rect.top)  * (this.target.height / rect.height);

		this.iterateDisplayObjects(this.stage, touchData.global, function (displayObject, isHit) {
			if (!displayObject.interactive) {
				return;
			}

			var displayObjectTouchData = displayObject.__touchData;

			if(displayObjectTouchData == touchData) {
				// so this one WAS down...

				if (displayObject.touchend || displayObject.tap) {
					if (isHit) {
						if (displayObject.touchend) {
							displayObject.touchend(touchData);
						}
						if (displayObject.__isDown) {
							if (displayObject.tap) {
								displayObject.tap(touchData);
							}
						}
					} else {
						if (displayObject.__isDown) {
							if (displayObject.touchendoutside) {
								displayObject.touchendoutside(touchData);
							}
						}
					}

					displayObject.__isDown = false;
				}

				displayObject.__touchData = null;
			}
		}.bind(this));

		touchData.target = null;
		
		// remove the touch..
		this.pool.push(touchData);
		this.touchs[touchEvent.identifier] = null;
	}
}

/**
@class InteractionData
@constructor
*/
PIXI.InteractionData = function()
{
	/**
	 * This point stores the global coords of where the touch/mouse event happened
	 * @property global 
	 * @type Point
	 */
	this.global = new PIXI.Point();
	
	// this is here for legacy... but will remove
	this.local = new PIXI.Point();

	/**
	 * The target Sprite that was interacted with
	 * @property target
	 * @type Sprite
	 */
	this.target;
}

/**
 * This will return the local coords of the specified displayObject for this InteractionData
 * @method getLocalPosition
 * @param displayObject {DisplayObject} The DisplayObject that you would like the local coords off
 * @return {Point} A point containing the coords of the InteractionData position relative to the DisplayObject
 */
PIXI.InteractionData.prototype.getLocalPosition = function(displayObject)
{
	var worldTransform = displayObject.worldTransform;
	var global = this.global;
	
	// do a cheeky transform to get the mouse coords;
	var a00 = worldTransform[0], a01 = worldTransform[1], a02 = worldTransform[2],
        a10 = worldTransform[3], a11 = worldTransform[4], a12 = worldTransform[5],
        id = 1 / (a00 * a11 + a01 * -a10);
	// set the mouse coords...
	return new PIXI.Point(a11 * id * global.x + -a01 * id * global.y + (a12 * a01 - a02 * a11) * id,
							   a00 * id * global.y + -a10 * id * global.x + (-a12 * a00 + a02 * a10) * id)
}

// constructor
PIXI.InteractionData.constructor = PIXI.InteractionData;


