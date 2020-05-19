import { hex2rgb, rgb2hex } from '@pixi/utils';
import { canUseNewCanvasBlendModes } from './utils/canUseNewCanvasBlendModes';

import type { Texture } from '@pixi/core';

/**
 * Utility methods for Sprite/Texture tinting.
 *
 * Tinting with the CanvasRenderer involves creating a new canvas to use as a texture,
 * so be aware of the performance implications.
 *
 * @namespace PIXI.canvasUtils
 * @memberof PIXI
 */
export const canvasUtils = {
    canvas: null as HTMLCanvasElement,

    /**
     * Basically this method just needs a sprite and a color and tints the sprite with the given color.
     *
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Sprite} sprite - the sprite to tint
     * @param {number} color - the color to use to tint the sprite with
     * @return {HTMLCanvasElement} The tinted canvas
     */
    getTintedCanvas: (sprite: { texture: Texture }, color: number): HTMLCanvasElement | HTMLImageElement =>
    {
        const texture = sprite.texture;

        color = canvasUtils.roundColor(color);

        const stringColor = `#${(`00000${(color | 0).toString(16)}`).substr(-6)}`;

        texture.tintCache = texture.tintCache || {};

        const cachedCanvas = texture.tintCache[stringColor];

        let canvas: HTMLCanvasElement;

        if (cachedCanvas)
        {
            if (cachedCanvas.tintId === texture._updateID)
            {
                return texture.tintCache[stringColor];
            }

            canvas = texture.tintCache[stringColor] as HTMLCanvasElement;
        }
        else
        {
            canvas = document.createElement('canvas');
        }

        canvasUtils.tintMethod(texture, color, canvas);

        canvas.tintId = texture._updateID;

        if (canvasUtils.convertTintToImage)
        {
            // is this better?
            const tintImage = new Image();

            tintImage.src = (canvas as HTMLCanvasElement).toDataURL();

            texture.tintCache[stringColor] = tintImage;
        }
        else
        {
            texture.tintCache[stringColor] = canvas;
        }

        return canvas;
    },

    /**
     * Basically this method just needs a sprite and a color and tints the sprite with the given color.
     *
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Texture} texture - the sprite to tint
     * @param {number} color - the color to use to tint the sprite with
     * @return {HTMLCanvasElement} The tinted canvas
     */
    getTintedPattern: (texture: Texture, color: number): CanvasPattern =>
    {
        color = canvasUtils.roundColor(color);

        const stringColor = `#${(`00000${(color | 0).toString(16)}`).substr(-6)}`;

        texture.patternCache = texture.patternCache || {};

        let pattern = texture.patternCache[stringColor];

        if (pattern && pattern.tintId === texture._updateID)
        {
            return pattern;
        }
        if (!canvasUtils.canvas)
        {
            canvasUtils.canvas = document.createElement('canvas');
        }
        canvasUtils.tintMethod(texture, color, canvasUtils.canvas);
        pattern = canvasUtils.canvas.getContext('2d').createPattern(canvasUtils.canvas, 'repeat');
        pattern.tintId = texture._updateID;
        texture.patternCache[stringColor] = pattern;

        return pattern;
    },

    /**
     * Tint a texture using the 'multiply' operation.
     *
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Texture} texture - the texture to tint
     * @param {number} color - the color to use to tint the sprite with
     * @param {HTMLCanvasElement} canvas - the current canvas
     */
    tintWithMultiply: (texture: Texture, color: number, canvas: HTMLCanvasElement): void =>
    {
        const context = canvas.getContext('2d');
        const crop = texture._frame.clone();
        const resolution = texture.baseTexture.resolution;

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        canvas.width = Math.ceil(crop.width);
        canvas.height = Math.ceil(crop.height);

        context.save();
        context.fillStyle = `#${(`00000${(color | 0).toString(16)}`).substr(-6)}`;

        context.fillRect(0, 0, crop.width, crop.height);

        context.globalCompositeOperation = 'multiply';

        const source = texture.baseTexture.getDrawableSource();

        context.drawImage(
            source,
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
            source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );
        context.restore();
    },

    /**
     * Tint a texture using the 'overlay' operation.
     *
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Texture} texture - the texture to tint
     * @param {number} color - the color to use to tint the sprite with
     * @param {HTMLCanvasElement} canvas - the current canvas
     */
    tintWithOverlay: (texture: Texture, color: number, canvas: HTMLCanvasElement): void =>
    {
        const context = canvas.getContext('2d');
        const crop = texture._frame.clone();
        const resolution = texture.baseTexture.resolution;

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        canvas.width = Math.ceil(crop.width);
        canvas.height = Math.ceil(crop.height);

        context.save();
        context.globalCompositeOperation = 'copy';
        context.fillStyle = `#${(`00000${(color | 0).toString(16)}`).substr(-6)}`;
        context.fillRect(0, 0, crop.width, crop.height);

        context.globalCompositeOperation = 'destination-atop';
        context.drawImage(
            texture.baseTexture.getDrawableSource(),
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
        context.restore();
    },

    /**
     * Tint a texture pixel per pixel.
     *
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Texture} texture - the texture to tint
     * @param {number} color - the color to use to tint the sprite with
     * @param {HTMLCanvasElement} canvas - the current canvas
     */
    tintWithPerPixel: (texture: Texture, color: number, canvas: HTMLCanvasElement): void =>
    {
        const context = canvas.getContext('2d');
        const crop = texture._frame.clone();
        const resolution = texture.baseTexture.resolution;

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        canvas.width = Math.ceil(crop.width);
        canvas.height = Math.ceil(crop.height);

        context.save();
        context.globalCompositeOperation = 'copy';
        context.drawImage(
            texture.baseTexture.getDrawableSource(),
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );
        context.restore();

        const rgbValues = hex2rgb(color);
        const r = rgbValues[0];
        const g = rgbValues[1];
        const b = rgbValues[2];

        const pixelData = context.getImageData(0, 0, crop.width, crop.height);

        const pixels = pixelData.data;

        for (let i = 0; i < pixels.length; i += 4)
        {
            pixels[i + 0] *= r;
            pixels[i + 1] *= g;
            pixels[i + 2] *= b;
        }

        context.putImageData(pixelData, 0, 0);
    },

    /**
     * Rounds the specified color according to the canvasUtils.cacheStepsPerColorChannel.
     *
     * @memberof PIXI.canvasUtils
     * @param {number} color - the color to round, should be a hex color
     * @return {number} The rounded color.
     */
    roundColor: (color: number): number =>
    {
        const step = canvasUtils.cacheStepsPerColorChannel;

        const rgbValues = hex2rgb(color);

        rgbValues[0] = Math.min(255, (rgbValues[0] / step) * step);
        rgbValues[1] = Math.min(255, (rgbValues[1] / step) * step);
        rgbValues[2] = Math.min(255, (rgbValues[2] / step) * step);

        return rgb2hex(rgbValues);
    },

    /**
     * Number of steps which will be used as a cap when rounding colors.
     *
     * @memberof PIXI.canvasUtils
     * @type {number}
     */
    cacheStepsPerColorChannel: 8,

    /**
     * Tint cache boolean flag.
     *
     * @memberof PIXI.canvasUtils
     * @type {boolean}
     */
    convertTintToImage: false,

    /**
     * Whether or not the Canvas BlendModes are supported, consequently the ability to tint using the multiply method.
     *
     * @memberof PIXI.canvasUtils
     * @type {boolean}
     */
    canUseMultiply: canUseNewCanvasBlendModes(),

    /**
     * The tinting method that will be used.
     *
     * @memberof PIXI.canvasUtils
     * @type {Function}
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    /* eslint-disable @typescript-eslint/ban-ts-ignore */
    // @ts-ignore
    tintMethod: (texture: Texture, color: number, canvas: HTMLCanvasElement): void =>
    { // jslint-disable no-empty-function

    },
    /* eslint-enable @typescript-eslint/no-unused-vars */
    /* eslint-enable @typescript-eslint/ban-ts-ignore */
};

canvasUtils.tintMethod = canvasUtils.canUseMultiply ? canvasUtils.tintWithMultiply : canvasUtils.tintWithPerPixel;
