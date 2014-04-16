/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 * - Modified by Tom Slezakowski http://www.tomslezakowski.com @TomSlezakowski (24/03/2014) - Added dropShadowColor.
 */

/**
 * A Text Object will create a line(s) of text. To split a line you can use '\n' 
 * or add a wordWrap property set to true and and wordWrapWidth property with a value
 * in the style object
 *
 * @class Text
 * @extends Sprite
 * @constructor
 * @param text {String} The copy that you would like the text to display
 * @param [style] {Object} The style parameters
 * @param [style.font] {String} default 'bold 20px Arial' The style and size of the font
 * @param [style.fill='black'] {String|Number} A canvas fillstyle that will be used on the text e.g 'red', '#00FF00'
 * @param [style.align='left'] {String} Alignment for multiline text ('left', 'center' or 'right'), does not affect single line text
 * @param [style.stroke] {String|Number} A canvas fillstyle that will be used on the text stroke e.g 'blue', '#FCFF00'
 * @param [style.strokeThickness=0] {Number} A number that represents the thickness of the stroke. Default is 0 (no stroke)
 * @param [style.wordWrap=false] {Boolean} Indicates if word wrap should be used
 * @param [style.wordWrapWidth=100] {Number} The width at which text will wrap, it needs wordWrap to be set to true
 * @param [style.dropShadow=false] {Boolean} Set a drop shadow for the text
 * @param [style.dropShadowColor='#000000'] {String} A fill style to be used on the dropshadow e.g 'red', '#00FF00'
 * @param [style.dropShadowAngle=Math.PI/4] {Number} Set a angle of the drop shadow
 * @param [style.dropShadowDistance=5] {Number} Set a distance of the drop shadow
 */
PIXI.Text = function(text, style)
{
    /**
     * The canvas element that everything is drawn to
     *
     * @property canvas
     * @type HTMLCanvasElement
     */
    this.canvas = document.createElement('canvas');

    /**
     * The canvas 2d context that everything is drawn with
     * @property context
     * @type HTMLCanvasElement 2d Context
     */
    this.context = this.canvas.getContext('2d');

    PIXI.Sprite.call(this, PIXI.Texture.fromCanvas(this.canvas));

    this.setText(text);
    this.setStyle(style);

    this.updateText();
    this.dirty = false;
};

// constructor
PIXI.Text.prototype = Object.create(PIXI.Sprite.prototype);
PIXI.Text.prototype.constructor = PIXI.Text;

/**
 * Set the style of the text
 *
 * @method setStyle
 * @param [style] {Object} The style parameters
 * @param [style.font='bold 20pt Arial'] {String} The style and size of the font
 * @param [style.fill='black'] {Object} A canvas fillstyle that will be used on the text eg 'red', '#00FF00'
 * @param [style.align='left'] {String} Alignment for multiline text ('left', 'center' or 'right'), does not affect single line text
 * @param [style.stroke='black'] {String} A canvas fillstyle that will be used on the text stroke eg 'blue', '#FCFF00'
 * @param [style.strokeThickness=0] {Number} A number that represents the thickness of the stroke. Default is 0 (no stroke)
 * @param [style.wordWrap=false] {Boolean} Indicates if word wrap should be used
 * @param [style.wordWrapWidth=100] {Number} The width at which text will wrap
 * @param [style.dropShadow=false] {Boolean} Set a drop shadow for the text
 * @param [style.dropShadowColor='#000000'] {String} A fill style to be used on the dropshadow e.g 'red', '#00FF00'
 * @param [style.dropShadowAngle=Math.PI/4] {Number} Set a angle of the drop shadow
 * @param [style.dropShadowDistance=5] {Number} Set a distance of the drop shadow
 */
