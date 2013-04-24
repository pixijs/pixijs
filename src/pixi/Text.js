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
 * @param strokeStyle {String} a canvas fillstyle that will be used on the text stroke eg "blue", "#FCFF00" can also be null
 * @param strokeThickness {Number} A number that represents the thicknes of the stroke. default is 0 (no stroke)
 */
PIXI.Text = function(text, fontStyle, fillStyle, strokeStyle, strokeThickness)
{
	this.canvas = document.createElement("canvas");
	
	this.context = this.canvas.getContext("2d");
	//document.body.appendChild(this.canvas);
	this.setText(text);
	this.setStyle(fontStyle, fillStyle, strokeStyle, strokeThickness);
	
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
 * @param strokeStyle {String} a canvas fillstyle that will be used on the text stroke eg "blue", "#FCFF00" can also be null
 * @param strokeThickness {Number} A number that represents the thicknes of the stroke. default is 0 (no stroke)
 */
PIXI.Text.prototype.setStyle = function(fontStyle, fillStyle, strokeStyle, strokeThickness)
{
	this.fontStyle = fontStyle || "bold 20pt Arial";
	this.fillStyle = fillStyle;
	this.strokeStyle = strokeStyle;
	this.strokeThickness = strokeThickness || 0;
	
	this.dirty = true;
}

/**
 * @private
 */
PIXI.Text.prototype.updateText = function()
{
//	console.log(this.text);
	this.context.font = this.fontStyle;
		
	this.canvas.width = this.context.measureText(this.text).width + this.strokeThickness//textDimensions.width;
	this.canvas.height = this.determineFontHeight("font: " + this.fontStyle  + ";")+ this.strokeThickness;// textDimensions.height;

	this.context.fillStyle = this.fillStyle;
	this.context.font = this.fontStyle;
	
    this.context.strokeStyle = this.strokeStyle;
	this.context.lineWidth = this.strokeThickness;

	this.context.textBaseline="top"; 

	if(this.fillStyle)this.context.fillText(this.text,  this.strokeThickness/2, this.strokeThickness/2);
    if(this.strokeStyle && this.strokeThickness)this.context.strokeText(this.text,  this.strokeThickness/2, this.strokeThickness/2);
	
	
//	console.log("//")
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
