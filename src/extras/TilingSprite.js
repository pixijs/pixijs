var core = require('../core'),
    // a sprite use dfor rendering textures..
    Sprite = require('../core/sprites/Sprite'),
    tempPoint = new core.Point(),
    CanvasTinter = require('../core/sprites/canvas/CanvasTinter');
var glCore = require('pixi-gl-core'),
    createIndicesForQuads = require('../core/utils/createIndicesForQuads');

/**
 * A tiling sprite is a fast way of rendering a tiling image
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI.extras
 * @param texture {Texture} the texture of the tiling sprite
 * @param width {number}  the width of the tiling sprite
 * @param height {number} the height of the tiling sprite
 */
function TilingSprite(texture, width, height)
{
    Sprite.call(this, texture);
    
    this.gl = null;
    /**
     * Number of values sent in the vertex buffer.
     * positionX, positionY, colorR, colorG, colorB = 5
     *
     * @member {number}
     */
    this.vertSize = 5;

    /**
     * The size of the vertex information in bytes.
     *
     * @member {number}
     */
    this.vertByteSize = this.vertSize * 4;

    /**
     * The scaling of the image that is being tiled
     *
     * @member {PIXI.Point}
     */
    this.tileScale = new core.Point(1,1);


    /**
     * The offset position of the image that is being tiled
     *
     * @member {PIXI.Point}
     */
    this.tilePosition = new core.Point(0,0);

    ///// private

    /**
     * The with of the tiling sprite
     *
     * @member {number}
     * @private
     */
    this._width = width || 100;

    /**
     * The height of the tiling sprite
     *
     * @member {number}
     * @private
     */
    this._height = height || 100;

    /**
     * An internal WebGL UV cache.
     *
     * @member {PIXI.TextureUvs}
     * @private
     */
    this._uvs = new core.TextureUvs();

    this._canvasPattern = null;

    //TODO move..



      this.vertices = new Float32Array([
          -1,-1,
          1,-1,
          1,1,
          -1,1
      ]);

      this.uvs = new Float32Array([
          0,0,
          1,0,
          1,1,
          0,1
      ]);

      this.interleaved =  new Float32Array(8 * 2);

      for (var i = 0; i < 4; i++) {
          this.interleaved[i*4] = this.vertices[(i*2)];
          this.interleaved[(i*4)+1] = this.vertices[(i*2)+1];
          this.interleaved[(i*4)+2] = this.uvs[i*2];
          this.interleaved[(i*4)+3] = this.uvs[(i*2)+1];
      }

      /*
       * @member {Uint16Array} An array containing the indices of the vertices
       */
      this.indices = createIndicesForQuads(1);

}

TilingSprite.prototype = Object.create(Sprite.prototype);
TilingSprite.prototype.constructor = TilingSprite;
module.exports = TilingSprite;


Object.defineProperties(TilingSprite.prototype, {
    /**
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.extras.TilingSprite#
     */
    width: {
        get: function ()
        {
            return this._width;
        },
        set: function (value)
        {
            this._width = value;
        }
    },

    /**
     * The height of the TilingSprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.extras.TilingSprite#
     */
    height: {
        get: function ()
        {
            return this._height;
        },
        set: function (value)
        {
            this._height = value;
        }
    }
});

TilingSprite.prototype._onTextureUpdate = function ()
{
    return;
};