PIXI.Text.prototype.setStyle = function(style)
{
    style = style || {};
    style.font = style.font || 'bold 20pt Arial';
    style.fill = style.fill || 'black';
    style.align = style.align || 'left';
    style.stroke = style.stroke || 'black'; //provide a default, see: https://github.com/GoodBoyDigital/pixi.js/issues/136
    style.strokeThickness = style.strokeThickness || 0;
    style.wordWrap = style.wordWrap || false;
    style.wordWrapWidth = style.wordWrapWidth || 100;
    style.wordWrapWidth = style.wordWrapWidth || 100;
    
    style.dropShadow = style.dropShadow || false;
    style.dropShadowAngle = style.dropShadowAngle || Math.PI / 6;
    style.dropShadowDistance = style.dropShadowDistance || 4;
    style.dropShadowColor = style.dropShadowColor || 'black';

    this.style = style;
    this.dirty = true;
};

/**
 * Set the copy for the text object. To split a line you can use '\n'
 *
 * @method setText
 * @param {String} text The copy that you would like the text to display
 */
PIXI.Text.prototype.setText = function(text)
{
    this.text = text.toString() || ' ';
    this.dirty = true;

};

/**
 * Renders text and updates it when needed
 *
 * @method updateText
 * @private
 */
PIXI.Text.prototype.updateText = function()
{
    this.context.font = this.style.font;

    var outputText = this.text;

    // word wrap
    // preserve original text
    if(this.style.wordWrap)outputText = this.wordWrap(this.text);

    //split text into lines
    var lines = outputText.split(/(?:\r\n|\r|\n)/);

    //calculate text width
    var lineWidths = [];
    var maxLineWidth = 0;
    for (var i = 0; i < lines.length; i++)
    {
        var lineWidth = this.context.measureText(lines[i]).width;
        lineWidths[i] = lineWidth;
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
    }

    var width = maxLineWidth + this.style.strokeThickness;
    if(this.style.dropShadow)width += this.style.dropShadowDistance;

    this.canvas.width = width + this.context.lineWidth;
    //calculate text height
    var lineHeight = this.determineFontHeight('font: ' + this.style.font  + ';') + this.style.strokeThickness;
    
    var height = lineHeight * lines.length;
    if(this.style.dropShadow)height += this.style.dropShadowDistance;

    this.canvas.height = height;

    if(navigator.isCocoonJS) this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
    
    this.context.font = this.style.font;
    this.context.strokeStyle = this.style.stroke;
    this.context.lineWidth = this.style.strokeThickness;
    this.context.textBaseline = 'top';

    var linePositionX;
    var linePositionY;

    if(this.style.dropShadow)
    {
        this.context.fillStyle = this.style.dropShadowColor;

        var xShadowOffset = Math.sin(this.style.dropShadowAngle) * this.style.dropShadowDistance;
        var yShadowOffset = Math.cos(this.style.dropShadowAngle) * this.style.dropShadowDistance;

        for (i = 0; i < lines.length; i++)
        {
            linePositionX = this.style.strokeThickness / 2;
            linePositionY = this.style.strokeThickness / 2 + i * lineHeight;

            if(this.style.align === 'right')
            {
                linePositionX += maxLineWidth - lineWidths[i];
            }
            else if(this.style.align === 'center')
            {
                linePositionX += (maxLineWidth - lineWidths[i]) / 2;
            }

            if(this.style.fill)
            {
                this.context.fillText(lines[i], linePositionX + xShadowOffset, linePositionY + yShadowOffset);
            }

          //  if(dropShadow)
        }
    }

    //set canvas text styles
    this.context.fillStyle = this.style.fill;
    
    //draw lines line by line
    for (i = 0; i < lines.length; i++)
    {
        linePositionX = this.style.strokeThickness / 2;
        linePositionY = this.style.strokeThickness / 2 + i * lineHeight;

        if(this.style.align === 'right')
        {
            linePositionX += maxLineWidth - lineWidths[i];
        }
        else if(this.style.align === 'center')
        {
            linePositionX += (maxLineWidth - lineWidths[i]) / 2;
        }

        if(this.style.stroke && this.style.strokeThickness)
        {
            this.context.strokeText(lines[i], linePositionX, linePositionY);
        }

        if(this.style.fill)
        {
            this.context.fillText(lines[i], linePositionX, linePositionY);
        }

      //  if(dropShadow)
    }


    this.updateTexture();
};

