import type { AbstractRendererEvents } from '@pixi/core';

export interface CanvasRendererEvents extends AbstractRendererEvents {
    prerender: [];
    postrender: [];
}

/**
 * Event types of CanvasRenderer.
 *
 * @interface CanvasRendererEvents
 * @extends PIXI.AbstractRendererEvents
 * @memberof PIXI
 */

/**
 * @see {@link PIXI.CanvasRenderer#event:prerender}
 * @memberof PIXI.CanvasRendererEvents#
 * @member {EmptyTuple} prerender
 */

/**
 * @see {@link PIXI.CanvasRenderer#event:postrender}
 * @memberof PIXI.CanvasRendererEvents#
 * @member {EmptyTuple} postrender
 */
