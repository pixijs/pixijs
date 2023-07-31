import { extensions, ExtensionType } from '../../../extensions/Extensions';
import { GlBatchAdaptor } from '../../batcher/gl/GlBatchAdaptor';
import { GlGraphicsAdaptor } from '../../graphics/gl/GlGraphicsAdaptor';
import { GlMeshAdaptor } from '../../mesh/gl/GlMeshAdaptor';
import { AbstractRenderer } from '../shared/system/AbstractRenderer';
import { SharedRenderPipes, SharedSystems } from '../shared/system/SharedSystems';
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

type WebGLSystems = ExtractSystemTypes<typeof DefaultWebGLSystems> &
PixiMixins.RendererSystems &
PixiMixins.WebGLSystems;

export type WebGLPipes = ExtractSystemTypes<typeof DefaultWebGLPipes> &
PixiMixins.RendererPipes &
PixiMixins.WebGLPipes;

export type WebGLOptions = ExtractRendererOptions<typeof DefaultWebGLSystems> &
PixiMixins.RendererOptions &
PixiMixins.WebGLOptions;

export interface WebGLRenderer extends AbstractRenderer<WebGLPipes, WebGLOptions>, WebGLSystems {}
export class WebGLRenderer extends AbstractRenderer<WebGLPipes, WebGLOptions> implements WebGLSystems
{
    public gl: GlRenderingContext;

    constructor()
    {
        const systemConfig = {
            type: 'webgl2',
            systems,
            renderPipes,
            renderPipeAdaptors,
        };

        super(systemConfig);
    }
}
