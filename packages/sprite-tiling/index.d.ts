import type { IBaseTextureOptions } from '@pixi/core';
import type { IDestroyOptions } from '@pixi/display';
import type { IPointData } from '@pixi/math';
import type { ISize } from '@pixi/math';
import { ObjectRenderer } from '@pixi/core';
import type { ObservablePoint } from '@pixi/math';
import { QuadUv } from '@pixi/core';
import { Rectangle } from '@pixi/math';
import type { Renderer } from '@pixi/core';
import { Shader } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { State } from '@pixi/core';
import { Texture } from '@pixi/core';
import { TextureMatrix } from '@pixi/core';
import type { TextureSource } from '@pixi/core';
import { Transform } from '@pixi/math';

export type TilingSprite = GlobalMixins.TilingSprite;

/**
 * A tiling sprite is a fast way of rendering a tiling image
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI
 */
export declare class TilingSprite extends Sprite
{
    tileTransform: Transform;
    uvMatrix: TextureMatrix;
    uvRespectAnchor: boolean;
    /**
     * @param {PIXI.Texture} texture - the texture of the tiling sprite
     * @param {number} [width=100] - the width of the tiling sprite
     * @param {number} [height=100] - the height of the tiling sprite
     */
    constructor(texture: Texture, width?: number, height?: number);
    /**
     * Changes frame clamping in corresponding textureTransform, shortcut
     * Change to -0.5 to add a pixel to the edge, recommended for transparent trimmed textures in atlas
     *
     * @default 0.5
     * @member {number}
     */
    get clampMargin(): number;
    set clampMargin(value: number);
    /**
     * The scaling of the image that is being tiled
     *
     * @member {PIXI.ObservablePoint}
     */
    get tileScale(): ObservablePoint;
    set tileScale(value: ObservablePoint);
    /**
     * The offset of the image that is being tiled
     *
     * @member {PIXI.ObservablePoint}
     */
    get tilePosition(): ObservablePoint;
    set tilePosition(value: ObservablePoint);
    /**
     * @protected
     */
    protected _onTextureUpdate(): void;
    /**
     * Renders the object using the WebGL renderer
     *
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    protected _render(renderer: Renderer): void;
    /**
     * Updates the bounds of the tiling sprite.
     *
     * @protected
     */
    protected _calculateBounds(): void;
    /**
     * Gets the local bounds of the sprite object.
     *
     * @param {PIXI.Rectangle} rect - The output rectangle.
     * @return {PIXI.Rectangle} The bounds.
     */
    getLocalBounds(rect: Rectangle): Rectangle;
    /**
     * Checks if a point is inside this tiling sprite.
     *
     * @param {PIXI.IPointData} point - the point to check
     * @return {boolean} Whether or not the sprite contains the point.
     */
    containsPoint(point: IPointData): boolean;
    /**
     * Destroys this sprite and optionally its texture and children
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy
     *      method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the sprite as well
     * @param {boolean} [options.baseTexture=false] - Should it destroy the base texture of the sprite as well
     */
    destroy(options: IDestroyOptions | boolean): void;
    /**
     * Helper function that creates a new tiling sprite based on the source you provide.
     * The source can be - frame id, image url, video url, canvas element, video element, base texture
     *
     * @static
     * @param {string|PIXI.Texture|HTMLCanvasElement|HTMLVideoElement} source - Source to create texture from
     * @param {Object} options - See {@link PIXI.BaseTexture}'s constructor for options.
     * @param {number} options.width - required width of the tiling sprite
     * @param {number} options.height - required height of the tiling sprite
     * @return {PIXI.TilingSprite} The newly created texture
     */
    static from(source: TextureSource, options: ISize & IBaseTextureOptions): TilingSprite;
    /**
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get width(): number;
    set width(value: number);
    /**
     * The height of the TilingSprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get height(): number;
    set height(value: number);
}

/**
 * WebGL renderer plugin for tiling sprites
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 */
export declare class TilingSpriteRenderer extends ObjectRenderer
{
    shader: Shader;
    simpleShader: Shader;
    quad: QuadUv;
    readonly state: State;
    /**
     * constructor for renderer
     *
     * @param {PIXI.Renderer} renderer - The renderer this tiling awesomeness works for.
     */
    constructor(renderer: Renderer);
    /**
     *
     * @param {PIXI.TilingSprite} ts - tilingSprite to be rendered
     */
    render(ts: TilingSprite): void;
}

export { };
