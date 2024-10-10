import { warn } from '../../../utils/logging/warn';
import { Bounds } from '../../container/bounds/Bounds';
import { ViewContainer } from '../../view/View';
import { particleData } from './particleData';

import type { Instruction } from '../../../rendering/renderers/shared/instructions/Instruction';
import type { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { Container, ContainerChild, ContainerOptions } from '../../container/Container';
import type { DestroyOptions } from '../../container/destroyTypes';
import type { IParticle } from './Particle';
import type { ParticleRendererProperty } from './particleData';

const emptyBounds = new Bounds(0, 0, 0, 0);

/**
 * Represents the properties of a particle that can be dynamically updated.
 * @property {boolean} [vertices] - Indicates if vertices are dynamic.
 * @property {boolean} [position] - Indicates if position is dynamic.
 * @property {boolean} [rotation] - Indicates if rotation is dynamic.
 * @property {boolean} [uvs] - Indicates if UVs are dynamic.
 * @property {boolean} [color] - Indicates if color is dynamic.
 * @memberof scene
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
 * @property {IParticle[]} particles - An array of particles to add to the container.
 * @memberof scene
 */
export interface ParticleContainerOptions extends Omit<ContainerOptions, 'children'>
{
    dynamicProperties?: Record<string, boolean>;
    shader?: Shader;
    roundPixels?: boolean;
    texture?: Texture;
    particles?: IParticle[];
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
 *     container.addParticle(particle);
 * }
 * @memberof scene
 */
export class ParticleContainer extends ViewContainer implements Instruction
{
    /**
     * Defines the default options for creating a ParticleContainer.
     * @property {Record<string, boolean>} dynamicProperties - Specifies which properties are dynamic.
     * @property {boolean} roundPixels - Indicates if pixels should be  rounded.
     */
    public static defaultOptions: ParticleContainerOptions = {
        dynamicProperties: {
            vertex: false, // Indicates if vertex positions are dynamic.
            position: true, // Indicates if particle positions are dynamic.
            rotation: false, // Indicates if particle rotations are dynamic.
            uvs: false, // Indicates if UV coordinates are dynamic.
            color: false, // Indicates if particle colors are dynamic.
        },
        roundPixels: false, // Indicates if pixels should be rounded for rendering.
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
    public particleChildren: IParticle[];

    /** The shader used for rendering particles in this ParticleContainer. */
    public shader: Shader;

    /**
     * The texture used for rendering particles in this ParticleContainer.
     * Defaults to the first childs texture if not set
     */
    public texture: Texture;

    /**
     * @param options - The options for creating the sprite.
     */
    constructor(options: ParticleContainerOptions = {})
    {
        options = {
            ...ParticleContainer.defaultOptions,
            ...options,
            dynamicProperties: {
                ...ParticleContainer.defaultOptions.dynamicProperties,
                ...options?.dynamicProperties,
            },
        };

        // split out
        const { dynamicProperties, shader, roundPixels, texture, particles, ...rest } = options;

        super({
            label: 'ParticleContainer',
            ...rest,
        });

        this.texture = texture || null;
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

        this.allowChildren = true;
        this.roundPixels = roundPixels ?? false;

        this.particleChildren = particles ?? [];
    }

    /**
     * Adds one or more particles to the container.
     *
     * Multiple items can be added like so: `myContainer.addParticle(thingOne, thingTwo, thingThree)`
     * @param {...IParticle} children - The Particle(s) to add to the container
     * @returns {IParticle} - The first child that was added.
     */
    public addParticle(...children: IParticle[]): IParticle
    {
        for (let i = 0; i < children.length; i++)
        {
            this.particleChildren.push(children[i]);
        }

        this.onViewUpdate();

        return children[0];
    }

    /**
     * Removes one or more particles from the container.
     * @param {...IParticle} children - The Particle(s) to remove
     * @returns {IParticle} The first child that was removed.
     */
    public removeParticle(...children: IParticle[]): IParticle
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
            renderGroup.onChildViewUpdate(this as unknown as Container);
        }
    }

    /** The local bounds of the view. */
    public override get bounds(): Bounds
    {
        warn(
            // eslint-disable-next-line max-len
            'ParticleContainer does not calculated bounds as it would slow things down, its up to you to set this via the boundsArea property',
        );

        return emptyBounds;
    }

    /** @private */
    protected override updateBounds(): void { /* empty */ }

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

        const destroyTexture = typeof options === 'boolean' ? options : options?.texture;

        if (destroyTexture)
        {
            const destroyTextureSource = typeof options === 'boolean' ? options : options?.textureSource;

            const texture = this.texture ?? this.particleChildren[0]?.texture;

            if (texture)
            {
                texture.destroy(destroyTextureSource);
            }
        }

        this.texture = null;
        this.shader?.destroy();
    }

    /**
     * Removes all particles from this container that are within the begin and end indexes.
     * @param beginIndex - The beginning position.
     * @param endIndex - The ending position. Default value is size of the container.
     * @returns - List of removed particles
     */
    public removeParticles(beginIndex?: number, endIndex?: number)
    {
        const children = this.particleChildren.splice(beginIndex, endIndex);

        this.onViewUpdate();

        return children;
    }

    /**
     * Removes a particle from the specified index position.
     * @param index - The index to get the particle from
     * @returns The particle that was removed.
     */
    public removeParticleAt<U extends IParticle>(index: number): U
    {
        const child = this.particleChildren.splice(index, 1);

        this.onViewUpdate();

        return child[0] as U;
    }

    /**
     * Adds a particle to the container at a specified index. If the index is out of bounds an error will be thrown.
     * If the particle is already in this container, it will be moved to the specified index.
     * @param {Container} child - The particle to add.
     * @param {number} index - The absolute index where the particle will be positioned at the end of the operation.
     * @returns {Container} The particle that was added.
     */
    public addParticleAt<U extends IParticle>(child: U, index: number): U
    {
        this.particleChildren.splice(index, 0, child);

        this.onViewUpdate();

        return child;
    }

    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error. Please use `ParticleContainer.addParticle()` instead.
     * @param {...any} _children
     * @throws {Error} Always throws an error as this method is not available.
     */
    public override addChild<U extends ContainerChild[]>(..._children: U): U[0]
    {
        throw new Error(
            'ParticleContainer.addChild() is not available. Please use ParticleContainer.addParticle()',
        );
    }
    /**
     * This method is not available in ParticleContainer.
     * Calling this method will throw an error. Please use `ParticleContainer.removeParticle()` instead.
     * @param {...any} _children
     * @throws {Error} Always throws an error as this method is not available.
     */
    public override removeChild<U extends ContainerChild[]>(..._children: U): U[0]
    {
        throw new Error(
            'ParticleContainer.removeChild() is not available. Please use ParticleContainer.removeParticle()',
        );
    }
    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error. Please use `ParticleContainer.removeParticles()` instead.
     * @param {number} [_beginIndex]
     * @param {number} [_endIndex]
     * @throws {Error} Always throws an error as this method is not available.
     */
    public override removeChildren(_beginIndex?: number, _endIndex?: number): ContainerChild[]
    {
        throw new Error(
            'ParticleContainer.removeChildren() is not available. Please use ParticleContainer.removeParticles()',
        );
    }
    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error. Please use `ParticleContainer.removeParticleAt()` instead.
     * @param {number} _index
     * @throws {Error} Always throws an error as this method is not available.
     */
    public override removeChildAt<U extends ContainerChild>(_index: number): U
    {
        throw new Error(
            'ParticleContainer.removeChildAt() is not available. Please use ParticleContainer.removeParticleAt()',
        );
    }
    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error. Please use `ParticleContainer.getParticleAt()` instead.
     * @param {number} _index
     * @throws {Error} Always throws an error as this method is not available.
     */
    public override getChildAt<U extends ContainerChild>(_index: number): U
    {
        throw new Error(
            'ParticleContainer.getChildAt() is not available. Please use ParticleContainer.getParticleAt()',
        );
    }
    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error. Please use `ParticleContainer.setParticleIndex()` instead.
     * @param {ContainerChild} _child
     * @param {number} _index
     * @throws {Error} Always throws an error as this method is not available.
     */
    public override setChildIndex(_child: ContainerChild, _index: number): void
    {
        throw new Error(
            'ParticleContainer.setChildIndex() is not available. Please use ParticleContainer.setParticleIndex()',
        );
    }
    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error. Please use `ParticleContainer.getParticleIndex()` instead.
     * @param {ContainerChild} _child
     * @throws {Error} Always throws an error as this method is not available.
     */
    public override getChildIndex(_child: ContainerChild): number
    {
        throw new Error(
            'ParticleContainer.getChildIndex() is not available. Please use ParticleContainer.getParticleIndex()',
        );
    }
    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error. Please use `ParticleContainer.addParticleAt()` instead.
     * @param {ContainerChild} _child
     * @param {number} _index
     * @throws {Error} Always throws an error as this method is not available.
     */
    public override addChildAt<U extends ContainerChild>(_child: U, _index: number): U
    {
        throw new Error(
            'ParticleContainer.addChildAt() is not available. Please use ParticleContainer.addParticleAt()',
        );
    }
    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error. Please use `ParticleContainer.swapParticles()` instead.
     * @param {ContainerChild} _child
     * @param {ContainerChild} _child2
     */
    public override swapChildren<U extends ContainerChild>(_child: U, _child2: U): void
    {
        throw new Error(
            'ParticleContainer.swapChildren() is not available. Please use ParticleContainer.swapParticles()',
        );
    }

    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error.
     * @param _child - The child to reparent
     * @throws {Error} Always throws an error as this method is not available.
     */
    public override reparentChild(..._child: ContainerChild[]): any
    {
        throw new Error('ParticleContainer.reparentChild() is not available with the particle container');
    }

    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error.
     * @param _child - The child to reparent
     * @param _index - The index to reparent the child to
     * @throws {Error} Always throws an error as this method is not available.
     */
    public override reparentChildAt(_child: ContainerChild, _index: number): any
    {
        throw new Error('ParticleContainer.reparentChildAt() is not available with the particle container');
    }
}