TilingSprite.prototype.initShader = function (gl)
{
  this.gl = gl;
  this.shader = new glCore.GLShader(gl,
    [
      'precision lowp float;',
      'attribute vec2 aVertexPosition;',
      'attribute vec2 aTextureCoord;',
      'attribute vec4 aColor;',

      'uniform mat3 projectionMatrix;',

      'uniform vec4 uFrame;',
      'uniform vec4 uTransform;',

      'varying vec2 vTextureCoord;',
      'varying vec4 vColor;',

      'void main(void){',
      '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',

      '   vec2 coord = aTextureCoord;',
      '   coord -= uTransform.xy;',
      '   coord /= uTransform.zw;',
      '   vTextureCoord = coord;',

      '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);',
      '}'
    ].join('\n'),
    [
      'precision lowp float;',

      'varying vec2 vTextureCoord;',
      'varying vec4 vColor;',

      'uniform sampler2D uSampler;',
      'uniform vec4 uFrame;',
      'uniform vec2 uPixelSize;',

      'void main(void){',

      '   vec2 coord = mod(vTextureCoord, uFrame.zw);',
      '   coord = clamp(coord, uPixelSize, uFrame.zw - uPixelSize);',
      '   coord += uFrame.xy;',

      // '   gl_FragColor =  texture2D(uSampler, coord) * vColor ;',
      '   gl_FragColor =  vec4(1.0);',
      '}'
    ].join('\n')/*8,

          // set the uniforms
          {
              uFrame: { type: '4fv', value: [0,0,1,1] },
              uTransform: { type: '4fv', value: [0,0,1,1] },
              uPixelSize : { type : '2fv', value: [1, 1]}
          }*/
    );

    /*
     * @member {WebGLBuffer} The vertex buffer
     */

    this.vertexBuffer = glCore.GLBuffer.createVertexBuffer(this.gl, this.interleaved);
    this.indexBuffer = glCore.GLBuffer.createIndexBuffer(this.gl, this.indices);

    this.vertexBuffer.upload(this.interleaved);
    this.indexBuffer.upload(this.indices);

    this.vao = new glCore.VertexArrayObject(gl);

    this.vao.addIndex(this.indexBuffer)
      .addAttribute(this.vertexBuffer, this.shader.attributes.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0)
      .addAttribute(this.vertexBuffer, this.shader.attributes.aTextureCoord, gl.UNSIGNED_SHORT, true, this.vertByteSize, 2 * 4)
      .addAttribute(this.vertexBuffer, this.shader.attributes.aColor, gl.UNSIGNED_BYTE, true, this.vertByteSize, 3 * 4);
      // .addAttribute(this.vertexBuffer, this.shader.attributes.aTextureId, gl.FLOAT, false, this.vertByteSize, 4 * 4);
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer}
 * @private
 */
TilingSprite.prototype._renderWebGL = function (renderer)
{
    // tweak our texture temporarily..
    var texture = this._texture;


    // render VertexArrayObject


    if(!texture || !texture._uvs)
    {
        return;
    }

    if(!this.inited)
    {
      this.initShader(renderer.gl);
      this.inited = true;
      // create VertexArrayObject;
      // create shader
    }

    var tempUvs = texture._uvs,
        tempWidth = texture._frame.width,
        tempHeight = texture._frame.height,
        tw = texture.baseTexture.width,
        th = texture.baseTexture.height;

    texture._uvs = this._uvs;
    texture._frame.width = this.width;
    texture._frame.height = this.height;

    this.shader.uniforms.uPixelSize[0] = 1.0/tw;
    this.shader.uniforms.uPixelSize[1] = 1.0/th;

    this.shader.uniforms.uFrame[0] = tempUvs.x0;
    this.shader.uniforms.uFrame[1] = tempUvs.y0;
    this.shader.uniforms.uFrame[2] = tempUvs.x1 - tempUvs.x0;
    this.shader.uniforms.uFrame[3] = tempUvs.y2 - tempUvs.y0;

    this.shader.uniforms.uTransform[0] = (this.tilePosition.x % (tempWidth * this.tileScale.x)) / this._width;
    this.shader.uniforms.uTransform[1] = (this.tilePosition.y % (tempHeight * this.tileScale.y)) / this._height;
    this.shader.uniforms.uTransform[2] = ( tw / this._width ) * this.tileScale.x;
    this.shader.uniforms.uTransform[3] = ( th / this._height ) * this.tileScale.y;

    this.caclulateVertices();

    renderer.bindShader(this.shader);

    this.vertexBuffer.upload(this.interleaved);
    this.indexBuffer.upload(this.indices);

    this.vao.bind()
      .draw(this.gl.TRIANGLES, 6 )
      .unbind();
    // renderer.plugins.sprite.render(this);

    texture._uvs = tempUvs;
    texture._frame.width = tempWidth;
    texture._frame.height = tempHeight;
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer} a reference to the canvas renderer
 * @private
 */
