import { extensions } from '../extensions/Extensions';
import { AlphaMask } from './mask/alpha/AlphaMask';
import { ColorMask } from './mask/color/ColorMask';
import { StencilMask } from './mask/stencil/StencilMask';
import { BufferImageSource } from './renderers/shared/texture/sources/BufferImageSource';
import { CanvasSource } from './renderers/shared/texture/sources/CanvasSource';
import { HTMLSnapshotSource } from './renderers/shared/texture/sources/HTMLSnapshotSource';
import { HTMLSource } from './renderers/shared/texture/sources/HTMLSource';
import { ImageSource } from './renderers/shared/texture/sources/ImageSource';
import { VideoSource } from './renderers/shared/texture/sources/VideoSource';
import './renderers/shared/texture/utils/textureFrom';
import './mask/MaskEffectManager';

extensions.add(
    AlphaMask,
    ColorMask,
    StencilMask,
    VideoSource,
    ImageSource,
    CanvasSource,
    BufferImageSource,
    HTMLSource,
    HTMLSnapshotSource,
);