/**
 * Updates texture size based on canvas size
 *
 * @method updateTexture
 * @private
 */
PIXI.Text.prototype.updateTexture = function()
{
    this.texture.baseTexture.width = this.canvas.width;
    this.texture.baseTexture.height = this.canvas.height;
    this.texture.frame.width = this.canvas.width;
    this.texture.frame.height = this.canvas.height;

    this._width = this.canvas.width;
    this._height = this.canvas.height;

    this.requiresUpdate =  true;
};

/**
* Renders the object using the WebGL renderer
*
* @method _renderWebGL
* @param renderSession {RenderSession} 
* @private
*/
PIXI.Text.prototype._renderWebGL = function(renderSession)
{
    if(this.requiresUpdate)
    {
        this.requiresUpdate = false;
        PIXI.updateWebGLTexture(this.texture.baseTexture, renderSession.gl);
    }

    PIXI.Sprite.prototype._renderWebGL.call(this, renderSession);
};

/**
 * Updates the transform of this object
 *
 * @method updateTransform
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

/*
 * http://stackoverflow.com/users/34441/ellisbben
 * great solution to the problem!
 * returns the height of the given font
 *
 * @method determineFontHeight
 * @param fontStyle {Object}
 * @private
 */
PIXI.Text.prototype.determineFontHeight = function(fontStyle)
{
    // build a little reference dictionary so if the font style has been used return a
    // cached version...
    var result = PIXI.Text.heightCache[fontStyle];

    if(!result)
    {
        var body = document.getElementsByTagName('body')[0];
        var dummy = document.createElement('div');
        var dummyText = document.createTextNode('M');
        dummy.appendChild(dummyText);
        dummy.setAttribute('style', fontStyle + ';position:absolute;top:0;left:0');
        body.appendChild(dummy);

        result = dummy.offsetHeight;
        PIXI.Text.heightCache[fontStyle] = result;

        body.removeChild(dummy);
    }

    return result;
};

/**
 * Applies newlines to a string to have it optimally fit into the horizontal
 * bounds set by the Text object's wordWrapWidth property.
 *
 * @method wordWrap
 * @param text {String}
 * @private
 */
PIXI.Text.prototype.wordWrap = function(text)
{
    // Greedy wrapping algorithm that will wrap words as the line grows longer
    // than its horizontal bounds.
    var result = '';
    var lines = text.split('\n');
    for (var i = 0; i < lines.length; i++)
    {
        var spaceLeft = this.style.wordWrapWidth;
        var words = lines[i].split(' ');
        for (var j = 0; j < words.length; j++)
        {
            var wordWidth = this.context.measureText(words[j]).width;
            var wordWidthWithSpace = wordWidth + this.context.measureText(' ').width;
            if(j === 0 || wordWidthWithSpace > spaceLeft)
            {
                // Skip printing the newline if it's the first word of the line that is
                // greater than the word wrap width.
                if(j > 0)
                {
                    result += '\n';
                }
                result += words[j];
                spaceLeft = this.style.wordWrapWidth - wordWidth;
            }
            else
            {
                spaceLeft -= wordWidthWithSpace;
                result += ' ' + words[j];
            }
        }

        if (i < lines.length-1)
        {
            result += '\n';
        }
    }
    return result;
};

/**
 * Destroys this text object
 *
 * @method destroy
 * @param destroyTexture {Boolean}
 */
PIXI.Text.prototype.destroy = function(destroyTexture)
{
    if(destroyTexture)
    {
        this.texture.destroy();
    }

};

PIXI.Text.heightCache = {};
