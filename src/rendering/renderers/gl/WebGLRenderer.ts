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
import { GlRenderTargetSystem } from './GlRenderTargetSystem';
import { GlStencilSystem } from './GlStencilSystem';
import { GlShaderSystem } from './shader/GlShaderSystem';
import { GlUniformGroupSystem } from './shader/GlUniformGroupSystem';
import { GlStateSystem } from './state/GlStateSystem';
import { GlTextureSystem } from './texture/GlTextureSystem';

import type { ICanvas } from '../../../environment/canvas/ICanvas';
import type { PipeConstructor } from '../shared/instructions/RenderPipe';
import type { SystemConstructor } from '../shared/system/System';
import type { ExtractRendererOptions, ExtractSystemTypes } from '../shared/system/utils/typeUtils';
import type { GlRenderingContext } from './context/GlRenderingContext';

const DefaultWebGLSystems = [
    ...SharedSystems,
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

/** Options for WebGLRenderer. */
export interface WebGLOptions
    extends ExtractRendererOptions<typeof DefaultWebGLSystems>,
    PixiMixins.RendererOptions,
    PixiMixins.WebGLOptions {}

/** The default WebGL renderer, uses WebGL2 contexts. */
export interface WebGLRenderer<T extends ICanvas = HTMLCanvasElement>
    extends AbstractRenderer<WebGLPipes, WebGLOptions, T>,
    WebGLSystems {}
export class WebGLRenderer<T extends ICanvas = HTMLCanvasElement>
    extends AbstractRenderer<WebGLPipes, WebGLOptions, T>
    implements WebGLSystems
{
    public gl: GlRenderingContext;

    constructor()
    {
        const systemConfig = {
            name: 'webgl2',
            type: RendererType.WEBGL,
            systems,
            renderPipes,
            renderPipeAdaptors,
        };

        super(systemConfig);
    }
}
