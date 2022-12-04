import { ArrayResource } from './ArrayResource';
import { INSTALLED } from './autoDetectResource';
import { BufferResource } from './BufferResource';
import { CanvasResource } from './CanvasResource';
import { CubeResource } from './CubeResource';
import { ImageBitmapResource } from './ImageBitmapResource';
import { ImageResource } from './ImageResource';
import { SVGResource } from './SVGResource';
import { VideoResource } from './VideoResource';

export * from './BaseImageResource';
export * from './Resource';

INSTALLED.push(
    ImageBitmapResource,
    ImageResource,
    CanvasResource,
    VideoResource,
    SVGResource,
    BufferResource,
    CubeResource,
    ArrayResource
);

export * from './AbstractMultiResource';
export * from './ArrayResource';
export * from './autoDetectResource';
export * from './BufferResource';
export * from './CanvasResource';
export * from './CubeResource';
export * from './ImageBitmapResource';
export * from './ImageResource';
export * from './SVGResource';
export * from './VideoResource';
