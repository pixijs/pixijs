/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * A Text Object will create a line of text
 * @class Text
 * @extends Sprite
 * @constructor
 * @param text {String} The copy that you would like the text to display
 * @param fontStyle {String} the style and size of the font eg "bold 20px Arial"
 * @param fillStyle {Object} a canvas fillstyle that will be used on the text eg "red", "#00FF00" can also be null
 * @param textAlign {String} an alignment of the multiline text ("left", "center" or "right"). Default is "left", can be null
 * @param strokeStyle {String} a canvas fillstyle that will be used on the text stroke eg "blue", "#FCFF00" can also be null
 * @param strokeThickness {Number} A number that represents the thicknes of the stroke. default is 0 (no stroke)
 */
PIXI.Text = function(text, fontStyle, fillStyle, textAlign, strokeStyle, strokeThickness)
{
	this.canvas = document.createElement("canvas");
	
	this.context = this.canvas.getContext("2d");
	//document.body.appendChild(this.canvas);
	this.setText(text);
	this.setStyle(fontStyle, fillStyle, textAlign, strokeStyle, strokeThickness);
	
	this.updateText();
	
	PIXI.Sprite.call( this, PIXI.Texture.fromCanvas(this.canvas));
	
	// need to store a canvas that can
}

// constructor
PIXI.Text.constructor = PIXI.Text;
PIXI.Text.prototype = Object.create( PIXI.Sprite.prototype );

/**
 * Set the copy for the text object
 * @methos setText
 * @param text {String} The copy that you would like the text to display
 */
PIXI.Text.prototype.setText = function(text)
{
	this.text = text || " ";
	this.dirty = true;
}

/**
 * Set the style of the text
 * @method setStyle
 * @constructor
 * @param fontStyle {String} the style and size of the font eg "bold 20px Arial"
 * @param fillStyle {Object} a canvas fillstyle that will be used on the text eg "red", "#00FF00" can also be null
 * @param textAlign {String} an alignment of the multiline text ("left", "center" or "right"). Default is "left", can be null
 * @param strokeStyle {String} a canvas fillstyle that will be used on the text stroke eg "blue", "#FCFF00" can also be null
 * @param strokeThickness {Number} A number that represents the thicknes of the stroke. default is 0 (no stroke)
 */
PIXI.Text.prototype.setStyle = function(fontStyle, fillStyle, textAlign, strokeStyle, strokeThickness)
{
	this.fontStyle = fontStyle || "bold 20pt Arial";
	this.fillStyle = fillStyle;
	this.textAlign = textAlign || "left";
	this.strokeStyle = strokeStyle;
	this.strokeThickness = strokeThickness || 0;
	
	this.dirty = true;
}

/**
 * @private
 */
PIXI.Text.prototype.updateText = function()
{
	this.context.font = this.fontStyle;

	//split text into lines
	var lines = this.text.split("\n");

	//calculate text width
	var lineWidths = [];
	var maxLineWidth = 0;
	for (var i = 0; i < lines.length; i++)
	{
		var lineWidth = this.context.measureText(lines[i]).width;
		lineWidths[i] = lineWidth;
		maxLineWidth = Math.max(maxLineWidth, lineWidth);
	}
	this.canvas.width = maxLineWidth + this.strokeThickness;
	
	//calculate text height
	var lineHeight = this.determineFontHeight("font: " + this.fontStyle  + ";") + this.strokeThickness;
	this.canvas.height = lineHeight * lines.length;

	//set canvas text styles
	this.context.fillStyle = this.fillStyle;
	this.context.font = this.fontStyle;
	
    this.context.strokeStyle = this.strokeStyle;
	this.context.lineWidth = this.strokeThickness;

	this.context.textBaseline="top"; 

	//draw lines line by line
	for (var i = 0; i < lines.length; i++)
	{
		var linePosition = new PIXI.Point(this.strokeThickness / 2, this.strokeThickness / 2 + i * lineHeight);
		if(this.textAlign == "right")
		{
			linePosition.x += maxLineWidth - lineWidths[i];
		}
		else if(this.textAlign == "center")
		{
			linePosition.x += (maxLineWidth - lineWidths[i]) / 2;
		}

		if(this.strokeStyle && this.strokeThickness)
		{
			this.context.strokeText(lines[i], linePosition.x, linePosition.y);
		}

		if(this.fillStyle) 
		{
			this.context.fillText(lines[i], linePosition.x, linePosition.y);
		}
	}
}

PIXI.Text.prototype.updateTransform = function()
{
	if(this.dirty)
	{
		this.updateText();	
		
		// update the texture..
		this.texture.baseTexture.width = this.canvas.width;
		this.texture.baseTexture.height = this.canvas.height;
		this.texture.frame.width = this.canvas.width;
		this.texture.frame.height = this.canvas.height;
		
		PIXI.texturesToUpdate.push(this.texture.baseTexture);
		this.dirty = false;
	}
	
	PIXI.Sprite.prototype.updateTransform.call( this );
}

/*
 * http://stackoverflow.com/users/34441/ellisbben
 * great solution to the problem!
 */
PIXI.Text.prototype.determineFontHeight = function(fontStyle) 
{
	// build a little refference dictionary so if the font style has been used return a
	// cached version...
	var result = PIXI.Text.heightCache[fontStyle]
	
	if(!result)
	{
		var body = document.getElementsByTagName("body")[0];
		var dummy = document.createElement("div");
		var dummyText = document.createTextNode("M");
		dummy.appendChild(dummyText);
		dummy.setAttribute("style", fontStyle);
		body.appendChild(dummy);
		
		result = dummy.offsetHeight;
		PIXI.Text.heightCache[fontStyle] = result
		
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
		
}

PIXI.Text.heightCache = {};
