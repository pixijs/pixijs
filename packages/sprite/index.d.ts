import { BLEND_MODES } from '@pixi/constants';
import { Container } from '@pixi/display';
import type { IBaseTextureOptions } from '@pixi/core';
import type { IDestroyOptions } from '@pixi/display';
import type { IPointData } from '@pixi/math';
import { ObservablePoint } from '@pixi/math';
import { Rectangle } from '@pixi/math';
import type { Renderer } from '@pixi/core';
import { Texture } from '@pixi/core';
import type { TextureSource } from '@pixi/core';

export declare interface Sprite extends GlobalMixins.Sprite, Container {
}

/**
 * The Sprite object is the base for all textured objects that are rendered to the screen
*
 * A sprite can be created directly from an image like this:
 *
 * ```js
 * let sprite = PIXI.Sprite.from('assets/image.png');
 * ```
 *
 * The more efficient way to create sprites is using a {@link PIXI.Spritesheet},
 * as swapping base textures when rendering to the screen is inefficient.
 *
 * ```js
 * PIXI.Loader.shared.add("assets/spritesheet.json").load(setup);
 *
 * function setup() {
 *   let sheet = PIXI.Loader.shared.resources["assets/spritesheet.json"].spritesheet;
 *   let sprite = new PIXI.Sprite(sheet.textures["image.png"]);
 *   ...
 * }
 * ```
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
export declare class Sprite extends Container {
    blendMode: BLEND_MODES;
    indices: Uint16Array;
    pluginName: string;
    _width: number;
    _height: number;
    _texture: Texture;
    _textureID: number;
    _cachedTint: number;
    protected _textureTrimmedID: number;
    protected uvs: Float32Array;
    protected _anchor: ObservablePoint;
    protected vertexData: Float32Array;
    private vertexTrimmedData;
    private _roundPixels;
    private _transformID;
    private _transformTrimmedID;
    private _tint;
    _tintRGB: number;
    /**
     * @param {PIXI.Texture} [texture] - The texture for this sprite.
     */
    constructor(texture: Texture);
    /**
     * When the texture is updated, this event will fire to update the scale and frame
     *
     * @protected
     */
    protected _onTextureUpdate(): void;
    /**
     * Called when the anchor position updates.
     *
     * @private
     */
    private _onAnchorUpdate;
    /**
     * calculates worldTransform * vertices, store it in vertexData
     */
    calculateVertices(): void;
    /**
     * calculates worldTransform * vertices for a non texture with a trim. store it in vertexTrimmedData
     * This is used to ensure that the true width and height of a trimmed texture is respected
     */
    calculateTrimmedVertices(): void;
    /**
    *
    * Renders the object using the WebGL renderer
    *
    * @protected
    * @param {PIXI.Renderer} renderer - The webgl renderer to use.
    */
    protected _render(renderer: Renderer): void;
    /**
     * Updates the bounds of the sprite.
     *
     * @protected
     */
    protected _calculateBounds(): void;
    /**
     * Gets the local bounds of the sprite object.
     *
     * @param {PIXI.Rectangle} [rect] - The output rectangle.
     * @return {PIXI.Rectangle} The bounds.
     */
    getLocalBounds(rect: Rectangle): Rectangle;
    /**
     * Tests if a point is inside this sprite
     *
     * @param {PIXI.IPointData} point - the point to test
     * @return {boolean} the result of the test
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
     * Helper function that creates a new sprite based on the source you provide.
     * The source can be - frame id, image url, video url, canvas element, video element, base texture
     *
     * @static
     * @param {string|PIXI.Texture|HTMLCanvasElement|HTMLVideoElement} source - Source to create texture from
     * @param {object} [options] - See {@link PIXI.BaseTexture}'s constructor for options.
     * @return {PIXI.Sprite} The newly created sprite
     */
    static from(source: SpriteSource, options: IBaseTextureOptions): Sprite;
    /**
     * If true PixiJS will Math.floor() x/y values when rendering, stopping pixel interpolation.
     * Advantages can include sharper image quality (like text) and faster rendering on canvas.
     * The main disadvantage is movement of objects may appear less smooth.
     * To set the global default, change {@link PIXI.settings.ROUND_PIXELS}
     *
     * @member {boolean}
     * @default false
     */
    set roundPixels(value: boolean);
    get roundPixels(): boolean;
    /**
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get width(): number;
    set width(value: number);
    /**
     * The height of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get height(): number;
    set height(value: number);
    /**
     * The anchor sets the origin point of the sprite. The default value is taken from the {@link PIXI.Texture|Texture}
     * and passed to the constructor.
     *
     * The default is `(0,0)`, this means the sprite's origin is the top left.
     *
     * Setting the anchor to `(0.5,0.5)` means the sprite's origin is centered.
     *
     * Setting the anchor to `(1,1)` would mean the sprite's origin point will be the bottom right corner.
     *
     * If you pass only single parameter, it will set both x and y to the same value as shown in the example below.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.anchor.set(0.5); // This will set the origin to center. (0.5) is same as (0.5, 0.5).
     *
     * @member {PIXI.ObservablePoint}
     */
    get anchor(): ObservablePoint;
    set anchor(value: ObservablePoint);
    /**
     * The tint applied to the sprite. This is a hex value.
     * A value of 0xFFFFFF will remove any tint effect.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    get tint(): number;
    set tint(value: number);
    /**
     * The texture that the sprite is using
     *
     * @member {PIXI.Texture}
     */
    get texture(): Texture;
    set texture(value: Texture);
}

export declare type SpriteSource = TextureSource | Texture;

export { }
