import type { BaseEventTypes } from '@pixi/utils';
import type { BaseTexture } from './textures/BaseTexture';
import type { Texture } from './textures/Texture';

export interface AbstractRendererEvents extends BaseEventTypes {
    resize: [number, number];
}

export interface RendererEvents extends AbstractRendererEvents {
    prerender: [];
    postrender: [];
    context: [WebGLRenderingContext];
}

export interface BaseTextureEvents extends BaseEventTypes {
    update: [BaseTexture];
    loaded: [BaseTexture];
    dispose: [BaseTexture];
    error: [BaseTexture, ErrorEvent];
}

export interface TextureEvents extends BaseEventTypes {
    update: [Texture];
}

/**
 * Event types of AbstractRenderer.
 *
 * @interface AbstractRendererEvents
 * @extends PIXI.utils.BaseEventTypes
 * @memberof PIXI
 */

/**
 * @see {@link PIXI.Renderer#event:resize}
 * @memberof PIXI.AbstractRendererEvents#
 * @member {Tuple<number, number>} resize
 */

/**
 * Event types of Renderer.
 *
 * @interface RendererEvents
 * @extends PIXI.AbstractRendererEvents
 * @memberof PIXI
 */

/**
 * @see {@link PIXI.Renderer#event:prerender}
 * @memberof PIXI.RendererEvents#
 * @member {EmptyTuple} prerender
 */

/**
 * @see {@link PIXI.Renderer#event:postrender}
 * @memberof PIXI.RendererEvents#
 * @member {EmptyTuple} postrender
 */

/**
 * @see {@link PIXI.Renderer#event:context}
 * @memberof PIXI.RendererEvents#
 * @member {Tuple<WebGLRenderingContext>} context
 */

/**
 * Event types of BaseTexture.
 *
 * @interface BaseTextureEvents
 * @extends PIXI.utils.BaseEventTypes
 * @memberof PIXI
 */

/**
 * @see {@link PIXI.BaseTexture#event:update}
 * @memberof PIXI.BaseTextureEvents#
 * @member {Tuple<PIXI.BaseTexture>} update
 */

/**
 * @see {@link PIXI.BaseTexture#event:loaded}
 * @memberof PIXI.BaseTextureEvents#
 * @member {Tuple<PIXI.BaseTexture>} loaded
 */

/**
 * @see {@link PIXI.BaseTexture#event:dispose}
 * @memberof PIXI.BaseTextureEvents#
 * @member {Tuple<PIXI.BaseTexture>} dispose
 */

/**
 * @see {@link PIXI.BaseTexture#event:error}
 * @memberof PIXI.BaseTextureEvents#
 * @member {Tuple<PIXI.BaseTexture, ErrorEvent>} error
 */

/**
 * Event types of Texture.
 *
 * @interface TextureEvents
 * @extends PIXI.utils.BaseEventTypes
 * @memberof PIXI
 */

/**
 * @see {@link PIXI.Texture#event:update}
 * @memberof PIXI.TextureEvents#
 * @member {Tuple<PIXI.Texture>} update
 */
