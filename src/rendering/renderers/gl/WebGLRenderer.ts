import { extensions, ExtensionType } from '../../../extensions/Extensions';
import { SharedDefaultRendererOptions, SharedRendererExtensions } from '../shared/system/SharedSystems';
import { SystemManager } from '../shared/system/SystemManager';
import { getCanvasTexture } from '../shared/texture/utils/getCanvasTexture';
import { GlContextSystem } from './context/GlContextSystem';
import { WebGLSystemExtensions } from './WebGLSystems';

import type { ExtensionFormat } from '../../../extensions/Extensions';
import type { ICanvas } from '../../../settings/adapter/ICanvas';
import type { Container } from '../../scene/Container';
import type { RenderSurface } from '../gpu/renderTarget/GpuRenderTargetSystem';
import type { PipeConstructor } from '../shared/instructions/RenderPipe';
import type { ISystemConstructor } from '../shared/system/ISystem';
import type { SharedRendererOptions } from '../shared/system/SharedSystems';
import type { ContextSystemOptions } from './context/GlContextSystem';
import type { GlRenderingContext } from './context/GlRenderingContext';
import type { GLRenderPipes, GLRenderSystems } from './WebGLSystems';

/**
 * Renderer options supplied to constructor.
 * @memberof PIXI
 * @see PIXI.settings.GL_RENDER_OPTIONS
 */
export type WebGLRendererOptions = PixiMixins.WebGLRendererOptions & SharedRendererOptions & ContextSystemOptions;

export interface WebGLRenderer extends SystemManager<WebGLRenderer>, GLRenderSystems
{
    readonly renderPipes: GLRenderPipes
}

export class WebGLRenderer extends SystemManager<WebGLRenderer> implements GLRenderSystems
{
    type = 'webgl';

    public gl: GlRenderingContext;

    public readonly renderPipes = {} as GLRenderPipes;

    globalUniformBindGroup: GPUBindGroup;

    options: WebGLRendererOptions;

    private _lastObjectRendered: Container;
    // TODO: not implemented
    // private _renderingToScreen = true;

    constructor()
    {
        super();

        const systemConfig = {
            runners: ['init', 'destroy', 'contextChange', 'reset', 'update', 'postrender', 'prerender', 'resize'],
            systems: WebGLRenderer.__systems,
            pipes: WebGLRenderer.__pipes,
        };

        const pipeConfig = {
            ...WebGLRenderer.__pipesAdaptors
        };

        Object.keys(systemConfig.pipes).forEach((key) =>
        {
            const Pipe = systemConfig.pipes[key];
            const Adaptor = pipeConfig[key]?.adaptor;

            const k = key as keyof GLRenderPipes;

            if (Adaptor)
            {
                // sorry typescript..
                this.renderPipes[k] = new Pipe(this, new Adaptor()) as any;
            }
            else
            {
                this.renderPipes[k] = new Pipe(this) as any;
            }
        });

        this.setup(systemConfig);
    }

    /**
     * Resizes the WebGL view to the specified width and height.
     * @param desiredScreenWidth - The desired width of the screen.
     * @param desiredScreenHeight - The desired height of the screen.
     * @param resolution
     */
    resize(desiredScreenWidth: number, desiredScreenHeight: number, resolution?: number): void
    {
        this.view.resizeView(desiredScreenWidth, desiredScreenHeight, resolution);
    }

    async init(options: Partial<WebGLRendererOptions>)
    {
        // Add the default render options
        options = Object.assign({}, {
            ...SharedDefaultRendererOptions,
            ...GlContextSystem.defaultOptions,
        }, options);
        this.options = options as WebGLRendererOptions;
        this.startup.run(this.options);
    }

    render(container: Container, target?: RenderSurface)
    {
        if (target instanceof HTMLCanvasElement)
        {
            target = getCanvasTexture(target as ICanvas);
        }

        if (!target)
        {
            // returns a texture to render too if set,
            // will return `this.view.texture` if its not active.
            target = this.backBuffer.renderToBackBuffer(this.view.texture);
        }

        this.runners.prerender.emit();

        this.renderTarget.start(target, true, this.background.colorRgba);

        this.layer.render(container);
        this.backBuffer.presentBackBuffer();
        this.renderTarget.finish();

        this._lastObjectRendered = container;

        this.runners.postrender.emit();
    }

    /** The resolution / device pixel ratio of the renderer. */
    get resolution(): number
    {
        return this.view.resolution;
    }

    set resolution(value: number)
    {
        this.view.resolution = value;
    }

    get width(): number
    {
        return this.view.texture.frameWidth;
    }

    get height(): number
    {
        return this.view.texture.frameHeight;
    }

    // set resolution(value: number)
    // {
    //     this.view.resolution = value;
    //     this.runners.resolutionChange.emit(value);
    // }

    // NOTE: this was `view` in v7
    /** The canvas element that everything is drawn to.*/
    get canvas(): ICanvas
    {
        return this.view.element;
    }

    // TODO: currently doesn't exist
    // /**
    //  * Measurements of the screen. (0, 0, screenWidth, screenHeight).
    //  *
    //  * Its safe to use as filterArea or hitArea for the whole stage.
    //  * @member {PIXI.Rectangle}
    //  */
    // get screen(): Rectangle
    // {
    //     return this.view.screen;
    // }

    /**
     * the last object rendered by the renderer. Useful for other plugins like interaction managers
     * @readonly
     */
    get lastObjectRendered(): Container
    {
        return this._lastObjectRendered;
    }

    /**
     * Flag if we are rendering to the screen vs renderTexture
     * @readonly
     * @default true
     */
    get renderingToScreen(): boolean
    {
        return true; // TODO: this._renderingToScreen;
    }

    /** When logging Pixi to the console, this is the name we will show */
    get rendererLogId(): string
    {
        return `WebGL ${this.context.webGLVersion}`;
    }

    /**
     * The collection of installed systems.
     * @private
     */
    static readonly __systems: {name: string, value: ISystemConstructor}[] = [];
    /**
     * The collection of installed pipes.
     * @private
     */
    static readonly __pipes: Record<string, PipeConstructor<WebGLRenderer>> = {};
    /**
     * The collection of installed pipe adaptors.
     * @private
     */
    static readonly __pipesAdaptors: Record<string, any> = {};
}

extensions.handleByNamedList(ExtensionType.WebGLRendererSystem, WebGLRenderer.__systems);
extensions.handleByMap(ExtensionType.WebGLRendererPipes, WebGLRenderer.__pipes);
extensions.handle(ExtensionType.WebGLRendererPipesAdaptor, (extension: ExtensionFormat) =>
{
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    WebGLRenderer.__pipesAdaptors[extension.name!] = { adaptor: extension.ref };
}, (extension: ExtensionFormat) =>
{
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    delete WebGLRenderer.__pipesAdaptors[extension.name!];
});
extensions.add(
    ...SharedRendererExtensions,
    ...WebGLSystemExtensions
);
