var core = require('../core');

// add some extra variables to the container..
Object.assign(
    core.DisplayObject.prototype,
    require('./accessibleTarget')
);


/**
 * The Accessibility manager reacreates the ability to tab and and have content read by screen readers. This is very important as it can possibly help people with disabilities access pixi content.
 * Much like interaction any DisplayObject can be made accessible. This manager will map the events as if the mouse was being used, minimizing the efferot required to implement.
 *
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.CanvasRenderer|PIXI.WebGLRenderer} A reference to the current renderer
 */
function AccessibilityManager(renderer)
{
	// first we create a div that will sit over the pixi element. This is where the div overlays will go.
    var div = document.createElement('div');
    
    div.style.width = 100 + 'px';
    div.style.height = 100 + 'px';
    div.style.position = 'absolute';
    div.style.top = 0;
    div.style.left = 0;
   //
    div.style.zIndex = 2;
   	
   	/**
   	 * This is the dom element that will sit over the pixi element. This is where the div overlays will go.
   	 * 
   	 * @type {HTMLElement}
   	 * @private
   	 */
   	this.div = div;

   	/**
   	 * A simple pool for storing divs.
   	 * 
   	 * @type {Array}
   	 * @private
   	 */
 	this.pool = [];

 	/**
 	 * This is a tick used to check if an object is no longer being rendered.
 	 * 
 	 * @type {Number}
 	 * @private
 	 */
   	this.renderId = 0;

   	/**
   	 * Setting this to true will visually show the divs
   	 * 
   	 * @type {Boolean}
   	 */
   	this.debug = false;

  	/**
     * The renderer this accessibility manager works for.
     *
     * @member {PIXI.SystemRenderer}
     */
   	this.renderer = renderer;

   	/**
     * The array of currently active accessible items.
     *
     * @member {Array}
     * @private
     */
   	this.children = [];
   	
   	/**
     * pre bind the functions..
     */
   	this._onKeyDown = this._onKeyDown.bind(this);
   	this._onMouseMove = this._onMouseMove.bind(this);
   	
   	/**
     * stores the state of the manager. If there are no accessible objects or the mouse is moving the will be false.
     *
     * @member {Array}
     * @private
     */
   	this.isActive = false;


   	// let listen for tab.. once pressed we can fire up and show the accessibility layer
   	window.addEventListener('keydown', this._onKeyDown, false);
}


AccessibilityManager.prototype.constructor = AccessibilityManager;
module.exports = AccessibilityManager;

/**
 * Activating will cause the Accessibility layer to be shown. This is called when a user preses the tab key
 * @private
 */
AccessibilityManager.prototype.activate = function()
{
	if(this.isActive)
	{
		return;
	}

	this.isActive = true;

	window.document.addEventListener('mousemove', this._onMouseMove, true);
	window.removeEventListener('keydown', this._onKeyDown, false);

	this.renderer.on('postrender', this.update, this);

	this.renderer.view.parentNode.appendChild(this.div);	
};

/**
 * Deactivating will cause the Accessibility layer to be hidden. This is called when a user moves the mouse
 * @private
 */
AccessibilityManager.prototype.deactivate = function()
{
	if(!this.isActive)
	{
		return;
	}

	this.isActive = false;

	window.document.removeEventListener('mousemove', this._onMouseMove);
	window.addEventListener('keydown', this._onKeyDown, false);

	this.renderer.off('postrender', this.update);

	this.div.parentNode.removeChild(this.div);

};

/**
 * This recursive function will run throught he scene graph and add any new accessible objects to the DOM layer.
 * @param element {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} the DisplayObject to check.
 * @private
 */
AccessibilityManager.prototype.updateAccessibleObjects = function(displayObject)
{
	if(!displayObject.visible)
	{
		return;
	}

	if(displayObject.accessible && displayObject.interactive)
	{
		if(!displayObject._accessibleActive)
		{
			this.addChild(displayObject);
		}
	   	
	   	displayObject.renderId = this.renderId;
	}

	var children = displayObject.children;

	for (var i = children.length - 1; i >= 0; i--) {
		
		this.updateAccessibleObjects(children[i]);
	}
};


/**
 * Before each render this function will ensure that all divs are mapped correctly to their DisplayObjects
 * @private
 */