TilingSprite.prototype._renderCanvas = function (renderer)
{
    var texture = this._texture;

    if (!texture.baseTexture.hasLoaded)
    {
      return;
    }

    var context = renderer.context,
        transform = this.worldTransform,
        resolution = renderer.resolution,
        baseTexture = texture.baseTexture,
        modX = (this.tilePosition.x / this.tileScale.x) % texture._frame.width,
        modY = (this.tilePosition.y / this.tileScale.y) % texture._frame.height;

    // create a nice shiny pattern!
    // TODO this needs to be refreshed if texture changes..
    if(!this._canvasPattern)
    {
        // cut an object from a spritesheet..
        var tempCanvas = new core.CanvasBuffer(texture._frame.width, texture._frame.height);

        // Tint the tiling sprite
        if (this.tint !== 0xFFFFFF)
        {
            if (this.cachedTint !== this.tint)
            {
                this.cachedTint = this.tint;

                this.tintedTexture = CanvasTinter.getTintedTexture(this, this.tint);
            }
            tempCanvas.context.drawImage(this.tintedTexture, 0, 0);
        }
        else
        {
            tempCanvas.context.drawImage(baseTexture.source, -texture._frame.x, -texture._frame.y);
        }
        this._canvasPattern = tempCanvas.context.createPattern( tempCanvas.canvas, 'repeat' );
    }

    // set context state..
    context.globalAlpha = this.worldAlpha;
    context.setTransform(transform.a * resolution,
                       transform.b * resolution,
                       transform.c * resolution,
                       transform.d * resolution,
                       transform.tx * resolution,
                       transform.ty * resolution);

    // TODO - this should be rolled into the setTransform above..
    context.scale(this.tileScale.x,this.tileScale.y);

    context.translate(modX + (this.anchor.x * -this._width ),
                      modY + (this.anchor.y * -this._height));

    // check blend mode
    var compositeOperation = renderer.blendModes[this.blendMode];
    if (compositeOperation !== renderer.context.globalCompositeOperation)
    {
        context.globalCompositeOperation = compositeOperation;
    }

    // fill the pattern!
    context.fillStyle = this._canvasPattern;
    context.fillRect(-modX,
                     -modY,
                     this._width / this.tileScale.x,
                     this._height / this.tileScale.y);


    //TODO - pretty sure this can be deleted...
    //context.translate(-this.tilePosition.x + (this.anchor.x * this._width), -this.tilePosition.y + (this.anchor.y * this._height));
    //context.scale(1 / this.tileScale.x, 1 / this.tileScale.y);
};

TilingSprite.prototype.caclulateVertices = function ()
{
    var texture = this._texture,
        wt = this.transform.worldTransform,
        a = wt.a, b = wt.b, c = wt.c, d = wt.d, tx = wt.tx, ty = wt.ty,
        vertexData = this.interleaved,
        w0, w1, h0, h1,
        trim = texture.trim,
        crop = texture.crop;


    if (trim)
    {
        // if the sprite is trimmed and is not a tilingsprite then we need to add the extra space before transforming the sprite coords..
        w1 = trim.x - this.anchor.x * crop.width;
        w0 = w1 + trim.width;

        h1 = trim.y - this.anchor.y * crop.height;
        h0 = h1 + trim.height;

    }
    else
    {
        w0 = (crop.width ) * (1-this.anchor.x);
        w1 = (crop.width ) * -this.anchor.x;

        h0 = crop.height * (1-this.anchor.y);
        h1 = crop.height * -this.anchor.y;
    }

    // xy
    vertexData[0] = a * w1 + c * h1 + tx;
    vertexData[1] = d * h1 + b * w1 + ty;

    // xy
    vertexData[2] = a * w0 + c * h1 + tx;
    vertexData[3] = d * h1 + b * w0 + ty;

     // xy
    vertexData[4] = a * w0 + c * h0 + tx;
    vertexData[5] = d * h0 + b * w0 + ty;

    // xy
    vertexData[6] = a * w1 + c * h0 + tx;
    vertexData[7] = d * h0 + b * w1 + ty;
};

/**
 * Returns the framing rectangle of the sprite as a Rectangle object
*
 * @return {PIXI.Rectangle} the framing rectangle
 */
