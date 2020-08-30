import type { DRAW_MODES } from '@pixi/constants';
import type { IArrayBuffer } from '@pixi/core';
import type { IDestroyOptions } from '@pixi/display';
import type { IPoint } from '@pixi/math';
import type { ITypedArray } from '@pixi/core';
import { Mesh } from '@pixi/mesh';
import { MeshGeometry } from '@pixi/mesh';
import type { Renderer } from '@pixi/core';
import { Texture } from '@pixi/core';

export declare interface NineSlicePlane extends GlobalMixins.NineSlicePlane {
}

/**
 * The NineSlicePlane allows you to stretch a texture using 9-slice scaling. The corners will remain unscaled (useful
 * for buttons with rounded corners for example) and the other areas will be scaled horizontally and or vertically
 *
 *```js
 * let Plane9 = new PIXI.NineSlicePlane(PIXI.Texture.from('BoxWithRoundedCorners.png'), 15, 15, 15, 15);
 *  ```
 * <pre>
 *      A                          B
 *    +---+----------------------+---+
 *  C | 1 |          2           | 3 |
 *    +---+----------------------+---+
 *    |   |                      |   |
 *    | 4 |          5           | 6 |
 *    |   |                      |   |
 *    +---+----------------------+---+
 *  D | 7 |          8           | 9 |
 *    +---+----------------------+---+

 *  When changing this objects width and/or height:
 *     areas 1 3 7 and 9 will remain unscaled.
 *     areas 2 and 8 will be stretched horizontally
 *     areas 4 and 6 will be stretched vertically
 *     area 5 will be stretched both horizontally and vertically
 * </pre>
 *
 * @class
 * @extends PIXI.SimplePlane
 * @memberof PIXI
 *
 */
export declare class NineSlicePlane extends SimplePlane {
    private _origWidth;
    private _origHeight;
    _leftWidth: number;
    _rightWidth: number;
    _topHeight: number;
    _bottomHeight: number;
    /**
     * @param {PIXI.Texture} texture - The texture to use on the NineSlicePlane.
     * @param {number} [leftWidth=10] - size of the left vertical bar (A)
     * @param {number} [topHeight=10] - size of the top horizontal bar (C)
     * @param {number} [rightWidth=10] - size of the right vertical bar (B)
     * @param {number} [bottomHeight=10] - size of the bottom horizontal bar (D)
     */
    constructor(texture: Texture, leftWidth?: number, topHeight?: number, rightWidth?: number, bottomHeight?: number);
    textureUpdated(): void;
    get vertices(): ITypedArray;
    set vertices(value: ITypedArray);
    /**
     * Updates the horizontal vertices.
     *
     */
    updateHorizontalVertices(): void;
    /**
     * Updates the vertical vertices.
     *
     */
    updateVerticalVertices(): void;
    /**
     * Returns the smaller of a set of vertical and horizontal scale of nine slice corners.
     *
     * @return {number} Smaller number of vertical and horizontal scale.
     * @private
     */
    private _getMinScale;
    /**
     * The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
     *
     * @member {number}
     */
    get width(): number;
    set width(value: number);
    /**
     * The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
     *
     * @member {number}
     */
    get height(): number;
    set height(value: number);
    /**
     * The width of the left column
     *
     * @member {number}
     */
    get leftWidth(): number;
    set leftWidth(value: number);
    /**
     * The width of the right column
     *
     * @member {number}
     */
    get rightWidth(): number;
    set rightWidth(value: number);
    /**
     * The height of the top row
     *
     * @member {number}
     */
    get topHeight(): number;
    set topHeight(value: number);
    /**
     * The height of the bottom row
     *
     * @member {number}
     */
    get bottomHeight(): number;
    set bottomHeight(value: number);
    /**
     * Refreshes NineSlicePlane coords. All of them.
     */
    private _refresh;
}

export declare class PlaneGeometry extends MeshGeometry {
    segWidth: number;
    segHeight: number;
    width: number;
    height: number;
    constructor(width?: number, height?: number, segWidth?: number, segHeight?: number);
    /**
     * Refreshes plane coordinates
     * @private
     */
    build(): void;
}

/**
 * RopeGeometry allows you to draw a geometry across several points and then manipulate these points.
 *
 * ```js
 * for (let i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * const rope = new PIXI.RopeGeometry(100, points);
 * ```
 *
 * @class
 * @extends PIXI.MeshGeometry
 * @memberof PIXI
 *
 */
