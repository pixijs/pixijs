import { RenderGroupPipe } from '../../../../scene/container/RenderGroupPipe';
import { RenderGroupSystem } from '../../../../scene/container/RenderGroupSystem';
import { SpritePipe } from '../../../../scene/sprite/SpritePipe';
import { BatcherPipe } from '../../../batcher/shared/BatcherPipe';
import { AlphaMaskPipe } from '../../../mask/alpha/AlphaMaskPipe';
import { ColorMaskPipe } from '../../../mask/color/ColorMaskPipe';
import { StencilMaskPipe } from '../../../mask/stencil/StencilMaskPipe';
import { BackgroundSystem } from '../background/BackgroundSystem';
import { BlendModePipe } from '../blendModes/BlendModePipe';
import { ExtractSystem } from '../extract/ExtractSystem';
import { GenerateTextureSystem } from '../extract/GenerateTextureSystem';
import { GlobalUniformSystem } from '../renderTarget/GlobalUniformSystem';
import { UniformBufferSystem } from '../shader/UniformBufferSystem';
import { HelloSystem } from '../startup/HelloSystem';
import { TextureGCSystem } from '../texture/TextureGCSystem';
import { ViewSystem } from '../view/ViewSystem';

export const SharedSystems = [
    BackgroundSystem,
    GlobalUniformSystem,
    HelloSystem,
    ViewSystem,
    RenderGroupSystem,
    UniformBufferSystem,
    TextureGCSystem,
    GenerateTextureSystem,
    ExtractSystem,
];

export const SharedRenderPipes = [
    BlendModePipe,
    BatcherPipe,
    SpritePipe,
    RenderGroupPipe,
    AlphaMaskPipe,
    StencilMaskPipe,
    ColorMaskPipe,
];
