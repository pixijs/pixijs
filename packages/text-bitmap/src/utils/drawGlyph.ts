import { Color } from '@pixi/core';
import { generateFillStyle } from './generateFillStyle';

import type { ICanvas, ICanvasRenderingContext2D } from '@pixi/core';
import type { TextMetrics, TextStyle } from '@pixi/text';

// TODO: Prevent code duplication b/w drawGlyph & Text#updateText

/**
 * Draws the glyph `metrics.text` on the given canvas.
 *
 * Ignored because not directly exposed.
 * @ignore
 * @param {PIXI.ICanvas} canvas
 * @param {PIXI.ICanvasRenderingContext2D} context
 * @param {TextMetrics} metrics
 * @param {number} x
 * @param {number} y
 * @param {number} resolution
 * @param {TextStyle} style
 */
export function drawGlyph(
    canvas: ICanvas,
    context: ICanvasRenderingContext2D,
    metrics: TextMetrics,
    x: number,
    y: number,
    resolution: number,
    style: TextStyle
): void
{
    const char = metrics.text;
    const fontProperties = metrics.fontProperties;

    context.translate(x, y);
    context.scale(resolution, resolution);

    const tx = style.strokeThickness / 2;
    const ty = -(style.strokeThickness / 2);

    context.font = style.toFontString();
    context.lineWidth = style.strokeThickness;
    context.textBaseline = style.textBaseline;
    context.lineJoin = style.lineJoin;
    context.miterLimit = style.miterLimit;

    // set canvas text styles
    context.fillStyle = generateFillStyle(canvas, context, style, resolution, [char], metrics);
    context.strokeStyle = style.stroke as string;

    if (style.dropShadow)
    {
        const dropShadowColor = style.dropShadowColor;
        const dropShadowBlur = style.dropShadowBlur * resolution;
        const dropShadowDistance = style.dropShadowDistance * resolution;

        context.shadowColor = Color.shared
            .setValue(dropShadowColor)
            .setAlpha(style.dropShadowAlpha)
            .toRgbaString();
        context.shadowBlur = dropShadowBlur;
        context.shadowOffsetX = Math.cos(style.dropShadowAngle) * dropShadowDistance;
        context.shadowOffsetY = Math.sin(style.dropShadowAngle) * dropShadowDistance;
    }
    else
    {
        context.shadowColor = 'black';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
    }

    if (style.stroke && style.strokeThickness)
    {
        context.strokeText(char, tx, ty + metrics.lineHeight - fontProperties.descent);
    }
    if (style.fill)
    {
        context.fillText(char, tx, ty + metrics.lineHeight - fontProperties.descent);
    }

    context.setTransform(1, 0, 0, 1, 0, 0); // defaults needed for older browsers (e.g. Opera 29)

    context.fillStyle = 'rgba(0, 0, 0, 0)';
}