export declare class RopeGeometry extends MeshGeometry {
    points: IPoint[];
    readonly textureScale: number;
    _width: number;
    /**
     * @param {number} [width=200] - The width (i.e., thickness) of the rope.
     * @param {PIXI.Point[]} [points] - An array of {@link PIXI.Point} objects to construct this rope.
     * @param {number} [textureScale=0] - By default the rope texture will be stretched to match
     *     rope length. If textureScale is positive this value will be treated as a scaling
     *     factor and the texture will preserve its aspect ratio instead. To create a tiling rope
     *     set baseTexture.wrapMode to {@link PIXI.WRAP_MODES.REPEAT} and use a power of two texture,
     *     then set textureScale=1 to keep the original texture pixel size.
     *     In order to reduce alpha channel artifacts provide a larger texture and downsample -
     *     i.e. set textureScale=0.5 to scale it down twice.
     */
    constructor(width: number, points: IPoint[], textureScale?: number);
    /**
     * The width (i.e., thickness) of the rope.
     * @member {number}
     * @readOnly
     */
    get width(): number;
    /**
     * Refreshes Rope indices and uvs
     * @private
     */
    private build;
    /**
     * refreshes vertices of Rope mesh
     */
    updateVertices(): void;
    update(): void;
}

/**
 * The Simple Mesh class mimics Mesh in PixiJS v4, providing easy-to-use constructor arguments.
 * For more robust customization, use {@link PIXI.Mesh}.
 *
 * @class
 * @extends PIXI.Mesh
 * @memberof PIXI
 */
export declare class SimpleMesh extends Mesh {
    autoUpdate: boolean;
    /**
     * @param {PIXI.Texture} [texture=Texture.EMPTY] - The texture to use
     * @param {Float32Array} [vertices] - if you want to specify the vertices
     * @param {Float32Array} [uvs] - if you want to specify the uvs
     * @param {Uint16Array} [indices] - if you want to specify the indices
     * @param {number} [drawMode] - the drawMode, can be any of the Mesh.DRAW_MODES consts
     */
    constructor(texture?: Texture, vertices?: IArrayBuffer, uvs?: IArrayBuffer, indices?: IArrayBuffer, drawMode?: DRAW_MODES);
    /**
     * Collection of vertices data.
     * @member {Float32Array}
     */
    get vertices(): ITypedArray;
    set vertices(value: ITypedArray);
    _render(renderer: Renderer): void;
}

/**
 * The SimplePlane allows you to draw a texture across several points and then manipulate these points
 *
 *```js
 * for (let i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * let SimplePlane = new PIXI.SimplePlane(PIXI.Texture.from("snake.png"), points);
 *  ```
 *
 * @class
 * @extends PIXI.Mesh
 * @memberof PIXI
 *
 */
export declare class SimplePlane extends Mesh {
    protected _textureID: number;
    /**
     * @param {PIXI.Texture} texture - The texture to use on the SimplePlane.
     * @param {number} verticesX - The number of vertices in the x-axis
     * @param {number} verticesY - The number of vertices in the y-axis
     */
    constructor(texture: Texture, verticesX: number, verticesY: number);
    /**
     * Method used for overrides, to do something in case texture frame was changed.
     * Meshes based on plane can override it and change more details based on texture.
     */
    textureUpdated(): void;
    set texture(value: Texture);
    get texture(): Texture;
    _render(renderer: Renderer): void;
    destroy(options: IDestroyOptions | boolean): void;
}

/**
 * The rope allows you to draw a texture across several points and then manipulate these points
 *
 *```js
 * for (let i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * let rope = new PIXI.SimpleRope(PIXI.Texture.from("snake.png"), points);
 *  ```
 *
 * @class
 * @extends PIXI.Mesh
 * @memberof PIXI
 *
 */
export declare class SimpleRope extends Mesh {
    autoUpdate: boolean;
    /**
     * @param {PIXI.Texture} texture - The texture to use on the rope.
     * @param {PIXI.Point[]} points - An array of {@link PIXI.Point} objects to construct this rope.
     * @param {number} [textureScale=0] - Optional. Positive values scale rope texture
     * keeping its aspect ratio. You can reduce alpha channel artifacts by providing a larger texture
     * and downsampling here. If set to zero, texture will be streched instead.
     */
    constructor(texture: Texture, points: IPoint[], textureScale?: number);
    _render(renderer: Renderer): void;
}

export { }