AccessibilityManager.prototype.update = function()
{

	// update children...
	this.updateAccessibleObjects(this.renderer._lastObjectRendered);

	var rect = this.renderer.view.getBoundingClientRect();
	var sx = rect.width  / this.renderer.width;
	var sy = rect.height / this.renderer.height;

	var div = this.div;

	div.style.left = rect.left + 'px';
	div.style.top = rect.top + 'px';
	div.style.width = this.renderer.width + 'px';
	div.style.height = this.renderer.height + 'px';

	for (var i = 0; i < this.children.length; i++)
	{

		var child = this.children[i];

		if(child.renderId !== this.renderId)
		{
			child._accessibleActive = false;

            core.utils.removeItems(this.children, i, 1);
			this.div.removeChild( child._accessibleDiv );
			this.pool.push(child._accessibleDiv);
			child._accessibleDiv = null;

			i--;

			if(this.children.length === 0)
			{
				this.deactivate();
			}
		}
		else
		{
			// map div to display..
			div = child._accessibleDiv;
			var hitArea = child.hitArea;
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

				this.capHitArea(hitArea);

				div.style.left = (hitArea.x * sx) + 'px';
				div.style.top =  (hitArea.y * sy) +  'px';

				div.style.width = (hitArea.width * sx) + 'px';
				div.style.height = (hitArea.height * sy) + 'px';
			}		
		}
	}

	// increment the render id..
	this.renderId++;
};

AccessibilityManager.prototype.capHitArea = function (hitArea)
{
    if (hitArea.x < 0)
    {
        hitArea.width += hitArea.x;
        hitArea.x = 0;
    }

    if (hitArea.y < 0)
    {
        hitArea.height += hitArea.y;
        hitArea.y = 0;
    }

    if ( hitArea.x + hitArea.width > this.renderer.width )
    {
        hitArea.width = this.renderer.width - hitArea.x;
    }

    if ( hitArea.y + hitArea.height > this.renderer.height )
    {
        hitArea.height = this.renderer.height - hitArea.y;
    }
};


/**
 * Adds a DisplayObject to the accessibility manager
 * @private
 */
AccessibilityManager.prototype.addChild = function(displayObject)
{
//	this.activate();
	
	var div = this.pool.pop();

	if(!div)
	{
		div = document.createElement('button'); 

	    div.style.width = 100 + 'px';
	    div.style.height = 100 + 'px';
	    div.style.backgroundColor = this.debug ? 'rgba(255,0,0,0.5)' : 'transparent';
	    div.style.position = 'absolute';
	    div.style.zIndex = 2;
	    div.style.borderStyle = 'none';

	    
	    div.addEventListener('click', this._onClick.bind(this));
	    div.addEventListener('focus', this._onFocus.bind(this));
	    div.addEventListener('focusout', this._onFocusOut.bind(this));
	}
	   	



	div.title = displayObject.accessibleTitle || 'displayObject ' + this.tabIndex;

	//
	
	displayObject._accessibleActive = true;
	displayObject._accessibleDiv = div;
	div.displayObject = displayObject;


	this.children.push(displayObject);
	this.div.appendChild( displayObject._accessibleDiv );
	displayObject._accessibleDiv.tabIndex = displayObject.tabIndex;
};


/**
 * Maps the div button press to pixi's InteractionManager (click)
 * @private
 */
AccessibilityManager.prototype._onClick = function(e)
{
	var interactionManager = this.renderer.plugins.interaction;
	interactionManager.dispatchEvent(e.target.displayObject, 'click', interactionManager.eventData);
};

/**
 * Maps the div focus events to pixis InteractionManager (mouseover)
 * @private
 */
AccessibilityManager.prototype._onFocus = function(e)
{
	var interactionManager = this.renderer.plugins.interaction;
	interactionManager.dispatchEvent(e.target.displayObject, 'mouseover', interactionManager.eventData);
};

/**
 * Maps the div focus events to pixis InteractionManager (mouseout)
 * @private
 */
AccessibilityManager.prototype._onFocusOut = function(e)
{
	var interactionManager = this.renderer.plugins.interaction;
	interactionManager.dispatchEvent(e.target.displayObject, 'mouseout', interactionManager.eventData);
};

/**
 * Is called when a key is pressed
 *
 * @private
 */
AccessibilityManager.prototype._onKeyDown = function(e)
{
	if(e.keyCode !== 9)
	{
		return;
	}

	this.activate();
};

/**
 * Is called when the mouse moves across the renderer element
 *
 * @private
 */
AccessibilityManager.prototype._onMouseMove = function()
{
	this.deactivate();
};


/**
 * Destroys the accessibility manager
 *
 */
AccessibilityManager.prototype.destroy = function () 
{
	this.div = null;

	for (var i = 0; i < this.children.length; i++)
	{
		this.children[i].div = null;
	}

	
	window.document.removeEventListener('mousemove', this._onMouseMove);
	window.removeEventListener('keydown', this._onKeyDown);
		
	this.pool = null;
	this.children = null;
	this.renderer = null;

};

core.WebGLRenderer.registerPlugin('accessibility', AccessibilityManager);
core.CanvasRenderer.registerPlugin('accessibility', AccessibilityManager);

