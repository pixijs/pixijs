/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


/**
 * A DisplayObjectContainer represents a collection of display objects.
 * It is the base class of all display objects that act as a container for other objects.
 *
 * @class DisplayObjectContainer 
 * @extends DisplayObject
 * @constructor
 */
PIXI.DisplayObjectContainer = function()
{
	PIXI.DisplayObject.call( this );
	
	/**
	 * [read-only] The of children of this container.
	 *
	 * @property children
	 * @type Array<DisplayObject>
	 * @readOnly
	 */	
	this.children = [];
}

// constructor
PIXI.DisplayObjectContainer.prototype = Object.create( PIXI.DisplayObject.prototype );
PIXI.DisplayObjectContainer.prototype.constructor = PIXI.DisplayObjectContainer;

/**
 * Adds a child to the container.
 *
 * @method addChild
 * @param child {DisplayObject} The DisplayObject to add to the container
 */
PIXI.DisplayObjectContainer.prototype.addChild = function(child)
{
	if(child.parent != undefined)
	{
		
		//// COULD BE THIS???
		child.parent.removeChild(child);
	//	return;
	}

	child.parent = this;
	
	this.children.push(child);	
	
	// update the stage refference..
	
	if(this.stage)
	{
		var tmpChild = child;
		do
		{
			if(tmpChild.interactive)this.stage.dirty = true;
			tmpChild.stage = this.stage;
			tmpChild = tmpChild._iNext;
		}	
		while(tmpChild)
	}
	
	// LINKED LIST //
	
	// modify the list..
	var childFirst = child.first
	var childLast = child.last;
	var nextObject;
	var previousObject;
	
	// this could be wrong if there is a filter??
	if(this._filters || this._mask)
	{
		previousObject =  this.last._iPrev;
	}
	else
	{
		previousObject = this.last;
	}

	nextObject = previousObject._iNext;
	
	// always true in this case
	// need to make sure the parents last is updated too
	var updateLast = this;
	var prevLast = previousObject;
	
	while(updateLast)
	{
		if(updateLast.last == prevLast)
		{
			updateLast.last = child.last;
		}
		updateLast = updateLast.parent;
	}
	
	if(nextObject)
	{
		nextObject._iPrev = childLast;
		childLast._iNext = nextObject;
	}
	
	childFirst._iPrev = previousObject;
	previousObject._iNext = childFirst;		

	// need to remove any render groups..
	if(this.__renderGroup)
	{
		// being used by a renderTexture.. if it exists then it must be from a render texture;
		if(child.__renderGroup)child.__renderGroup.removeDisplayObjectAndChildren(child);
		// add them to the new render group..
		this.__renderGroup.addDisplayObjectAndChildren(child);
	}
	
}

/**
 * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown
 *
 * @method addChildAt
 * @param child {DisplayObject} The child to add
 * @param index {Number} The index to place the child in
 */
PIXI.DisplayObjectContainer.prototype.addChildAt = function(child, index)
{
	if(index >= 0 && index <= this.children.length)
	{
		if(child.parent != undefined)
		{
			child.parent.removeChild(child);
		}
		child.parent = this;
		
		if(this.stage)
		{
			var tmpChild = child;
			do
			{
				if(tmpChild.interactive)this.stage.dirty = true;
				tmpChild.stage = this.stage;
				tmpChild = tmpChild._iNext;
			}
			while(tmpChild)
		}
		
		// modify the list..
		var childFirst = child.first;
		var childLast = child.last;
		var nextObject;
		var previousObject;
		
		if(index == this.children.length)
		{
			previousObject =  this.last;
			var updateLast = this;
			var prevLast = this.last;
			while(updateLast)
			{
				if(updateLast.last == prevLast)
				{
					updateLast.last = child.last;
				}
				updateLast = updateLast.parent;
			}
		}
		else if(index == 0)
		{
			previousObject = this;
		}
		else
		{
			previousObject = this.children[index-1].last;
		}
		
		nextObject = previousObject._iNext;
		
		// always true in this case
		if(nextObject)
		{
			nextObject._iPrev = childLast;
			childLast._iNext = nextObject;
		}
		
		childFirst._iPrev = previousObject;
		previousObject._iNext = childFirst;		

		this.children.splice(index, 0, child);
		// need to remove any render groups..
		if(this.__renderGroup)
		{
			// being used by a renderTexture.. if it exists then it must be from a render texture;
			if(child.__renderGroup)child.__renderGroup.removeDisplayObjectAndChildren(child);
			// add them to the new render group..
			this.__renderGroup.addDisplayObjectAndChildren(child);
		}
		
	}
	else
	{
		throw new Error(child + " The index "+ index +" supplied is out of bounds " + this.children.length);
	}
}

