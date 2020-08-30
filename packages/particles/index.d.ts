import type { BaseTexture } from '@pixi/core';
import { BLEND_MODES } from '@pixi/constants';
import { Buffer as Buffer_2 } from '@pixi/core';
import { Container } from '@pixi/display';
import type { DisplayObject } from '@pixi/display';
import { Geometry } from '@pixi/core';
import type { IDestroyOptions } from '@pixi/display';
import { Matrix } from '@pixi/math';
import { ObjectRenderer } from '@pixi/core';
import type { Renderer } from '@pixi/core';
import { Shader } from '@pixi/core';
import { State } from '@pixi/core';
import { TYPES } from '@pixi/constants';

export declare interface IParticleProperties {
    vertices?: boolean;
    position?: boolean;
    rotation?: boolean;
    uvs?: boolean;
    tint?: boolean;
    alpha?: boolean;
    scale?: boolean;
}

export declare interface IParticleRendererProperty {
    attributeName: string;
    size: number;
    type?: TYPES;
    uploadFunction: (...params: any[]) => any;
    offset: number;
}

/**
 * The particle buffer manages the static and dynamic buffers for a particle container.
 *
 * @class
 * @private
 * @memberof PIXI
 */
declare class ParticleBuffer
{
    geometry: Geometry;
    staticStride: number;
    staticBuffer: Buffer_2;
    staticData: Float32Array;
    staticDataUint32: Uint32Array;
    dynamicStride: number;
    dynamicBuffer: Buffer_2;
    dynamicData: Float32Array;
    dynamicDataUint32: Uint32Array;
    _updateID: number;
    indexBuffer: Buffer_2;
    private size;
    private dynamicProperties;
    private staticProperties;
    /**
     * @private
     * @param {object} properties - The properties to upload.
     * @param {boolean[]} dynamicPropertyFlags - Flags for which properties are dynamic.
     * @param {number} size - The size of the batch.
     */
    constructor(properties: IParticleRendererProperty[], dynamicPropertyFlags: boolean[], size: number);
    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */
    private initBuffers;
    /**
     * Uploads the dynamic properties.
     *
     * @private
     * @param {PIXI.DisplayObject[]} children - The children to upload.
     * @param {number} startIndex - The index to start at.
     * @param {number} amount - The number to upload.
     */
    uploadDynamic(children: DisplayObject[], startIndex: number, amount: number): void;
    /**
     * Uploads the static properties.
     *
     * @private
     * @param {PIXI.DisplayObject[]} children - The children to upload.
     * @param {number} startIndex - The index to start at.
     * @param {number} amount - The number to upload.
     */
    uploadStatic(children: DisplayObject[], startIndex: number, amount: number): void;
    /**
     * Destroys the ParticleBuffer.
     *
     * @private
     */
    destroy(): void;
}

/**
 * The ParticleContainer class is a really fast version of the Container built solely for speed,
 * so use when you need a lot of sprites or particles.
 *
 * The tradeoff of the ParticleContainer is that most advanced functionality will not work.
 * ParticleContainer implements the basic object transform (position, scale, rotation)
 * and some advanced functionality like tint (as of v4.5.6).
 *
 * Other more advanced functionality like masking, children, filters, etc will not work on sprites in this batch.
 *
 * It's extremely easy to use:
 * ```js
 * let container = new ParticleContainer();
 *
 * for (let i = 0; i < 100; ++i)
 * {
 *     let sprite = PIXI.Sprite.from("myImage.png");
 *     container.addChild(sprite);
 * }
 * ```
 *
 * And here you have a hundred sprites that will be rendered at the speed of light.
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
export declare class ParticleContainer extends Container
{
    readonly blendMode: BLEND_MODES;
    autoResize: boolean;
    roundPixels: boolean;
    baseTexture: BaseTexture;
    tintRgb: Float32Array;
    _maxSize: number;
    _buffers: ParticleBuffer[];
    _batchSize: number;
    _properties: boolean[];
    _bufferUpdateIDs: number[];
    _updateID: number;
    private _tint;
    /**
     * @param {number} [maxSize=1500] - The maximum number of particles that can be rendered by the container.
     *  Affects size of allocated buffers.
     * @param {object} [properties] - The properties of children that should be uploaded to the gpu and applied.
     * @param {boolean} [properties.vertices=false] - When true, vertices be uploaded and applied.
     *                  if sprite's ` scale/anchor/trim/frame/orig` is dynamic, please set `true`.
     * @param {boolean} [properties.position=true] - When true, position be uploaded and applied.
     * @param {boolean} [properties.rotation=false] - When true, rotation be uploaded and applied.
     * @param {boolean} [properties.uvs=false] - When true, uvs be uploaded and applied.
     * @param {boolean} [properties.tint=false] - When true, alpha and tint be uploaded and applied.
     * @param {number} [batchSize=16384] - Number of particles per batch. If less than maxSize, it uses maxSize instead.
     * @param {boolean} [autoResize=false] - If true, container allocates more batches in case
     *  there are more than `maxSize` particles.
     */
    constructor(maxSize: number, properties: IParticleProperties, batchSize?: number, autoResize?: boolean);
    /**
     * Sets the private properties array to dynamic / static based on the passed properties object
     *
     * @param {object} properties - The properties to be uploaded
     */
    setProperties(properties: IParticleProperties): void;
    /**
     * Updates the object transform for rendering
     *
     * @private
     */
    updateTransform(): void;
    /**
     * The tint applied to the container. This is a hex value.
     * A value of 0xFFFFFF will remove any tint effect.
     ** IMPORTANT: This is a WebGL only feature and will be ignored by the canvas renderer.
     * @member {number}
     * @default 0xFFFFFF
     */
    get tint(): number;
    set tint(value: number);
    /**
     * Renders the container using the WebGL renderer
     *
     * @private
     * @param {PIXI.Renderer} renderer - The webgl renderer
     */
    render(renderer: Renderer): void;
    /**
     * Set the flag that static data should be updated to true
     *
     * @private
     * @param {number} smallestChildIndex - The smallest child index
     */
    protected onChildrenChange(smallestChildIndex: number): void;
    dispose(): void;
    /**
     * Destroys the container
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their
     *  destroy method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Only used for child Sprites if options.children is set to true
     *  Should it destroy the texture of the child sprite
     * @param {boolean} [options.baseTexture=false] - Only used for child Sprites if options.children is set to true
     *  Should it destroy the base texture of the child sprite
     */
    destroy(options: IDestroyOptions | boolean): void;
}

