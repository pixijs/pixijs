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
	
	this.interactiveItems = [];
}

// constructor
PIXI.InteractionManager.constructor = PIXI.InteractionManager;

/**
 * This method will disable rollover/rollout for ALL interactive items
 * You may wish to use this an optimization if your app does not require rollover/rollout funcitonality
 * @method disableMouseOver
 */
PIXI.InteractionManager.prototype.disableMouseOver = function()
{
	if(!this.mouseoverEnabled)return;
	
	this.mouseoverEnabled = false;
	if(this.target)this.target.view.removeEventListener('mousemove',  this.onMouseMove.bind(this));
}

/**
 * This method will enable rollover/rollout for ALL interactive items
 * It is enabled by default
 * @method enableMouseOver
 */
PIXI.InteractionManager.prototype.enableMouseOver = function()
{
	if(this.mouseoverEnabled)return;
	
	this.mouseoverEnabled = false;
	if(this.target)this.target.view.addEventListener('mousemove',  this.onMouseMove.bind(this));
}

PIXI.InteractionManager.prototype.collectInteractiveSprite = function(displayObject)
{
	var children = displayObject.children;
	var length = children.length;
	
	for (var i = length - 1; i >= 0; i--)
	{
		var child = children[i];
		
		// only sprite's right now...
		if(child instanceof PIXI.Sprite)
		{
			if(child.interactive)this.interactiveItems.push(child);
		}
		else
		{
			// use this to optimize..
			if(!child.interactive)continue;
		}
		
		if(child.children.length > 0)
		{
			this.collectInteractiveSprite(child);
		}
	}
}

PIXI.InteractionManager.prototype.setTarget = function(target)
{
	this.target = target;
	if(this.mouseoverEnabled)target.view.addEventListener('mousemove',  this.onMouseMove.bind(this), true);
	target.view.addEventListener('mousedown',  this.onMouseDown.bind(this), true);
 	target.view.addEventListener('mouseup', 	this.onMouseUp.bind(this), true);
 	target.view.addEventListener('mouseout', 	this.onMouseUp.bind(this), true);
	
	// aint no multi touch just yet!
	target.view.addEventListener("touchstart", this.onTouchStart.bind(this), true);
	target.view.addEventListener("touchend", this.onTouchEnd.bind(this), true);
	target.view.addEventListener("touchmove", this.onTouchMove.bind(this), true);
}

PIXI.InteractionManager.prototype.hitTest = function(interactionData)
{
	if(this.dirty)
	{
		this.dirty = false;
		this.interactiveItems = [];
		// go through and collect all the objects that are interactive..
		this.collectInteractiveSprite(this.stage);
	}
	
	var tempPoint = this.tempPoint;
	var tempMatrix = this.tempMatrix;
	var global = interactionData.global;
	
	var length = this.interactiveItems.length;
	
	for (var i = 0; i < length; i++)
	{
		var item = this.interactiveItems[i];
		if(!item.visible)continue;
		
		// TODO this could do with some optimizing!
		// maybe store the inverse?
		// or do a lazy check first?
		//mat3.inverse(item.worldTransform, tempMatrix);
		//tempPoint.x = tempMatrix[0] * global.x + tempMatrix[1] * global.y + tempMatrix[2]; 
		//tempPoint.y = tempMatrix[4] * global.y + tempMatrix[3] * global.x + tempMatrix[5];
	
		// OPTIMIZED! assuming the matrix transform is affine.. which it totally shold be!
		
		var worldTransform = item.worldTransform;
		
		var a00 = worldTransform[0], a01 = worldTransform[1], a02 = worldTransform[2],
            a10 = worldTransform[3], a11 = worldTransform[4], a12 = worldTransform[5],
            id = 1 / (a00 * a11 + a01 * -a10);
		
		tempPoint.x = a11 * id * global.x + -a01 * id * global.y + (a12 * a01 - a02 * a11) * id; 
		tempPoint.y = a00 * id * global.y + -a10 * id * global.x + (-a12 * a00 + a02 * a10) * id;
		
			
		var x1 = -item.width * item.anchor.x;
		
		if(tempPoint.x > x1 && tempPoint.x < x1 + item.width)
		{
			var y1 = -item.height * item.anchor.y;
			
			if(tempPoint.y > y1 && tempPoint.y < y1 + item.height)
			{
				interactionData.local.x = tempPoint.x;
				interactionData.local.y = tempPoint.y;
				
				return item;
			}
		}
	}
		
	return null;	
}

