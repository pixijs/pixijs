var utils = require('../../utils'),
    canUseNewCanvasBlendModes = require('../../renderers/canvas/utils/canUseNewCanvasBlendModes');

/**
 * Utility methods for Sprite/Texture tinting.
 *
 * @namespace PIXI.CanvasTinter
 */
var CanvasTinter = module.exports = {
    /**
     * Basically this method just needs a sprite and a color and tints the sprite with the given color.
     *
     * @memberof PIXI.CanvasTinter
     * @param sprite {PIXI.Sprite} the sprite to tint
     * @param color {number} the color to use to tint the sprite with
     * @return {HTMLCanvasElement} The tinted canvas
     */
    getTintedTexture: function (sprite, color)
    {
        var texture = sprite.texture;

        color = CanvasTinter.roundColor(color);

        var stringColor = '#' + ('00000' + ( color | 0).toString(16)).substr(-6);

        texture.tintCache = texture.tintCache || {};

        if (texture.tintCache[stringColor])
        {
            return texture.tintCache[stringColor];
        }

        // clone texture..
        var canvas = CanvasTinter.canvas || document.createElement('canvas');

        //CanvasTinter.tintWithPerPixel(texture, stringColor, canvas);
        CanvasTinter.tintMethod(texture, color, canvas);

        if (CanvasTinter.convertTintToImage)
        {
            // is this better?
            var tintImage = new Image();
            tintImage.src = canvas.toDataURL();

            texture.tintCache[stringColor] = tintImage;
        }
        else
        {
            texture.tintCache[stringColor] = canvas;
            // if we are not converting the texture to an image then we need to lose the reference to the canvas
            CanvasTinter.canvas = null;
        }

        return canvas;
    },

    /**
     * Tint a texture using the 'multiply' operation.
     *
     * @memberof PIXI.CanvasTinter
     * @param texture {PIXI.Texture} the texture to tint
     * @param color {number} the color to use to tint the sprite with
     * @param canvas {HTMLCanvasElement} the current canvas
     */
    tintWithMultiply: function (texture, color, canvas)
    {
        var context = canvas.getContext( '2d' );
        var crop = texture._frame.clone();
        var resolution = texture.baseTexture.resolution;

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        canvas.width = crop.width;
        canvas.height = crop.height;

        context.fillStyle = '#' + ('00000' + ( color | 0).toString(16)).substr(-6);

        context.fillRect(0, 0, crop.width, crop.height);

        context.globalCompositeOperation = 'multiply';

        context.drawImage(
            texture.baseTexture.source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );

        context.globalCompositeOperation = 'destination-atop';

        context.drawImage(
            texture.baseTexture.source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );
    },

    /**
     * Tint a texture using the 'overlay' operation.
     *
     * @memberof PIXI.CanvasTinter
     * @param texture {PIXI.Texture} the texture to tint
     * @param color {number} the color to use to tint the sprite with
     * @param canvas {HTMLCanvasElement} the current canvas
     */
    tintWithOverlay: function (texture, color, canvas)
    {
        var context = canvas.getContext( '2d' );
        var crop = texture._frame.clone();
        var resolution = texture.baseTexture.resolution;

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        canvas.width = crop.width;
        canvas.height = crop.height;

        context.globalCompositeOperation = 'copy';
        context.fillStyle = '#' + ('00000' + ( color | 0).toString(16)).substr(-6);
        context.fillRect(0, 0, crop.width, crop.height);

        context.globalCompositeOperation = 'destination-atop';
        context.drawImage(
            texture.baseTexture.source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );

        // context.globalCompositeOperation = 'copy';
    },

    /**
     * Tint a texture pixel per pixel.
     *
     * @memberof PIXI.CanvasTinter
     * @param texture {PIXI.Texture} the texture to tint
     * @param color {number} the color to use to tint the sprite with
     * @param canvas {HTMLCanvasElement} the current canvas
     */
    tintWithPerPixel: function (texture, color, canvas)
    {
        var context = canvas.getContext( '2d' );
        var crop = texture._frame.clone();
        var resolution = texture.baseTexture.resolution;

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        canvas.width = crop.width;
        canvas.height = crop.height;

        context.globalCompositeOperation = 'copy';
        context.drawImage(
            texture.baseTexture.source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );

        var rgbValues = utils.hex2rgb(color);
        var r = rgbValues[0], g = rgbValues[1], b = rgbValues[2];

        var pixelData = context.getImageData(0, 0, crop.width, crop.height);

        var pixels = pixelData.data;

        for (var i = 0; i < pixels.length; i += 4)
        {
            pixels[i+0] *= r;
            pixels[i+1] *= g;
            pixels[i+2] *= b;
        }

        context.putImageData(pixelData, 0, 0);
    },

    /**
     * Rounds the specified color according to the CanvasTinter.cacheStepsPerColorChannel.
     *
     * @memberof PIXI.CanvasTinter
     * @param color {number} the color to round, should be a hex color
     */
    roundColor: function (color)
    {
        var step = CanvasTinter.cacheStepsPerColorChannel;

        var rgbValues = utils.hex2rgb(color);

        rgbValues[0] = Math.min(255, (rgbValues[0] / step) * step);
        rgbValues[1] = Math.min(255, (rgbValues[1] / step) * step);
        rgbValues[2] = Math.min(255, (rgbValues[2] / step) * step);

        return utils.rgb2hex(rgbValues);
    },

    /**
     * Number of steps which will be used as a cap when rounding colors.
     *
     * @memberof PIXI.CanvasTinter
     * @type {number}
     */
    cacheStepsPerColorChannel: 8,

    /**
     * Tint cache boolean flag.
     *
     * @memberof PIXI.CanvasTinter
     * @type {boolean}
     */
    convertTintToImage: false,

    /**
     * Whether or not the Canvas BlendModes are supported, consequently the ability to tint using the multiply method.
     *
     * @memberof PIXI.CanvasTinter
     * @type {boolean}
     */
    canUseMultiply: canUseNewCanvasBlendModes(),

    /**
     * The tinting method that will be used.
     *
     * @memberof PIXI.CanvasTinter
     * @type {tintMethodFunctionType}
     */
    tintMethod: 0
};

CanvasTinter.tintMethod = CanvasTinter.canUseMultiply ? CanvasTinter.tintWithMultiply :  CanvasTinter.tintWithPerPixel;

/**
 * The tintMethod type.
 *
 * @memberof PIXI.CanvasTinter
 * @callback tintMethodFunctionType
 * @param texture {PIXI.Texture} the texture to tint
 * @param color {number} the color to use to tint the sprite with
 * @param canvas {HTMLCanvasElement} the current canvas
 */
