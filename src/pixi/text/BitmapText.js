/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * A Text Object will create a line(s) of text using bitmap font
 * @class DisplayObjectContainer
 * @extends Sprite
 * @constructor
 * @param {String} text The copy that you would like the text to display
 * @param {Object} [style] The style parameters
 * @param {Object} [style.font="bold 20pt Arial"] The style and size of the font
 * @param {Object} [style.fill="black"] A canvas fillstyle that will be used on the text eg "red", "#00FF00"
 * @param {String} [style.align="left"] An alignment of the multiline text ("left", "center" or "right")
 * @param {String} [style.stroke] A canvas fillstyle that will be used on the text stroke eg "blue", "#FCFF00"
 * @param {Number} [style.strokeThickness=0] A number that represents the thickness of the stroke. Default is 0 (no stroke)
 */
PIXI.BitmapText = function(text, style)
{
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    PIXI.DisplayObjectContainer.call(this, PIXI.Texture.fromCanvas(this.canvas));

    this.setText(text);
    this.setStyle(style);
    this.updateText();
    this.dirty = false

};

// constructor
PIXI.BitmapText.constructor = PIXI.BitmapText;
PIXI.BitmapText.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

/**
 * Set the copy for the text object
 * @methos setText
 * @param {String} text The copy that you would like the text to display
 */
PIXI.BitmapText.prototype.setText = function(text)
{
    this.text = text || " ";
    this.dirty = true;
};

/**
 * Set the style of the text
 * @method setStyle
 * @param {Object} [style] The style parameters
 * @param {Object} style.font The style and size of the font. If font size is not specified, it uses default bitmap font size. Font name is required
 * @param {String} [style.align="left"] An alignment of the multiline text ("left", "center" or "right")
 */
PIXI.BitmapText.prototype.setStyle = function(style)
{
    style = style || {};
    style.align = style.align || "left";
    this.style = style;

    var font = style.font.split(" ");
    this.fontName = font[font.length - 1];
    this.fontSize = font.length >= 2 ? parseInt(font[font.length - 2], 10) : PIXI.BitmapText.fonts[this.fontName].size;

    this.dirty = true;
};

/**
 * Renders text
 * @private
 */
PIXI.BitmapText.prototype.updateText = function()
{
    var data = PIXI.BitmapText.fonts[this.fontName];
    var pos = new PIXI.Point();
    var prevCharCode = null;
    var chars = [];
    var maxLineWidth = 0;
    var lineWidths = [];
    var line = 0;
    var scale = this.fontSize / data.size;
    for(var i = 0; i < this.text.length; i++)
    {
        var charCode = this.text.charCodeAt(i);
        if(charCode == "\n".charCodeAt(0))
        {
            lineWidths.push(pos.x);
            maxLineWidth = Math.max(maxLineWidth, pos.x);
            line++;

            pos.x = 0;
            pos.y += data.lineHeight;
            prevCharCode = null;
            continue;
        }
        var charData = data.chars[charCode];
        if(!charData) continue;

        if(prevCharCode && charData[prevCharCode])
        {
           pos.x += charData.kerning[prevCharCode];
        }
        chars.push({line: line, charCode: charCode, position: new PIXI.Point(pos.x + charData.xOffset, pos.y + charData.yOffset)});
        pos.x += charData.xAdvance;

        prevCharCode = charCode;
    }

    lineWidths.push(pos.x);
    maxLineWidth = Math.max(maxLineWidth, pos.x);

    var lineAlignOffsets = [];
    for(i = 0; i <= line; i++)
    {
        var alignOffset = 0;
        if(this.style.align == "right")
        {
            alignOffset = maxLineWidth - lineWidths[i];
        }
        else if(this.style.align == "center")
        {
            alignOffset = (maxLineWidth - lineWidths[i]) / 2;
        }
        lineAlignOffsets.push(alignOffset);
    }

    for(i = 0; i < chars.length; i++)
    {
        var char = PIXI.Sprite.fromFrame(chars[i].charCode);
        char.position.x = (chars[i].position.x + lineAlignOffsets[chars[i].line]) * scale;
        char.position.y = chars[i].position.y * scale;
        char.scale.x = char.scale.y = scale;
        this.addChild(char);
    }

    this.width = pos.x * scale;
    this.height = (pos.y + data.lineHeight) * scale;
};

/**
 * @private
 */
PIXI.BitmapText.prototype.updateTransform = function()
{
	if(this.dirty)
	{
        while(this.children.length > 0)
        {
            this.removeChild(this.getChildAt(0));
        }
        this.updateText();

        this.dirty = false;
	}
	
	PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
};

PIXI.BitmapText.fonts = {};