PIXI.InteractionManager.prototype.onMouseMove = function(event)
{
	event.preventDefault();
	
	// TODO optimize by not check EVERY TIME! maybe half as often? //
	var rect = this.target.view.getBoundingClientRect();
	
	this.mouse.global.x = (event.clientX - rect.left) * (this.target.width / rect.width);
	this.mouse.global.y = (event.clientY - rect.top) * ( this.target.height / rect.height);
	
	var item = this.hitTest(this.mouse);
	
	if(this.currentOver != item)
	{
		if(this.currentOver)
		{
			this.mouse.target = this.currentOver;
			if(this.currentOver.mouseout)this.currentOver.mouseout(this.mouse);
			this.currentOver = null;
		}
		
		this.target.view.style.cursor = "default";
	}
		
	if(item)
	{
		
		if(this.currentOver == item)return;
		
		this.currentOver = item;
		this.target.view.style.cursor = "pointer";
		this.mouse.target = item;
		if(item.mouseover)item.mouseover(this.mouse);
	}
}

PIXI.InteractionManager.prototype.onMouseDown = function(event)
{
	var rect = this.target.view.getBoundingClientRect();
	this.mouse.global.x = (event.clientX - rect.left) * (this.target.width / rect.width);
	this.mouse.global.y = (event.clientY - rect.top) * (this.target.height / rect.height);
	
	var item = this.hitTest(this.mouse);
	if(item)
	{
		this.currentDown = item;
		this.mouse.target = item;
		if(item.mousedown)item.mousedown(this.mouse);
	}
}

PIXI.InteractionManager.prototype.onMouseUp = function(event)
{
	if(this.currentOver)
	{
		this.mouse.target = this.currentOver;
		if(this.currentOver.mouseup)this.currentOver.mouseup(this.mouse);	
	}
	
	if(this.currentDown)
	{
		this.mouse.target = this.currentDown;
		// click!
		if(this.currentOver == this.currentDown)if(this.currentDown.click)this.currentDown.click(this.mouse);
		
	
		this.currentDown = null;
	}
}


PIXI.InteractionManager.prototype.onTouchMove = function(event)
{
	event.preventDefault();
	
	var rect = this.target.view.getBoundingClientRect();
	var changedTouches = event.changedTouches;
	
	for (var i=0; i < changedTouches.length; i++) 
	{
		var touchEvent = changedTouches[i];
		
		var touchData = this.touchs[touchEvent.identifier];
		
		// update the touch position
		touchData.global.x = (touchEvent.clientX - rect.left) * (this.target.width / rect.width);
		touchData.global.y = (touchEvent.clientY - rect.top)  * (this.target.height / rect.height);
	}
}

PIXI.InteractionManager.prototype.onTouchStart = function(event)
{
	event.preventDefault();
	var rect = this.target.view.getBoundingClientRect();
	var changedTouches = event.changedTouches;
	
	for (var i=0; i < changedTouches.length; i++) 
	{
		var touchEvent = changedTouches[i];
		
		var touchData = this.pool.pop();
		if(!touchData)touchData = new PIXI.InteractionData();
		
		this.touchs[touchEvent.identifier] = touchData;
		
		touchData.global.x = (touchEvent.clientX - rect.left) * (this.target.width / rect.width);
		touchData.global.y = (touchEvent.clientY - rect.top)  * (this.target.height / rect.height);
		
		var item = this.hitTest(touchData);
		if(item)
		{
			touchData.currentDown = item;
			touchData.target = item;
			if(item.touchstart)item.touchstart(touchData);
		}
	}
}

PIXI.InteractionManager.prototype.onTouchEnd = function(event)
{
	event.preventDefault();
	
	var rect = this.target.view.getBoundingClientRect();
	var changedTouches = event.changedTouches;
	
	for (var i=0; i < changedTouches.length; i++) 
	{
		var touchEvent = changedTouches[i];
		var touchData = this.touchs[touchEvent.identifier];
		
		touchData.global.x = (touchEvent.clientX - rect.left) * (this.target.width / rect.width);
		touchData.global.y = (touchEvent.clientY - rect.top)  * (this.target.height / rect.height);
		
		if(touchData.currentDown)
		{
			if(touchData.currentDown.touchend)touchData.currentDown.touchend(touchData);
			
			var item = this.hitTest(touchData);
			if(item == touchData.currentDown)
			{
				if(touchData.currentDown.tap)touchData.currentDown.tap(touchData);	
			}
			touchData.currentDown = null;
		}
		
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
	
	/**
	 * This point stores the local coords of where the touch/mouse event happened
	 * @property local 
	 * @type Point
	 */
	this.local = new PIXI.Point();

	/**
	 * The target Sprite that was interacted with
	 * @property target
	 * @type Sprite
	 */
	this.target;
}

// constructor
PIXI.InteractionData.constructor = PIXI.InteractionData;