TilingSprite.prototype.getBounds = function ()
{
    var width = this._width;
    var height = this._height;

    var w0 = width * (1-this.anchor.x);
    var w1 = width * -this.anchor.x;

    var h0 = height * (1-this.anchor.y);
    var h1 = height * -this.anchor.y;

    var worldTransform = this.worldTransform;

    var a = worldTransform.a;
    var b = worldTransform.b;
    var c = worldTransform.c;
    var d = worldTransform.d;
    var tx = worldTransform.tx;
    var ty = worldTransform.ty;

    var x1 = a * w1 + c * h1 + tx;
    var y1 = d * h1 + b * w1 + ty;

    var x2 = a * w0 + c * h1 + tx;
    var y2 = d * h1 + b * w0 + ty;

    var x3 = a * w0 + c * h0 + tx;
    var y3 = d * h0 + b * w0 + ty;

    var x4 =  a * w1 + c * h0 + tx;
    var y4 =  d * h0 + b * w1 + ty;

    var minX,
        maxX,
        minY,
        maxY;

    minX = x1;
    minX = x2 < minX ? x2 : minX;
    minX = x3 < minX ? x3 : minX;
    minX = x4 < minX ? x4 : minX;

    minY = y1;
    minY = y2 < minY ? y2 : minY;
    minY = y3 < minY ? y3 : minY;
    minY = y4 < minY ? y4 : minY;

    maxX = x1;
    maxX = x2 > maxX ? x2 : maxX;
    maxX = x3 > maxX ? x3 : maxX;
    maxX = x4 > maxX ? x4 : maxX;

    maxY = y1;
    maxY = y2 > maxY ? y2 : maxY;
    maxY = y3 > maxY ? y3 : maxY;
    maxY = y4 > maxY ? y4 : maxY;

    var bounds = this._bounds;

    bounds.x = minX;
    bounds.width = maxX - minX;

    bounds.y = minY;
    bounds.height = maxY - minY;

    // store a reference so that if this function gets called again in the render cycle we do not have to recalculate
    this._currentBounds = bounds;

    return bounds;
};

/**
 * Checks if a point is inside this tiling sprite
 * @param point {PIXI.Point} the point to check
 */
TilingSprite.prototype.containsPoint = function( point )
{
    this.worldTransform.applyInverse(point,  tempPoint);

    var width = this._width;
    var height = this._height;
    var x1 = -width * this.anchor.x;
    var y1;

    if ( tempPoint.x > x1 && tempPoint.x < x1 + width )
    {
        y1 = -height * this.anchor.y;

        if ( tempPoint.y > y1 && tempPoint.y < y1 + height )
        {
            return true;
        }
    }

    return false;
};

/**
 * Destroys this tiling sprite
 *
 */
TilingSprite.prototype.destroy = function () {
    Sprite.prototype.destroy.call(this);

    this.tileScale = null;
    this._tileScaleOffset = null;
    this.tilePosition = null;

    this._uvs = null;
};

/**
 * Helper function that creates a tiling sprite that will use a texture from the TextureCache based on the frameId
 * The frame ids are created when a Texture packer file has been loaded
 *
 * @static
 * @param frameId {string} The frame Id of the texture in the cache
 * @return {PIXI.extras.TilingSprite} A new TilingSprite using a texture from the texture cache matching the frameId
 * @param width {number}  the width of the tiling sprite
 * @param height {number} the height of the tiling sprite
 */
TilingSprite.fromFrame = function (frameId,width,height)
{
    var texture = core.utils.TextureCache[frameId];

    if (!texture)
    {
        throw new Error('The frameId "' + frameId + '" does not exist in the texture cache ' + this);
    }

    return new TilingSprite(texture,width,height);
};

/**
 * Helper function that creates a sprite that will contain a texture based on an image url
 * If the image is not in the texture cache it will be loaded
 *
 * @static
 * @param imageId {string} The image url of the texture
 * @param width {number}  the width of the tiling sprite
 * @param height {number} the height of the tiling sprite
 * @param [crossorigin=(auto)] {boolean} if you want to specify the cross-origin parameter
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} if you want to specify the scale mode, see {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.extras.TilingSprite} A new TilingSprite using a texture from the texture cache matching the image id
 */
TilingSprite.fromImage = function (imageId, width, height, crossorigin, scaleMode)
{
    return new TilingSprite(core.Texture.fromImage(imageId, crossorigin, scaleMode),width,height);
};