/**
 * [NYI] Swaps the depth of 2 displayObjects
 *
 * @method swapChildren
 * @param child {DisplayObject}
 * @param child2 {DisplayObject}
 * @private
 */
PIXI.DisplayObjectContainer.prototype.swapChildren = function(child, child2)
{
	if(child === child2) {
		return;
	}

	var index1 = this.children.indexOf(child);
	var index2 = this.children.indexOf(child2);
	
	if(index1 < 0 || index2 < 0) {
		throw new Error("swapChildren: Both the supplied DisplayObjects must be a child of the caller.");
	}

	this.removeChild(child);
	this.removeChild(child2);
	
	if(index1 < index2)
	{
		this.addChildAt(child2, index1);
		this.addChildAt(child, index2);
	}
	else
	{
		this.addChildAt(child, index2);
		this.addChildAt(child2, index1);
	}
}

/**
 * Returns the Child at the specified index
 *
 * @method getChildAt
 * @param index {Number} The index to get the child from
 */
PIXI.DisplayObjectContainer.prototype.getChildAt = function(index)
{
	if(index >= 0 && index < this.children.length)
	{
		return this.children[index];
	}
	else
	{
		throw new Error(child + " Both the supplied DisplayObjects must be a child of the caller " + this);
	}
}

/**
 * Removes a child from the container.
 *
 * @method removeChild
 * @param child {DisplayObject} The DisplayObject to remove
 */
PIXI.DisplayObjectContainer.prototype.removeChild = function(child)
{
	var index = this.children.indexOf( child );
	if ( index !== -1 ) 
	{
		// unlink //
		// modify the list..
		var childFirst = child.first;
		var childLast = child.last;
		
		var nextObject = childLast._iNext;
		var previousObject = childFirst._iPrev;
			
		if(nextObject)nextObject._iPrev = previousObject;
		previousObject._iNext = nextObject;		
		
		if(this.last == childLast)
		{

			var tempLast =  childFirst._iPrev;	
			// need to make sure the parents last is updated too
			var updateLast = this;
			
			while(updateLast.last == childLast)
			{
				updateLast.last = tempLast;
				updateLast = updateLast.parent;
				if(!updateLast)break;
				
			}
		}
		
		childLast._iNext = null;
		childFirst._iPrev = null;
		 
		// update the stage reference..
		if(this.stage)
		{
			var tmpChild = child;
			do
			{
				if(tmpChild.interactive)this.stage.dirty = true;
				tmpChild.stage = null;
				tmpChild = tmpChild._iNext;
			}	
			while(tmpChild)
		}
	
		// webGL trim
		if(child.__renderGroup)
		{
			child.__renderGroup.removeDisplayObjectAndChildren(child);
		}
		
		child.parent = undefined;
		this.children.splice( index, 1 );
	}
	else
	{
		throw new Error(child + " The supplied DisplayObject must be a child of the caller " + this);
	}
}

/*
 * Updates the container's children's transform for rendering
 *
 * @method updateTransform
 * @private
 */
PIXI.DisplayObjectContainer.prototype.updateTransform = function()
{
	if(!this.visible)return;
	
	PIXI.DisplayObject.prototype.updateTransform.call( this );
	
	for(var i=0,j=this.children.length; i<j; i++)
	{
		this.children[i].updateTransform();	
	}
}