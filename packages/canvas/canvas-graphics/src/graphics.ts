import { Graphics } from '@pixi/graphics';
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { RenderTexture, Texture, Formula } from '@pixi/core';
import { Matrix } from '@pixi/math';

import type { SCALE_MODES } from '@pixi/constants';
import type { BaseRenderTexture } from '@pixi/core';

export type IPaint = string|CanvasPattern;

let canvasRenderer: CanvasRenderer;
const tempMatrix = new Matrix();

export interface IFill {
    alpha?: number;
    paint?: IPaint;
    blendMode?: string;
}

export interface IStroke extends IFill
{
    width?: number;
    cap?: string|CanvasLineCap;
    join?: string|CanvasLineJoin;
    miterLimit?: number;

    clip?: boolean;
}

export type IStyle = IStroke;

export type StylePicker = <T = unknown>(key: string) => T;

export type StyleResolver<S = IStyle> = <T = unknown>(key: string|S) => T|StyleResolver<S>;
export type StyleOrResolver<S = IStyle> = S|StyleResolver<S>;

export type PaintFn<S, E = void> = (...styles: S[]) => E;
export type PaintRunner = (fill: PaintFn<IFill>, stroke: PaintFn<IStroke>) => unknown;

/**
 * Creates a new color tinter function.
 * The new function generates tinted color values, based on given `tint` value.
 *
 * @param {number} tint - The tint value
 * @return {(color: number) => number} The  new color tinter function
 */
export function Tinted(tint: number): (color: number) => number
{
    const tintR = ((tint >> 16) & 0xFF) / 255;
    const tintG = ((tint >> 8) & 0xFF) / 255;
    const tintB = (tint & 0xFF) / 255;

    return (color: number): number =>
    {
        const c = color | 0;

        return (
            (((c >> 16) & 0xFF) / 255 * tintR * 255 << 16)
            + (((c >> 8) & 0xFF) / 255 * tintG * 255 << 8)
            + (((c & 0xFF) / 255) * tintB * 255)
        );
    };
}

export function Style(style: IStyle): StyleResolver
{
    return <T = unknown>(key: string|IStyle): T|StyleResolver =>
        (typeof key === 'string'
            ? (style as any)[key as string] as T
            : Style({ ...style, ...(key as any) }));
}

/**
 * Provides enhanced drawing onto given context by invoking given callback with `fill()` and `stroke()`.
 * `fill()` takes an `IFill` argument; `stroke()` takes an `IStroke` argument.
 * Context state is restored after drawing is performed.
 *
 * @param {CanvasRenderingContext2D} context - The context to draw
 * @param {PIXI.PaintRunner} run - The callback to be invoked
 * @return {unknown} The value returned by `run()`
 */
export const Paint = Formula<PaintRunner>((context: CanvasRenderingContext2D) =>
{
    function open<S>(style: StyleOrResolver<S>, cb: (pick: StylePicker) => void): void
    {
        let pick = style as StyleResolver<S>;

        if (typeof style !== 'function')
        {
            pick = Style(style as IStyle);
        }

        context.save();

        context.globalAlpha = pick('alpha') as number;
        context.globalCompositeOperation = pick('blendMode') as string;

        cb(pick as StylePicker);

        context.restore();
    }

    function fill(style: StyleOrResolver): void
    {
        open(style, (pick: StylePicker) =>
        {
            context.fillStyle = pick('paint') as IPaint;

            context.fill();
        });
    }

    function stroke(style: StyleOrResolver): void
    {
        open(style, (pick: StylePicker) =>
        {
            context.strokeStyle = pick('paint') as IPaint;
            context.lineWidth = pick('width') as number;
            context.lineCap = pick('cap') as CanvasLineCap;
            context.lineJoin = pick('join') as CanvasLineJoin;
            context.miterLimit = pick('miterLimit') as number;

            if (pick('clip') as boolean)
            {
                context.clip();
            }

            context.stroke();
        });
    }

    return [fill, stroke];
});

/**
 * Generates a canvas texture. Only available with **pixi.js-legacy** bundle
 * or the **@pixi/canvas-graphics** package.
 * @method generateCanvasTexture
 * @memberof PIXI.Graphics#
 * @param {PIXI.SCALE_MODES} scaleMode - The scale mode of the texture.
 * @param {number} resolution - The resolution of the texture.
 * @return {PIXI.Texture} The new texture.
 */
Graphics.prototype.generateCanvasTexture = function generateCanvasTexture(scaleMode: SCALE_MODES, resolution = 1): Texture
{
    const bounds = this.getLocalBounds();

    const canvasBuffer = RenderTexture.create({
        width: bounds.width,
        height: bounds.height,
        scaleMode,
        resolution,
    });

    if (!canvasRenderer)
    {
        canvasRenderer = new CanvasRenderer();
    }

    this.transform.updateLocalTransform();
    this.transform.localTransform.copyTo(tempMatrix);

    tempMatrix.invert();

    tempMatrix.tx -= bounds.x;
    tempMatrix.ty -= bounds.y;

    canvasRenderer.render(this, canvasBuffer, true, tempMatrix);

    const texture = Texture.from((canvasBuffer.baseTexture as BaseRenderTexture)._canvasRenderTarget.canvas, {
        scaleMode,
    });

    texture.baseTexture.setResolution(resolution);

    return texture;
};

Graphics.prototype.cachedGraphicsData = [];

/**
 * Renders the object using the Canvas renderer
 *
 * @method _renderCanvas
 * @memberof PIXI.Graphics#
 * @private
 * @param {PIXI.CanvasRenderer} renderer - The renderer
 */
Graphics.prototype._renderCanvas = function _renderCanvas(renderer: CanvasRenderer): void
{
    if (this.isMask === true)
    {
        return;
    }

    this.finishPoly();
    renderer.plugins.graphics.render(this);
};
