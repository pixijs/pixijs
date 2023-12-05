import { FilterPipe } from '../../../../filters/FilterPipe';
import { FilterSystem } from '../../../../filters/FilterSystem';
import { RenderGroupPipe } from '../../../../scene/container/RenderGroupPipe';
import { RenderGroupSystem } from '../../../../scene/container/RenderGroupSystem';
import { GraphicsContextSystem } from '../../../../scene/graphics/shared/GraphicsContextSystem';
import { GraphicsPipe } from '../../../../scene/graphics/shared/GraphicsPipe';
import { MeshPipe } from '../../../../scene/mesh/shared/MeshPipe';
import { SpritePipe } from '../../../../scene/sprite/SpritePipe';
import { TilingSpritePipe } from '../../../../scene/sprite-tiling/TilingSpritePipe';
import { CanvasTextPipe } from '../../../../scene/text/canvas/CanvasTextPipe';
import { CanvasTextSystem } from '../../../../scene/text/canvas/CanvasTextSystem';
import { BitmapTextPipe } from '../../../../scene/text-bitmap/BitmapTextPipe';
import { HTMLTextPipe } from '../../../../scene/text-html/HTMLTextPipe';
import { HTMLTextSystem } from '../../../../scene/text-html/HTMLTextSystem';
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
    FilterSystem,
    GraphicsContextSystem,
    GlobalUniformSystem,
    HelloSystem,
    ViewSystem,
    CanvasTextSystem,
    HTMLTextSystem,
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
    MeshPipe,
    GraphicsPipe,
    CanvasTextPipe,
    HTMLTextPipe,
    BitmapTextPipe,
    TilingSpritePipe,
    FilterPipe,
    AlphaMaskPipe,
    StencilMaskPipe,
    ColorMaskPipe,
];

// CanvasTextSystem
// HTMLTextSystem

// MeshPipe
// GraphicsPipe
// CanvasTextPipe
// HTMLTextPipe
// BitmapTextPipe
// TilingSpritePipe
// FilterPipe?
