/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


/**
 * The Graphics class contains a set of methods that you can use to create primitive shapes and lines.
 * It is important to know that with the webGL renderer only simple polys can be filled at this stage
 * Complex polys will not be filled. Heres an example of a complex poly: http://www.goodboydigital.com/wp-content/uploads/2013/06/complexPolygon.png
 *
 * @class Graphics
 * @extends DisplayObjectContainer
 * @constructor
 */
PIXI.Graphics = function()
{
	PIXI.DisplayObjectContainer.call( this );

	this.renderable = true;

    /**
     * The alpha of the fill of this graphics object
     *
     * @property fillAlpha
     * @type Number
     */
	this.fillAlpha = 1;

    /**
     * The width of any lines drawn
     *
     * @property lineWidth
     * @type Number
     */
	this.lineWidth = 0;

    /**
     * The color of any lines drawn
     *
     * @property lineColor
     * @type String
     */
	this.lineColor = "black";

    /**
     * Graphics data
     *
     * @property graphicsData
     * @type Array
     * @private
     */
	this.graphicsData = [];

    /**
     * Current path
     *
     * @property currentPath
     * @type Object
     * @private
     */
	this.currentPath = {points:[]};
}

// constructor
PIXI.Graphics.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );
PIXI.Graphics.prototype.constructor = PIXI.Graphics;

/**
 * Specifies a line style used for subsequent calls to Graphics methods such as the lineTo() method or the drawCircle() method.
 *
 * @method lineStyle
 * @param lineWidth {Number} width of the line to draw, will update the object's stored style
 * @param color {Number} color of the line to draw, will update the object's stored style
 * @param alpha {Number} alpha of the line to draw, will update the object's stored style
 */
PIXI.Graphics.prototype.lineStyle = function(lineWidth, color, alpha)
{
	if(this.currentPath.points.length == 0)this.graphicsData.pop();

	this.lineWidth = lineWidth || 0;
	this.lineColor = color || 0;
	this.lineAlpha = (alpha == undefined) ? 1 : alpha;

	this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha,
						fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling, points:[], type:PIXI.Graphics.POLY};

	this.graphicsData.push(this.currentPath);
}

/**
 * Moves the current drawing position to (x, y).
 *
 * @method moveTo
 * @param x {Number} the X coord to move to
 * @param y {Number} the Y coord to move to
 */
PIXI.Graphics.prototype.moveTo = function(x, y)
{
	if(this.currentPath.points.length == 0)this.graphicsData.pop();

	this.currentPath = this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha,
						fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling, points:[], type:PIXI.Graphics.POLY};

	this.currentPath.points.push(x, y);

	this.graphicsData.push(this.currentPath);
}

/**
 * Draws a line using the current line style from the current drawing position to (x, y);
 * the current drawing position is then set to (x, y).
 *
 * @method lineTo
 * @param x {Number} the X coord to draw to
 * @param y {Number} the Y coord to draw to
 */
PIXI.Graphics.prototype.lineTo = function(x, y)
{
	this.currentPath.points.push(x, y);
	this.dirty = true;
}

/**
 * Specifies a simple one-color fill that subsequent calls to other Graphics methods
 * (such as lineTo() or drawCircle()) use when drawing.
 *
 * @method beginFill
 * @param color {uint} the color of the fill
 * @param alpha {Number} the alpha
 */
PIXI.Graphics.prototype.beginFill = function(color, alpha)
{
	this.filling = true;
	this.fillColor = color || 0;
	this.fillAlpha = (alpha == undefined) ? 1 : alpha;
}

/**
 * Applies a fill to the lines and shapes that were added since the last call to the beginFill() method.
 *
 * @method endFill
 */
PIXI.Graphics.prototype.endFill = function()
{
	this.filling = false;
	this.fillColor = null;
	this.fillAlpha = 1;
}

/**
 * @method drawRect
 *
 * @param x {Number} The X coord of the top-left of the rectangle
 * @param y {Number} The Y coord of the top-left of the rectangle
 * @param width {Number} The width of the rectangle
 * @param height {Number} The height of the rectangle
 */
