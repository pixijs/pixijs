import { extensions, ExtensionType } from '../../../extensions/Extensions';
import { GlGraphicsAdaptor } from '../../../scene/graphics/gl/GlGraphicsAdaptor';
import { GlMeshAdaptor } from '../../../scene/mesh/gl/GlMeshAdaptor';
import { GlBatchAdaptor } from '../../batcher/gl/GlBatchAdaptor';
import { AbstractRenderer } from '../shared/system/AbstractRenderer';
import { SharedRenderPipes, SharedSystems } from '../shared/system/SharedSystems';
import { RendererType } from '../types';
import { GlBufferSystem } from './buffer/GlBufferSystem';
import { GlContextSystem } from './context/GlContextSystem';
import { GlGeometrySystem } from './geometry/GlGeometrySystem';
import { GlBackBufferSystem } from './GlBackBufferSystem';
import { GlColorMaskSystem } from './GlColorMaskSystem';
import { GlEncoderSystem } from './GlEncoderSystem';
import { GlStencilSystem } from './GlStencilSystem';
import { GlUboSystem } from './GlUboSystem';
import { GlRenderTargetSystem } from './renderTarget/GlRenderTargetSystem';
import { GlShaderSystem } from './shader/GlShaderSystem';
import { GlUniformGroupSystem } from './shader/GlUniformGroupSystem';
import { GlStateSystem } from './state/GlStateSystem';
import { GlTextureSystem } from './texture/GlTextureSystem';

import type { ICanvas } from '../../../environment/canvas/ICanvas';
import type { PipeConstructor } from '../shared/instructions/RenderPipe';
import type { SharedRendererOptions } from '../shared/system/SharedSystems';
import type { SystemConstructor } from '../shared/system/System';
import type { ExtractRendererOptions, ExtractSystemTypes } from '../shared/system/utils/typeUtils';
import type { GlRenderingContext } from './context/GlRenderingContext';

const DefaultWebGLSystems = [
    ...SharedSystems,
    GlUboSystem,
    GlBackBufferSystem,
    GlContextSystem,
    GlBufferSystem,
    GlTextureSystem,
    GlRenderTargetSystem,
    GlGeometrySystem,
    GlUniformGroupSystem,
    GlShaderSystem,
    GlEncoderSystem,
    GlStateSystem,
    GlStencilSystem,
    GlColorMaskSystem,
];
const DefaultWebGLPipes = [...SharedRenderPipes];
const DefaultWebGLAdapters = [GlBatchAdaptor, GlMeshAdaptor, GlGraphicsAdaptor];

// installed systems will bbe added to this array by the extensions manager..
const systems: { name: string; value: SystemConstructor }[] = [];
const renderPipes: { name: string; value: PipeConstructor }[] = [];
const renderPipeAdaptors: { name: string; value: any }[] = [];

extensions.handleByNamedList(ExtensionType.WebGLSystem, systems);
extensions.handleByNamedList(ExtensionType.WebGLPipes, renderPipes);
extensions.handleByNamedList(ExtensionType.WebGLPipesAdaptor, renderPipeAdaptors);

// add all the default systems as well as any user defined ones from the extensions
extensions.add(...DefaultWebGLSystems, ...DefaultWebGLPipes, ...DefaultWebGLAdapters);

/** The default WebGL renderer, uses WebGL2 contexts. */
type WebGLSystems = ExtractSystemTypes<typeof DefaultWebGLSystems> & PixiMixins.RendererSystems & PixiMixins.WebGLSystems;

/** The default WebGL renderer, uses WebGL2 contexts. */
export type WebGLPipes = ExtractSystemTypes<typeof DefaultWebGLPipes> & PixiMixins.RendererPipes & PixiMixins.WebGLPipes;

/**
 * Options for WebGLRenderer.
 * @memberof rendering
 */
export interface WebGLOptions
    extends
    SharedRendererOptions,
    ExtractRendererOptions<typeof DefaultWebGLSystems>,
    PixiMixins.WebGLOptions {}

/**
 * The default WebGL renderer, uses WebGL2 contexts.
 * @memberof rendering
 */
export interface WebGLRenderer<T extends ICanvas = HTMLCanvasElement>
    extends AbstractRenderer<WebGLPipes, WebGLOptions, T>,
    WebGLSystems {}

