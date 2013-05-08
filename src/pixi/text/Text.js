/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * A Text Object will create a line(s) of text. To split a line you can use "\n", "\r" or "\r\n"
 * @class Text
 * @extends Sprite
 * @constructor
 * @param {String} text The copy that you would like the text to display
 * @param {Object} [style] The style parameters
 * @param {String} [style.font] default "bold 20pt Arial" The style and size of the font
 * @param {Object} [style.fill="black"] A canvas fillstyle that will be used on the text eg "red", "#00FF00"
 * @param {String} [style.align="left"] An alignment of the multiline text ("left", "center" or "right")
 * @param {String} [style.stroke] A canvas fillstyle that will be used on the text stroke eg "blue", "#FCFF00"
 * @param {Number} [style.strokeThickness=0] A number that represents the thickness of the stroke. Default is 0 (no stroke)
 */
PIXI.Text = function(text, style)
{
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    PIXI.Sprite.call(this, PIXI.Texture.fromCanvas(this.canvas));

    this.setText(text);
    this.setStyle(style);
    //this.updateText();
    this.dirty = true;
};

// constructor
PIXI.Text.constructor = PIXI.Text;
PIXI.Text.prototype = Object.create(PIXI.Sprite.prototype);

/**
 * Set the style of the text
 * @method setStyle
 * @param {Object} [style] The style parameters
 * @param {String} [style.font="bold 20pt Arial"] The style and size of the font
 * @param {Object} [style.fill="black"] A canvas fillstyle that will be used on the text eg "red", "#00FF00"
 * @param {String} [style.align="left"] An alignment of the multiline text ("left", "center" or "right")
 * @param {String} [style.stroke] A canvas fillstyle that will be used on the text stroke eg "blue", "#FCFF00"
 * @param {Number} [style.strokeThickness=0] A number that represents the thickness of the stroke. Default is 0 (no stroke)
 */
PIXI.Text.prototype.setStyle = function(style)
{
    style = style || {};
    style.font = style.font || "bold 20pt Arial";
    style.fill = style.fill || "black";
    style.align = style.align || "left";
    style.strokeThickness = style.strokeThickness || 0;
    this.style = style;
    this.dirty = true;
};

/**
 * Set the copy for the text object. To split a line you can use "\n"
 * @method setText
 * @param {String} text The copy that you would like the text to display
 */
PIXI.Sprite.prototype.setText = function(text)
{
    this.text = text || " ";
    this.dirty = true;
};

/**
 * Renders text
 * @private
 */
PIXI.Text.prototype.updateText = function()
{
	this.context.font = this.style.font;

	//split text into lines
	var lines = this.text.split(/(?:\r\n|\r|\n)/);

	//calculate text width
	var lineWidths = [];
	var maxLineWidth = 0;
	for (var i = 0; i < lines.length; i++)
	{
		var lineWidth = this.context.measureText(lines[i]).width;
		lineWidths[i] = lineWidth;
		maxLineWidth = Math.max(maxLineWidth, lineWidth);
	}
	this.canvas.width = maxLineWidth + this.style.strokeThickness;
	
	//calculate text height
	var lineHeight = this.determineFontHeight("font: " + this.style.font  + ";") + this.style.strokeThickness;
	this.canvas.height = lineHeight * lines.length;

	//set canvas text styles
	this.context.fillStyle = this.style.fill;
	this.context.font = this.style.font;
	
	this.context.strokeStyle = this.style.stroke;
	this.context.lineWidth = this.style.strokeThickness;

	this.context.textBaseline = "top";

	//draw lines line by line
	for (i = 0; i < lines.length; i++)
	{
		var linePosition = new PIXI.Point(this.style.strokeThickness / 2, this.style.strokeThickness / 2 + i * lineHeight);
	
		if(this.style.align == "right")
		{
			linePosition.x += maxLineWidth - lineWidths[i];
		}
		else if(this.style.align == "center")
		{
			linePosition.x += (maxLineWidth - lineWidths[i]) / 2;
		}

		if(this.style.stroke && this.style.strokeThickness)
		{
			this.context.strokeText(lines[i], linePosition.x, linePosition.y);
		}

		if(this.style.fill)
		{
			this.context.fillText(lines[i], linePosition.x, linePosition.y);
		}
	}
	
    this.updateTexture();
};

/**
 * Updates texture size based on canvas size
 * @private
 */
PIXI.Text.prototype.updateTexture = function()
{

    this.texture.baseTexture.width = this.canvas.width;
    this.texture.baseTexture.height = this.canvas.height;
    this.texture.frame.width = this.canvas.width;
    this.texture.frame.height = this.canvas.height;
    PIXI.texturesToUpdate.push(this.texture.baseTexture);
};

/**
 * @private
 */
PIXI.Text.prototype.updateTransform = function()
{
	if(this.dirty)
	{
		this.updateText();	
		this.dirty = false;
	}
	
	PIXI.Sprite.prototype.updateTransform.call(this);
};

/**
 * http://stackoverflow.com/users/34441/ellisbben
 * great solution to the problem!
 * @private
 */
PIXI.Text.prototype.determineFontHeight = function(fontStyle) 
{
	// build a little reference dictionary so if the font style has been used return a
	// cached version...
	var result = PIXI.Text.heightCache[fontStyle];
	
	if(!result)
	{
		var body = document.getElementsByTagName("body")[0];
		var dummy = document.createElement("div");
		var dummyText = document.createTextNode("M");
		dummy.appendChild(dummyText);
		dummy.setAttribute("style", fontStyle);
		body.appendChild(dummy);
		
		result = dummy.offsetHeight;
		PIXI.Text.heightCache[fontStyle] = result;
		
		body.removeChild(dummy);
	}
	
	return result;
};

PIXI.Text.prototype.destroy = function(destroyTexture)
{
	if(destroyTexture)
	{
		this.texture.destroy();
	}
		
};

PIXI.Text.heightCache = {};