PIXI.Graphics.prototype.drawRect = function( x, y, width, height )
{
	if(this.currentPath.points.length == 0)this.graphicsData.pop();

	this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha,
						fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling,
						points:[x, y, width, height], type:PIXI.Graphics.RECT};

	this.graphicsData.push(this.currentPath);
	this.dirty = true;
}

/**
 * Draws a circle.
 *
 * @method drawCircle
 * @param x {Number} The X coord of the center of the circle
 * @param y {Number} The Y coord of the center of the circle
 * @param radius {Number} The radius of the circle
 */
PIXI.Graphics.prototype.drawCircle = function( x, y, radius)
{
	if(this.currentPath.points.length == 0)this.graphicsData.pop();

	this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha,
						fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling,
						points:[x, y, radius, radius], type:PIXI.Graphics.CIRC};

	this.graphicsData.push(this.currentPath);
	this.dirty = true;
}

/**
 * Draws an elipse.
 *
 * @method drawElipse
 * @param x {Number}
 * @param y {Number}
 * @param width {Number}
 * @param height {Number}
 */
PIXI.Graphics.prototype.drawElipse = function( x, y, width, height)
{
	if(this.currentPath.points.length == 0)this.graphicsData.pop();

	this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha,
						fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling,
						points:[x, y, width, height], type:PIXI.Graphics.ELIP};

	this.graphicsData.push(this.currentPath);
	this.dirty = true;
}

/**
 * Clears the graphics that were drawn to this Graphics object, and resets fill and line style settings.
 *
 * @method clear
 */
PIXI.Graphics.prototype.clear = function()
{
	this.lineWidth = 0;
	this.filling = false;

	this.dirty = true;
	this.clearDirty = true;
	this.graphicsData = [];

	this.bounds = null//new PIXI.Rectangle();
}


PIXI.Graphics.prototype.updateFilterBounds = function()
{
	if(!this.bounds)
	{
		var minX = Infinity;
		var maxX = -Infinity;

		var minY = Infinity;
		var maxY = -Infinity;

		var points, x, y;

		for (var i = 0; i < this.graphicsData.length; i++) {
			

			var data = this.graphicsData[i];
			var type = data.type;
			var lineWidth = data.lineWidth;

			points = data.points;

			if(type === PIXI.Graphics.RECT)
			{
				x = points.x - lineWidth/2;
				y = points.y - lineWidth/2;
				var width = points.width + lineWidth;
				var height = points.height + lineWidth;

				minX = x < minX ? x : minX;
				maxX = x + width > maxX ? x + width : maxX;

				minY = y < minY ? x : minY;
				maxY = y + height > maxY ? y + height : maxY;
			}
			else if(type === PIXI.Graphics.CIRC || type === PIXI.Graphics.ELIP)
			{
				x = points.x;
				y = points.y;
				var radius = points.radius + lineWidth/2;
				
				minX = x - radius < minX ? x - radius : minX;
				maxX = x + radius > maxX ? x + radius : maxX;

				minY = y - radius < minY ? y - radius : minY;
				maxY = y + radius > maxY ? y + radius : maxY;
			}
			else
			{
				// POLY
				for (var j = 0; j < points.length; j+=2) 
				{
					
					x = points[j];
					y = points[j+1];

					minX = x-lineWidth < minX ? x-lineWidth : minX;
					maxX = x+lineWidth > maxX ? x+lineWidth : maxX;

					minY = y-lineWidth < minY ? y-lineWidth : minY;
					maxY = y+lineWidth > maxY ? y+lineWidth : maxY;
				};
			}

		};

		this.bounds = new PIXI.Rectangle(minX, minY, maxX - minX, maxY - minY);

	}

//	console.log(this.bounds);
}

// SOME TYPES:
PIXI.Graphics.POLY = 0;
PIXI.Graphics.RECT = 1;
PIXI.Graphics.CIRC = 2;
PIXI.Graphics.ELIP = 3;