/* eslint-disable max-len */
/**
 * The WebGL PixiJS Renderer. This renderer allows you to use the most common graphics API, WebGL (and WebGL2).
 *
 * ```ts
 * // Create a new renderer
 * const renderer = new WebGLRenderer();
 * await renderer.init();
 *
 * // Add the renderer to the stage
 * document.body.appendChild(renderer.canvas);
 *
 * // Create a new stage
 * const stage = new Container();
 *
 * // Render the stage
 * renderer.render(stage);
 * ```
 *
 * You can use {@link rendering.autoDetectRenderer} to create a renderer that will automatically detect the best
 * renderer for the environment.
 *
 *
 * ```ts
 * // Create a new renderer
 * const renderer = await rendering.autoDetectRenderer({
 *    preference:'webgl',
 * });
 * ```
 *
 * The renderer is composed of systems that manage specific tasks. The following systems are added by default
 * whenever you create a WebGL renderer:
 *
 * | WebGL Core Systems                          | Systems that are specific to the WebGL renderer                               |
 * | ------------------------------------------- | ----------------------------------------------------------------------------- |
 * | {@link rendering.GlUboSystem}               | This manages WebGL2 uniform buffer objects feature for shaders                |
 * | {@link rendering.GlBackBufferSystem}        | manages the back buffer, used so that we can pixi can pixels from the screen  |
 * | {@link rendering.GlContextSystem}           | This manages the WebGL context and its extensions                             |
 * | {@link rendering.GlBufferSystem}            | This manages buffers and their GPU resources, keeps everything in sync        |
 * | {@link rendering.GlTextureSystem}           | This manages textures and their GPU resources, keeps everything in sync       |
 * | {@link rendering.GlRenderTargetSystem}      | This manages what we render too. For example the screen, or another texture   |
 * | {@link rendering.GlGeometrySystem}          | This manages geometry, used for drawing meshes via the GPU                    |
 * | {@link rendering.GlUniformGroupSystem}      | This manages uniform groups. Syncing shader properties with the GPU           |
 * | {@link rendering.GlShaderSystem}            | This manages shaders, programs that run on the GPU to output lovely pixels    |
 * | {@link rendering.GlEncoderSystem}           | This manages encoders, a WebGPU Paradigm, use it to draw a mesh + shader      |
 * | {@link rendering.GlStateSystem}             | This manages the state of the WebGL context. eg the various flags that can be set blend modes / depthTesting etc |
 * | {@link rendering.GlStencilSystem}           | This manages the stencil buffer. Used primarily for masking                   |
 * | {@link rendering.GlColorMaskSystem}         | This manages the color mask. Used for color masking                           |
 *
 * The breadth of the API surface provided by the renderer is contained within these systems.
 * @memberof rendering
 * @property {rendering.GlUboSystem} ubo - UboSystem instance.
 * @property {rendering.GlBackBufferSystem} backBuffer - BackBufferSystem instance.
 * @property {rendering.GlContextSystem} context - ContextSystem instance.
 * @property {rendering.GlBufferSystem} buffer - BufferSystem instance.
 * @property {rendering.GlTextureSystem} texture - TextureSystem instance.
 * @property {rendering.GlRenderTargetSystem} renderTarget - RenderTargetSystem instance.
 * @property {rendering.GlGeometrySystem} geometry - GeometrySystem instance.
 * @property {rendering.GlUniformGroupSystem} uniformGroup - UniformGroupSystem instance.
 * @property {rendering.GlShaderSystem} shader - ShaderSystem instance.
 * @property {rendering.GlEncoderSystem} encoder - EncoderSystem instance.
 * @property {rendering.GlStateSystem} state - StateSystem instance.
 * @property {rendering.GlStencilSystem} stencil - StencilSystem instance.
 * @property {rendering.GlColorMaskSystem} colorMask - ColorMaskSystem instance.
 * @extends rendering.AbstractRenderer
 */
/* eslint-enable max-len */
export class WebGLRenderer<T extends ICanvas = HTMLCanvasElement>
    extends AbstractRenderer<WebGLPipes, WebGLOptions, T>
    implements WebGLSystems
{
    public gl: GlRenderingContext;

    constructor()
    {
        const systemConfig = {
            name: 'webgl',
            type: RendererType.WEBGL,
            systems,
            renderPipes,
            renderPipeAdaptors,
        };

        super(systemConfig);
    }
}