/**
 * Renderer for Particles that is designer for speed over feature set.
 *
 * @class
 * @memberof PIXI
 */
export declare class ParticleRenderer extends ObjectRenderer
{
    readonly state: State;
    shader: Shader;
    tempMatrix: Matrix;
    properties: IParticleRendererProperty[];
    /**
     * @param {PIXI.Renderer} renderer - The renderer this sprite batch works for.
     */
    constructor(renderer: Renderer);
    /**
     * Renders the particle container object.
     *
     * @param {PIXI.ParticleContainer} container - The container to render using this ParticleRenderer
     */
    render(container: ParticleContainer): void;
    /**
     * Creates one particle buffer for each child in the container we want to render and updates internal properties
     *
     * @param {PIXI.ParticleContainer} container - The container to render using this ParticleRenderer
     * @return {PIXI.ParticleBuffer[]} The buffers
     * @private
     */
    private generateBuffers;
    /**
     * Creates one more particle buffer, because container has autoResize feature
     *
     * @param {PIXI.ParticleContainer} container - The container to render using this ParticleRenderer
     * @return {PIXI.ParticleBuffer} generated buffer
     * @private
     */
    private _generateOneMoreBuffer;
    /**
     * Uploads the vertices.
     *
     * @param {PIXI.DisplayObject[]} children - the array of display objects to render
     * @param {number} startIndex - the index to start from in the children array
     * @param {number} amount - the amount of children that will have their vertices uploaded
     * @param {number[]} array - The vertices to upload.
     * @param {number} stride - Stride to use for iteration.
     * @param {number} offset - Offset to start at.
     */
    uploadVertices(children: DisplayObject[], startIndex: number, amount: number, array: number[], stride: number, offset: number): void;
    /**
     * Uploads the position.
     *
     * @param {PIXI.DisplayObject[]} children - the array of display objects to render
     * @param {number} startIndex - the index to start from in the children array
     * @param {number} amount - the amount of children that will have their positions uploaded
     * @param {number[]} array - The vertices to upload.
     * @param {number} stride - Stride to use for iteration.
     * @param {number} offset - Offset to start at.
     */
    uploadPosition(children: DisplayObject[], startIndex: number, amount: number, array: number[], stride: number, offset: number): void;
    /**
     * Uploads the rotation.
     *
     * @param {PIXI.DisplayObject[]} children - the array of display objects to render
     * @param {number} startIndex - the index to start from in the children array
     * @param {number} amount - the amount of children that will have their rotation uploaded
     * @param {number[]} array - The vertices to upload.
     * @param {number} stride - Stride to use for iteration.
     * @param {number} offset - Offset to start at.
     */
    uploadRotation(children: DisplayObject[], startIndex: number, amount: number, array: number[], stride: number, offset: number): void;
    /**
     * Uploads the Uvs
     *
     * @param {PIXI.DisplayObject[]} children - the array of display objects to render
     * @param {number} startIndex - the index to start from in the children array
     * @param {number} amount - the amount of children that will have their rotation uploaded
     * @param {number[]} array - The vertices to upload.
     * @param {number} stride - Stride to use for iteration.
     * @param {number} offset - Offset to start at.
     */
    uploadUvs(children: DisplayObject[], startIndex: number, amount: number, array: number[], stride: number, offset: number): void;
    /**
     * Uploads the tint.
     *
     * @param {PIXI.DisplayObject[]} children - the array of display objects to render
     * @param {number} startIndex - the index to start from in the children array
     * @param {number} amount - the amount of children that will have their rotation uploaded
     * @param {number[]} array - The vertices to upload.
     * @param {number} stride - Stride to use for iteration.
     * @param {number} offset - Offset to start at.
     */
    uploadTint(children: DisplayObject[], startIndex: number, amount: number, array: number[], stride: number, offset: number): void;
    /**
     * Destroys the ParticleRenderer.
     */
    destroy(): void;
}

export { };
