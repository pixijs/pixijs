import { BLEND_MODES } from '@pixi/constants';
import type { Buffer as Buffer_2 } from '@pixi/core';
import { Container } from '@pixi/display';
import type { Dict } from '@pixi/utils';
import { DRAW_MODES } from '@pixi/constants';
import { Geometry } from '@pixi/core';
import type { IArrayBuffer } from '@pixi/core';
import type { IDestroyOptions } from '@pixi/display';
import type { IPointData } from '@pixi/math';
import { Program } from '@pixi/core';
import type { Renderer } from '@pixi/core';
import { Shader } from '@pixi/core';
import { State } from '@pixi/core';
import type { Texture } from '@pixi/core';
import { TextureMatrix } from '@pixi/core';

export declare interface IMeshMaterialOptions {
    alpha?: number;
    tint?: number;
    pluginName?: string;
    program?: Program;
    uniforms?: Dict<unknown>;
}

export type Mesh = GlobalMixins.Mesh;

/**
 * Base mesh class.
 *
 * This class empowers you to have maximum flexibility to render any kind of WebGL visuals you can think of.
 * This class assumes a certain level of WebGL knowledge.
 * If you know a bit this should abstract enough away to make you life easier!
 *
 * Pretty much ALL WebGL can be broken down into the following:
 * - Geometry - The structure and data for the mesh. This can include anything from positions, uvs, normals, colors etc..
 * - Shader - This is the shader that PixiJS will render the geometry with (attributes in the shader must match the geometry)
 * - State - This is the state of WebGL required to render the mesh.
 *
 * Through a combination of the above elements you can render anything you want, 2D or 3D!
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
export declare class Mesh extends Container
{
    readonly geometry: Geometry;
    shader: MeshMaterial;
    state: State;
    drawMode: DRAW_MODES;
    start: number;
    size: number;
    private vertexData;
    private vertexDirty;
    private _transformID;
    private _roundPixels;
    private batchUvs;
    uvs: Float32Array;
    indices: Uint16Array;
    _tintRGB: number;
    _texture: Texture;
    /**
     * @param {PIXI.Geometry} geometry - the geometry the mesh will use
     * @param {PIXI.MeshMaterial} shader - the shader the mesh will use
     * @param {PIXI.State} [state] - the state that the WebGL context is required to be in to render the mesh
     *        if no state is provided, uses {@link PIXI.State.for2d} to create a 2D state for PixiJS.
     * @param {number} [drawMode=PIXI.DRAW_MODES.TRIANGLES] - the drawMode, can be any of the PIXI.DRAW_MODES consts
     */
    constructor(geometry: Geometry, shader: MeshMaterial, state?: State, drawMode?: DRAW_MODES);
    /**
     * To change mesh uv's, change its uvBuffer data and increment its _updateID.
     * @member {PIXI.Buffer}
     * @readonly
     */
    get uvBuffer(): Buffer_2;
    /**
     * To change mesh vertices, change its uvBuffer data and increment its _updateID.
     * Incrementing _updateID is optional because most of Mesh objects do it anyway.
     * @member {PIXI.Buffer}
     * @readonly
     */
    get verticesBuffer(): Buffer_2;
    /**
     * Alias for {@link PIXI.Mesh#shader}.
     * @member {PIXI.MeshMaterial}
     */
    set material(value: MeshMaterial);
    get material(): MeshMaterial;
    /**
     * The blend mode to be applied to the Mesh. Apply a value of
     * `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL;
     * @see PIXI.BLEND_MODES
     */
    set blendMode(value: BLEND_MODES);
    get blendMode(): BLEND_MODES;
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
     * The multiply tint applied to the Mesh. This is a hex value. A value of
     * `0xFFFFFF` will remove any tint effect.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    get tint(): number;
    set tint(value: number);
    /**
     * The texture that the Mesh uses.
     *
     * @member {PIXI.Texture}
     */
    get texture(): Texture;
    set texture(value: Texture);
    /**
     * Standard renderer draw.
     * @protected
     * @param {PIXI.Renderer} renderer - Instance to renderer.
     */
    protected _render(renderer: Renderer): void;
    /**
     * Standard non-batching way of rendering.
     * @protected
     * @param {PIXI.Renderer} renderer - Instance to renderer.
     */
    protected _renderDefault(renderer: Renderer): void;
    /**
     * Rendering by using the Batch system.
     * @protected
     * @param {PIXI.Renderer} renderer - Instance to renderer.
     */
    protected _renderToBatch(renderer: Renderer): void;
    /**
     * Updates vertexData field based on transform and vertices
     */
    calculateVertices(): void;
    /**
     * Updates uv field based on from geometry uv's or batchUvs
     */
    calculateUvs(): void;
    /**
     * Updates the bounds of the mesh as a rectangle. The bounds calculation takes the worldTransform into account.
     * there must be a aVertexPosition attribute present in the geometry for bounds to be calculated correctly.
     *
     * @protected
     */
    protected _calculateBounds(): void;
    /**
     * Tests if a point is inside this mesh. Works only for PIXI.DRAW_MODES.TRIANGLES.
     *
     * @param {PIXI.IPointData} point - the point to test
     * @return {boolean} the result of the test
     */
    containsPoint(point: IPointData): boolean;
    /**
     * Destroys the Mesh object.
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all
     *  options have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have
     *  their destroy method called as well. 'options' will be passed on to those calls.
     */
    destroy(options: IDestroyOptions | boolean): void;
    /**
     * The maximum number of vertices to consider batchable. Generally, the complexity
     * of the geometry.
     * @memberof PIXI.Mesh
     * @static
     * @member {number} BATCHABLE_SIZE
     */
    static BATCHABLE_SIZE: number;
}

