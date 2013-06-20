/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


/**
 * A DisplayObjectContainer represents a collection of display objects. It is the base class of all display objects that act as a container for other objects.
 * @class DisplayObjectContainer 
 * @extends DisplayObject
 * @constructor
 */
PIXI.DisplayObjectContainer = function()
{
	PIXI.DisplayObject.call( this );
	
	/**
	 * [read-only] The of children of this container.
	 * @property children {Array}
	 */	
	this.children = [];
	//s
	this.renderable = false;
}

// constructor
PIXI.DisplayObjectContainer.constructor = PIXI.DisplayObjectContainer;
PIXI.DisplayObjectContainer.prototype = Object.create( PIXI.DisplayObject.prototype );

//TODO make visible a getter setter
/*
Object.defineProperty(PIXI.DisplayObjectContainer.prototype, 'visible', {
    get: function() {
        return this._visible;
    },
    set: function(value) {
        this._visible = value;
        
    }
});*/

/**
 * Adds a child to the container.
 * @method addChild
 * @param  DisplayObject {DisplayObject}
 */
PIXI.DisplayObjectContainer.prototype.addChild = function(child)
{
	if(child.parent != undefined)
	{
		child.parent.removeChild(child);
	}
	
	child.parent = this;
	child.childIndex = this.children.length;
	
	this.children.push(child);	
	
	if(this.stage)
	{
		this.stage.__addChild(child);
	}
	
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
 * @method addChildAt
 * @param DisplayObject {DisplayObject}
 * @param index {Number}
 */
PIXI.DisplayObjectContainer.prototype.addChildAt = function(child, index)
{
	if(index >= 0 && index <= this.children.length)
	{
		if(child.parent != undefined)
		{
			child.parent.removeChild(child);
		}
	
		if (index == this.children.length)
		{
		  	this.children.push(child);
		}	
		else 
		{
			this.children.splice(index, 0, child);
		}

		child.parent = this;
		child.childIndex = index;
		
		var length = this.children.length;
		for (var i=index; i < length; i++) 
		{
		  this.children[i].childIndex = i;
		}
		
		if(this.stage)
		{
			this.stage.__addChild(child);
		}
		
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
		// error!
		
		throw new Error(child + " The index "+ index +" supplied is out of bounds " + this.children.length);
	}
}

/**
 * Swaps the depth of 2 displayObjects
 * @method swapChildren
 * @param  DisplayObject {DisplayObject}
 * @param  DisplayObject2 {DisplayObject}
 */
PIXI.DisplayObjectContainer.prototype.swapChildren = function(child, child2)
{
	// TODO I already know this??
	var index = this.children.indexOf( child );
	var index2 = this.children.indexOf( child2 );
	
	if ( index !== -1 && index2 !== -1 ) 
	{
		// cool
		if(this.stage)
		{
			// this is to satisfy the webGL batching..
			// TODO sure there is a nicer way to achieve this!
			this.stage.__removeChild(child);
			this.stage.__removeChild(child2);
			
			this.stage.__addChild(child);
			this.stage.__addChild(child2);
		}
		
		// swap the indexes..
		child.childIndex = index2;
		child2.childIndex = index;
		// swap the positions..
		this.children[index] = child2;
		this.children[index2] = child;
		
	}
	else
	{
		throw new Error(child + " Both the supplied DisplayObjects must be a child of the caller " + this);
	}
}

/**
 * Returns the Child at the specified index
 * @method getChildAt
 * @param  index {Number}
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
 * @method removeChild
 * @param  DisplayObject {DisplayObject}
 */
PIXI.DisplayObjectContainer.prototype.removeChild = function(child)
{
	var index = this.children.indexOf( child );
	
	if ( index !== -1 ) 
	{
		if(this.stage)
		{
			this.stage.__removeChild(child);
		}
		
		// webGL trim
		if(child.__renderGroup)
		{
			child.__renderGroup.removeDisplayObjectAndChildren(child);
		}
		
	//	console.log(">" + child.__renderGroup)
		child.parent = undefined;

		this.children.splice( index, 1 );
	
		// update in dexs!
		for(var i=index,j=this.children.length; i<j; i++)
		{
			this.children[i].childIndex -= 1;
		}
	}
	else
	{
		throw new Error(child + " The supplied DisplayObject must be a child of the caller " + this);
	}
}


/**
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
