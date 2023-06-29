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

export const DefaultWebGLSystems = [
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

const DefaultWebGLPipes = [
    ...SharedRenderPipes,
];

const DefaultAdapters = [
    GlBatchAdaptor,
    GlMeshAdaptor,
    GlGraphicsAdaptor,
];

// installed systems will bbe added to this array by the extensions manager..
const systems: {name: string, value: SystemConstructor}[] = [];
const renderPipes: {name: string, value: PipeConstructor}[] = [];
const renderPipeAdaptors: {name: string, value: any}[] = [];

extensions.handleByNamedList(ExtensionType.WebGLRendererSystem, systems);
extensions.handleByNamedList(ExtensionType.WebGLRendererPipes, renderPipes);
extensions.handleByNamedList(ExtensionType.WebGLRendererPipesAdaptor, renderPipeAdaptors);

// add all the default systems as well as any user defined ones from the extensions
extensions.add(
    ...DefaultWebGLSystems,
    ...DefaultWebGLPipes,
    ...DefaultAdapters
);

type WebGLSystemTypes = ExtractSystemTypes<typeof DefaultWebGLSystems>;
export type WebGLOptions = ExtractRendererOptions<typeof DefaultWebGLSystems>;
export type WebGLRenderPipes = ExtractSystemTypes<typeof DefaultWebGLPipes>;

export interface WebGLRenderer extends AbstractRenderer<WebGLRenderPipes, WebGLOptions>, WebGLSystemTypes
{

}
export class WebGLRenderer extends AbstractRenderer<WebGLRenderPipes, WebGLOptions> implements WebGLSystemTypes
{
    type = 'webgl2';

    gl: GlRenderingContext;

    constructor()
    {
        const systemConfig = {
            type: 'webgl',
            systems,
            renderPipes,
            renderPipeAdaptors
        };

        super(systemConfig);
    }
}
