import { ExtensionType } from '../../../../extensions/Extensions';
import { cleanArray, cleanHash } from '../../../../utils/data/clean';

import type { Container } from '../../../../scene/container/Container';
import type { Renderer } from '../../types';
import type { InstructionSet } from '../instructions/InstructionSet';
import type { RenderPipe } from '../instructions/RenderPipe';
import type { Renderable } from '../Renderable';
import type { System } from '../system/System';

/**
 * Options for the {@link RenderableGCSystem}.
 * @memberof rendering
 * @property {boolean} [renderableGCActive=true] - If set to true, this will enable the garbage collector on the renderables.
 * @property {number} [renderableGCAMaxIdle=60000] -
 * The maximum idle frames before a texture is destroyed by garbage collection.
 * @property {number} [renderableGCCheckCountMax=60000] - time between two garbage collections.
 */
export interface RenderableGCSystemOptions
{
    /**
     * If set to true, this will enable the garbage collector on the GPU.
     * @default true
     * @memberof rendering.SharedRendererOptions
     */
    renderableGCActive: boolean;
    /**
     * The maximum idle frames before a texture is destroyed by garbage collection.
     * @default 60 * 60
     * @memberof rendering.SharedRendererOptions
     */
    renderableGCMaxUnusedTime: number;
    /**
     * Frames between two garbage collections.
     * @default 600
     * @memberof rendering.SharedRendererOptions
     */
    renderableGCFrequency: number;
}
/**
 * System plugin to the renderer to manage renderable garbage collection. When rendering
 * stuff with the renderer will assign resources to each renderable. This could be for example
 * a batchable Sprite, or a text texture. If the renderable is not used for a certain amount of time
 * its resources will be tided up by its render pipe.
 * @memberof rendering
 */
export class RenderableGCSystem implements System<RenderableGCSystemOptions>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
        ],
        name: 'renderableGC',
        priority: 0
    } as const;

    /** default options for the renderableGCSystem */
    public static defaultOptions: RenderableGCSystemOptions = {
        /**
         * If set to true, this will enable the garbage collector on the GPU.
         * @default true
         */
        renderableGCActive: true,
        /**
         * The maximum idle frames before a texture is destroyed by garbage collection.
         * @default 60 * 60
         */
        renderableGCMaxUnusedTime: 60000,
        /**
         * Frames between two garbage collections.
         * @default 600
         */
        renderableGCFrequency: 30000,
    };

    /**
     * Maximum idle frames before a texture is destroyed by garbage collection.
     * @see renderableGCSystem.defaultMaxIdle
     */
    public maxUnusedTime: number;

    private _renderer: Renderer;

    private readonly _managedRenderables: Renderable[] = [];
    private _handler: number;
    private _frequency: number;
    private _now: number;

    private readonly _managedHashes: {context: any, hash: string}[] = [];
    private _hashHandler: number;

    private readonly _managedArrays: {context: any, hash: string}[] = [];
    private _arrayHandler: number;

    /** @param renderer - The renderer this System works for. */
    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public init(options: RenderableGCSystemOptions): void
    {
        options = { ...RenderableGCSystem.defaultOptions, ...options };

        this.maxUnusedTime = options.renderableGCMaxUnusedTime;
        this._frequency = options.renderableGCFrequency;

        this.enabled = options.renderableGCActive;
    }

    get enabled(): boolean
    {
        return !!this._handler;
    }

    set enabled(value: boolean)
    {
        if (this.enabled === value) return;

        if (value)
        {
            this._handler = this._renderer.scheduler.repeat(
                () => this.run(),
                this._frequency,
                false
            );

            this._hashHandler = this._renderer.scheduler.repeat(
                () =>
                {
                    for (const hash of this._managedHashes)
                    {
                        hash.context[hash.hash] = cleanHash(hash.context[hash.hash]);
                    }
                },
                this._frequency
            );

            this._arrayHandler = this._renderer.scheduler.repeat(
                () =>
                {
                    for (const array of this._managedArrays)
                    {
                        cleanArray(array.context[array.hash]);
                    }
                },
                this._frequency
            );
        }
        else
        {
            this._renderer.scheduler.cancel(this._handler);
            this._renderer.scheduler.cancel(this._hashHandler);
            this._renderer.scheduler.cancel(this._arrayHandler);
        }
    }

    public addManagedHash<T>(context: T, hash: string): void
    {
        this._managedHashes.push({ context, hash: hash as string });
    }

    public addManagedArray<T>(context: T, hash: string): void
    {
        this._managedArrays.push({ context, hash: hash as string });
    }

    public prerender(): void
    {
        this._now = performance.now();
    }

    public addRenderable(renderable: Renderable, instructionSet: InstructionSet): void
    {
        if (!this.enabled) return;

        renderable._lastUsed = this._now;

        if (renderable._lastInstructionTick === -1)
        {
            this._managedRenderables.push(renderable);
            renderable.once('destroyed', this._removeRenderable, this);
        }

        renderable._lastInstructionTick = instructionSet.tick;
    }

    /** Runs the scheduled garbage collection */
    public run(): void
    {
        const now = performance.now();

        const managedRenderables = this._managedRenderables;

        const renderPipes = this._renderer.renderPipes;

        let offset = 0;

        for (let i = 0; i < managedRenderables.length; i++)
        {
            const renderable = managedRenderables[i];

            if (renderable === null)
            {
                offset++;
                continue;
            }

            const renderGroup = renderable.renderGroup ?? renderable.parentRenderGroup;
            const currentIndex = renderGroup?.instructionSet?.tick ?? -1;

            if (renderable._lastInstructionTick !== currentIndex && now - renderable._lastUsed > this.maxUnusedTime)
            {
                if (!renderable.destroyed)
                {
                    const rp = renderPipes as unknown as Record<string, RenderPipe>;

                    rp[renderable.renderPipeId].destroyRenderable(renderable);
                }

                // remove from the array as this has been destroyed..
                renderable._lastInstructionTick = -1;
                offset++;
                renderable.off('destroyed', this._removeRenderable, this);
            }
            else
            {
                managedRenderables[i - (offset)] = renderable;
            }
        }

        managedRenderables.length = managedRenderables.length - offset;
    }

    public destroy(): void
    {
        this.enabled = false;
        this._renderer = null as any as Renderer;
        this._managedRenderables.length = 0;
        this._managedHashes.length = 0;
        this._managedArrays.length = 0;
    }

    private _removeRenderable(renderable: Container): void
    {
        const index = this._managedRenderables.indexOf(renderable as Renderable);

        if (index >= 0)
        {
            renderable.off('destroyed', this._removeRenderable, this);
            this._managedRenderables[index] = null;
        }
    }
}
