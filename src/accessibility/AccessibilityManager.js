var core = require('../core');
//var InteractiveData = require('../interaction/InteractiveData');


// add some extra variables to the container..
Object.assign(
    core.DisplayObject.prototype,
    {
    	accessible:false,
    	accessibleTitle:null,
    	tabIndex:0,
    	_accessibleActive:false
    }
);


/**
 * Holds all information related to an Interaction event
 *
 * @class
 * @memberof PIXI.interaction
 */
function AccessibilityManager(renderer)
{
    var div = document.createElement('div');
    
    div.style.width = 100 + 'px';
    div.style.height = 100 + 'px';
    div.style.position = 'absolute';
    div.style.top = 0;
    div.style.left = 0;
    div.style.zIndex = 2;

   	
 	this.pool = [];

   	this.renderId = 0;
   	this.div = div;

   	this.debug = false;

   	this.renderer = renderer;

   	this.children = [];
   	
   	this._onKeyDown = this._onKeyDown.bind(this);
   	this._onMouseMove = this._onMouseMove.bind(this)
   	
   	this.isActive = false;

   	window.addEventListener('keydown', this._onKeyDown, false);
}


AccessibilityManager.prototype.constructor = AccessibilityManager;
module.exports = AccessibilityManager;

AccessibilityManager.prototype.activate = function()
{
	if(this.isActive)return;
	this.isActive = true;

	window.document.addEventListener('mousemove', this._onMouseMove, true);
	window.removeEventListener('keydown', this._onKeyDown, false);

	this.renderer.on('postrender', this.update, this);

	document.body.appendChild(this.div);	
}

AccessibilityManager.prototype.deactivate = function()
{
	if(!this.isActive)return;
	this.isActive = false;

	window.document.removeEventListener('mousemove', this._onMouseMove);
	window.addEventListener('keydown', this._onKeyDown, false);

	this.renderer.off('postrender', this.update);

	document.body.removeChild(this.div);
}

AccessibilityManager.prototype.updateAccessibleObjects = function(item)
{
	if(!item.visible)return;

	if(item.accessible)
	{
		if(!item._accessibleActive)
		{
			this.addChild(item);
		}
	   	
	   	item.renderId = this.renderId;
	}

	var children = item.children;

	for (var i = children.length - 1; i >= 0; i--) {
		
		this.updateAccessibleObjects(children[i])
	};
}

AccessibilityManager.prototype.update = function()
{

	// update children...
	this.updateAccessibleObjects(this.renderer._lastObjectRendered);

	var rect = this.renderer.view.getBoundingClientRect();
	var sx = rect.width  / this.renderer.width ;
	var sy = rect.height / this.renderer.height ;

	var div = this.div;

	div.style.left = rect.left + 'px';
	div.style.top = rect.top + 'px';

	for (var i = 0; i < this.children.length; i++)
	{

		var child = this.children[i];

		if(child.renderId != this.renderId)
		{
			child._accessibleActive = false;

			this.children.splice(i, 1);
			this.div.removeChild( child.div );
			this.pool.push(child.div);
			child.div = null;

			i--;

			if(this.children.length === 0)
			{
				this.deactivate();
			}
		}
		else
		{
			// map div to display..
			var div = child.div;
			var hitArea = child.hitArea
			var wt = child.worldTransform;

			if(child.hitArea)
			{
				div.style.left = ((wt.tx + (hitArea.x * wt.a)) * sx) + 'px';
				div.style.top =  ((wt.ty + (hitArea.y * wt.d)) * sy) +  'px';

				div.style.width = (hitArea.width * wt.a * sx) + 'px';
				div.style.height = (hitArea.height * wt.d * sy) + 'px';
			
			}
			else
			{
				hitArea = child.getBounds();

				div.style.left = (hitArea.x * sx) + 'px';
				div.style.top =  (hitArea.y * sy) +  'px';

				div.style.width = (hitArea.width * sx) + 'px';
				div.style.height = (hitArea.height * sy) + 'px';
			}		
		}
	};

	this.renderId++;
}

AccessibilityManager.prototype.addChild = function(item)
{
//	this.activate();
	
	var div = this.pool.pop();

	if(!div)
	{
		div = document.createElement('button'); 

	    div.style.width = 100 + 'px';
	    div.style.height = 100 + 'px';
	    div.style.backgroundColor = this.debug ? 'rgba(255,0,0,0.5)' : 'transparent'
	    div.style.position = 'absolute';
	    div.style.zIndex = 2;
	    div.style.borderStyle = 'none';

	    
	    div.addEventListener('click', this._onClick.bind(this))
	    div.addEventListener('focus', this._onFocus.bind(this))
	    div.addEventListener('focusout', this._onFocusOut.bind(this))
	}
	   	



	div.title = item.accessibleTitle || 'item ' + this.tabIndex

	//
	
	item._accessibleActive = true;
	item.div = div;
	div.item = item;


	this.children.push(item);
	this.div.appendChild( item.div );
	item.div.tabIndex = item.tabIndex;
}

AccessibilityManager.prototype._onClick = function(e)
{
	var interactionManager = this.renderer.plugins.interaction;
	interactionManager.dispatchEvent(e.target.item, 'click', interactionManager.eventData);
}

AccessibilityManager.prototype._onFocus = function(e)
{
	var interactionManager = this.renderer.plugins.interaction;
	interactionManager.dispatchEvent(e.target.item, 'mouseover', interactionManager.eventData);
}

AccessibilityManager.prototype._onFocusOut = function(e)
{
	var interactionManager = this.renderer.plugins.interaction;
	interactionManager.dispatchEvent(e.target.item, 'mouseout', interactionManager.eventData);
}

AccessibilityManager.prototype._onKeyDown = function(e)
{
	if(e.keyCode !== 9)return;
	this.activate();
}

AccessibilityManager.prototype._onMouseMove = function()
{
	this.deactivate();
}


core.WebGLRenderer.registerPlugin('accessibility', AccessibilityManager);
core.CanvasRenderer.registerPlugin('accessibility', AccessibilityManager);

