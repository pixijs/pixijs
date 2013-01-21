/**
 * @author Mat Groves http://matgroves.com/
 */

var PIXI = PIXI || {};

/**
 * @class A DisplayObjectContainer represents a collection of display objects. It is the base class of all display objects that act as a container for other objects.
 * @augments PIXI.DisplayObject
 * @constructor
 * @return A new DisplayObjectContainer.
 */
PIXI.DisplayObjectContainer = function()
{
	PIXI.DisplayObject.call( this );
	
	/**
	 * [read-only] The of children of this container.
	 * @type Array
	 */	
	this.children = [];
	
	this.renderable = false;
}

// constructor
PIXI.DisplayObjectContainer.constructor = PIXI.DisplayObjectContainer;
PIXI.DisplayObjectContainer.prototype = Object.create( PIXI.DisplayObject.prototype );

/**
 * Adds a child to the container.
 * @param  DisplayObject {@link PIXI.DisplayObject}
 */
PIXI.DisplayObjectContainer.prototype.addChild = function(child)
{
	if(child.parent != undefined)
	{
		child.parent.removeChild(child)
	}
	
	child.parent = this;
	child.childIndex = this.children.length;
	
	this.children.push(child);	
	if(this.stage)
	{
		this.stage.__addChild(child);
	}
}

/**
 * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown
 * @param DisplayObject {@link PIXI.DisplayObject}
 * @param index
 */
PIXI.DisplayObjectContainer.prototype.addChildAt = function(child, index)
{
	if(index >= 0 && index <= this.children.length)
	{
		if(child.parent != undefined)
		{
			child.parent.removeChild(child)
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
	}
	else
	{
		// error!
		
		throw new Error(child + " The index supplied is out of bounds " + this);
	}
}

/**
 * Removes a child from the container.
 * @param  DisplayObject {@link PIXI.DisplayObject}
 */
PIXI.DisplayObjectContainer.prototype.removeChild = function(child)
{
	var index = this.children.indexOf( child );

	if ( index !== -1 ) 
	{
		if(this.stage)this.stage.__removeChild(child);
		child.parent = undefined;
		//child.childIndex = 0
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