/**
 * Class controls cache for UV mapping from Texture normal space to BaseTexture normal space.
 *
 * @class
 * @memberof PIXI
 */
export declare class MeshBatchUvs
{
    readonly data: Float32Array;
    uvBuffer: Buffer_2;
    uvMatrix: TextureMatrix;
    private _bufferUpdateId;
    private _textureUpdateId;
    _updateID: number;
    /**
     * @param {PIXI.Buffer} uvBuffer - Buffer with normalized uv's
     * @param {PIXI.TextureMatrix} uvMatrix - Material UV matrix
     */
    constructor(uvBuffer: Buffer_2, uvMatrix: TextureMatrix);
    /**
     * updates
     *
     * @param {boolean} [forceUpdate] - force the update
     */
    update(forceUpdate?: boolean): void;
}

/**
 * Standard 2D geometry used in PixiJS.
 *
 * Geometry can be defined without passing in a style or data if required.
 *
 * ```js
 * const geometry = new PIXI.Geometry();
 *
 * geometry.addAttribute('positions', [0, 0, 100, 0, 100, 100, 0, 100], 2);
 * geometry.addAttribute('uvs', [0,0,1,0,1,1,0,1], 2);
 * geometry.addIndex([0,1,2,1,3,2]);
 *
 * ```
 * @class
 * @memberof PIXI
 * @extends PIXI.Geometry
 */
export declare class MeshGeometry extends Geometry
{
    _updateId: number;
    /**
     * @param {Float32Array|number[]} [vertices] - Positional data on geometry.
     * @param {Float32Array|number[]} [uvs] - Texture UVs.
     * @param {Uint16Array|number[]} [index] - IndexBuffer
     */
    constructor(vertices?: IArrayBuffer, uvs?: IArrayBuffer, index?: IArrayBuffer);
    /**
     * If the vertex position is updated.
     * @member {number}
     * @readonly
     * @private
     */
    get vertexDirtyId(): number;
}

export type MeshMaterial = GlobalMixins.MeshMaterial;

/**
 * Slightly opinionated default shader for PixiJS 2D objects.
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 */
export declare class MeshMaterial extends Shader
{
    readonly uvMatrix: TextureMatrix;
    batchable: boolean;
    pluginName: string;
    _tintRGB: number;
    private _colorDirty;
    private _alpha;
    private _tint;
    /**
     * @param {PIXI.Texture} uSampler - Texture that material uses to render.
     * @param {object} [options] - Additional options
     * @param {number} [options.alpha=1] - Default alpha.
     * @param {number} [options.tint=0xFFFFFF] - Default tint.
     * @param {string} [options.pluginName='batch'] - Renderer plugin for batching.
     * @param {PIXI.Program} [options.program=0xFFFFFF] - Custom program.
     * @param {object} [options.uniforms] - Custom uniforms.
     */
    constructor(uSampler: Texture, options?: IMeshMaterialOptions);
    /**
     * Reference to the texture being rendered.
     * @member {PIXI.Texture}
     */
    get texture(): Texture;
    set texture(value: Texture);
    /**
     * This gets automatically set by the object using this.
     *
     * @default 1
     * @member {number}
     */
    set alpha(value: number);
    get alpha(): number;
    /**
     * Multiply tint for the material.
     * @member {number}
     * @default 0xFFFFFF
     */
    set tint(value: number);
    get tint(): number;
    /**
     * Gets called automatically by the Mesh. Intended to be overridden for custom
     * MeshMaterial objects.
     */
    update(): void;
}

export { };
