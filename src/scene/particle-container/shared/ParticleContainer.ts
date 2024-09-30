import { warn } from '../../../utils';
import { ViewContainer } from '../../view/View';
import { particleData } from './particleData';

import type { Instruction } from '../../../rendering/renderers/shared/instructions/Instruction';
import type { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { Bounds, BoundsData } from '../../container/bounds/Bounds';
import type { ContainerOptions } from '../../container/Container';
import type { DestroyOptions } from '../../container/destroyTypes';
import type { IParticle, Particle } from './Particle';
import type { ParticleRendererProperty } from './particleData';

const emptyBounds: BoundsData = {
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
};

/**
 * Represents the properties of a particle that can be dynamically updated.
 * @property {boolean} [vertices] - Indicates if vertices are dynamic.
 * @property {boolean} [position] - Indicates if position is dynamic.
 * @property {boolean} [rotation] - Indicates if rotation is dynamic.
 * @property {boolean} [uvs] - Indicates if UVs are dynamic.
 * @property {boolean} [color] - Indicates if color is dynamic.
 */
export interface ParticleProperties
{
    vertex?: boolean;
    position?: boolean;
    rotation?: boolean;
    uvs?: boolean;
    color?: boolean;
}

/**
 * Options for the ParticleContainer constructor.
 * @extends ContainerOptions
 * @property {Record<string, boolean>} dynamicProperties - Specifies which properties are dynamic.
 * @property {Shader} shader - The shader to use for rendering.
 * @property {boolean} roundPixels - Indicates if pixels should be rounded.
 * @property {Texture} texture - The texture to use for rendering - if not provided the texture of the first child is used.
 */
export interface ParticleContainerOptions extends ContainerOptions
{
    dynamicProperties?: Record<string, boolean>;
    shader?: Shader;
    roundPixels?: boolean;
    texture?: Texture;
    // TODO bounds //
}

/**
 * The ParticleContainer class is a highly optimized container that can render 1000s or particles at great speed.
 *
 * A ParticleContainer is specialized in that it can only contain and render particles. Particles are
 * lightweight objects that use minimal memory, which helps boost performance.
 *
 * It can render particles EXTREMELY fast!
 *
 * The tradeoff of using a ParticleContainer is that most advanced functionality is unavailable. Particles are simple
 * and cannot have children, filters, masks, etc. They possess only the basic properties: position, scale, rotation,
 * and color.
 *
 * All particles must share the same texture source (using something like a sprite sheet works well here).
 *
 * When creating a ParticleContainer, a developer can specify which of these properties are static and which are dynamic.
 * - Static properties are only updated when you add or remove a child, or when the `update` function is called.
 * - Dynamic properties are updated every frame.
 *
 * It is up to the developer to specify which properties are static and which are dynamic. Generally, the more static
 * properties you have (i.e., those that do not change per frame), the faster the rendering.
 *
 * If the developer modifies the children order or any static properties of the particle, they must call the `update` method.
 *
 * By default, only the `position` property is set to dynamic, which makes rendering very fast!
 *
 * Developers can also provide a custom shader to the particle container, allowing them to render particles in a custom way.
 *
 * To help with performance, the particle containers bounds are not calculated.
 * It's up to the developer to set the boundsArea property.
 *
 * It's extremely easy to use. Below is an example of rendering thousands of sprites at lightning speed.
 *
 * --------- EXPERIMENTAL ---------
 *
 * This is a new API, things may change and it may not work as expected.
 * We want to hear your feedback as we go!
 *
 * --------------------------------
 * @example
 * import { ParticleContainer, Particle } from 'pixi.js';
 *
 * const container = new ParticleContainer();
 *
 * for (let i = 0; i < 100; ++i)
 * {
 *     let particle = new Particle(texture);
 *     container.addChild(particle);
 * }
 * @memberof PIXI
 */
export class ParticleContainer extends ViewContainer implements Instruction
{
    /**
     * Defines the default options for creating a ParticleContainer.
     * @property {Record<string, boolean>} dynamicProperties - Specifies which properties are dynamic.
     * @property {boolean} roundPixels - Indicates if pixels should be rounded.
     */
    public static defaultOptions: ParticleContainerOptions = {
        dynamicProperties: {
            vertex: false, // Indicates if vertex positions are dynamic.
            position: true, // Indicates if particle positions are dynamic.
            rotation: false, // Indicates if particle rotations are dynamic.
            uvs: false, // Indicates if UV coordinates are dynamic.
            color: false, // Indicates if particle colors are dynamic.
        },
        roundPixels: false // Indicates if pixels should be rounded for rendering.
    };

    /** The unique identifier for the render pipe of this ParticleContainer. */
    public override readonly renderPipeId: string = 'particle';

    public batched = false;

    /**
     * A record of properties and their corresponding ParticleRendererProperty.
     * @internal
     */
    public _properties: Record<string, ParticleRendererProperty>;

    /** Indicates if the children of this ParticleContainer have changed and need to be updated. */
    public _childrenDirty = false;

    /**
     * An array of particles that are children of this ParticleContainer.
     * it can be modified directly, after which the 'update' method must be called.
     * to ensure the container is rendered correctly.
     */
    public particleChildren: IParticle[] = [];

    /** The shader used for rendering particles in this ParticleContainer. */
    public shader: Shader;

    public texture: Texture;

    /**
     * @param options - The options for creating the sprite.
     */
    constructor(options: ParticleContainerOptions = {})
    {
        options = {
            ...ParticleContainer.defaultOptions,
            ...options, dynamicProperties: {
                ...ParticleContainer.defaultOptions.dynamicProperties,
                ...options?.dynamicProperties
            }
        };

        // split out
        const { dynamicProperties, shader, roundPixels, ...rest } = options;

        super({
            label: 'ParticleContainer',
            ...rest
        });

        this.shader = shader;

        this._properties = {};

        for (const key in particleData)
        {
            const property = particleData[key];
            const dynamic = dynamicProperties[key];

            this._properties[key] = {
                ...property,
                dynamic,
            };
        }

        this.allowChildren = false;
        this.roundPixels = roundPixels ?? false;
    }

    public override addChild<IParticle>(...children: IParticle[]): IParticle
    {
        for (let i = 0; i < children.length; i++)
        {
            this.particleChildren.push(children[i] as IParticle);
        }

        this.onViewUpdate();

        return children[0];
    }

    // TODO implement!
    public override removeChild<IParticle>(...children: IParticle[]): IParticle
    {
        let didRemove = false;

        for (let i = 0; i < children.length; i++)
        {
            const index = this.particleChildren.indexOf(children[i] as IParticle);

            if (index > -1)
            {
                this.particleChildren.splice(index, 1);
                didRemove = true;
            }
        }

        if (didRemove) this.onViewUpdate();

        return children[0];
    }

    /**
     * Updates the particle container.
     * Please call this when you modify the particleChildren array.
     * or any static properties of the particles.
     */
    public update()
    {
        this._childrenDirty = true;
    }

    public override onViewUpdate()
    {
        this._didViewChangeTick++;

        this._childrenDirty = true;
        this._boundsDirty = true;

        if (this.didViewUpdate) return;
        this.didViewUpdate = true;

        // TODO remove this! i don't thinks this is needed!
        const renderGroup = this.renderGroup || this.parentRenderGroup;

        if (renderGroup)
        {
            renderGroup.onChildViewUpdate(this);
        }
    }

    public get bounds(): BoundsData
    {
        // eslint-disable-next-line max-len
        console.warn('ParticleContainer does not calculated bounds as it would slow things down, its up to you to set this via the boundsArea property');

        return emptyBounds;
    }

    public addBounds(_bounds: Bounds): void
    {
        // eslint-disable-next-line max-len
        console.warn('ParticleContainer does not calculated bounds as it would slow things down, its up to you to set this via the boundsArea property');
    }

    /**
     * Destroys this sprite renderable and optionally its texture.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the renderable as well
     * @param {boolean} [options.textureSource=false] - Should it destroy the textureSource of the renderable as well
     */
    public override destroy(options: DestroyOptions = false)
    {
        super.destroy(options);
    }

    // additional children methods

    public removeChildren(beginIndex?: number, endIndex?: number)
    {
        const children = this.particleChildren.splice(beginIndex, endIndex);

        this.onViewUpdate();

        return children;
    }

    public removeChildAt(index: number)
    {
        const child = this.particleChildren.splice(index, 1);

        this.onViewUpdate();

        return child;
    }

    public getChildAt(index: number)
    {
        return this.particleChildren[index];
    }

    public setChildIndex(child: Particle, index: number)
    {
        const _index = this.particleChildren.indexOf(child);

        this.particleChildren.splice(_index, 1);
        this.particleChildren.splice(index, 0, child);

        this.onViewUpdate();

        return child;
    }

    public getChildIndex(child: Particle)
    {
        return this.particleChildren.indexOf(child);
    }

    public addChildAt(child: Particle, index: number)
    {
        this.particleChildren.splice(index, 0, child);

        this.onViewUpdate();

        return child;
    }

    public swapChildren(child: Particle, child2: Particle)
    {
        const index = this.particleChildren.indexOf(child);
        const index2 = this.particleChildren.indexOf(child2);

        this.particleChildren[index] = child2;
        this.particleChildren[index2] = child;

        this.onViewUpdate();

        return child;
    }

    public reparentChild(child: Particle)
    {
        warn('ParticleContainer.reparentChild() is not available with the particle container');

        return child;
    }

    public reparentChildAt(child: Particle, _index: number)
    {
        warn('ParticleContainer.reparentChildAt() is not available with the particle container');

        return child;
    }
}

