import { INSTALLED } from './autoDetectResource';
import { ArrayResource } from './ArrayResource';
import { BufferResource } from './BufferResource';
import { CanvasResource } from './CanvasResource';
import { CubeResource } from './CubeResource';
import { ImageResource } from './ImageResource';
import { SVGResource } from './SVGResource';
import { VideoResource } from './VideoResource';
import { VideoFrameResource } from './VideoFrameResource';
import { ImageBitmapResource } from './ImageBitmapResource';

export * from './Resource';
export * from './BaseImageResource';

INSTALLED.push(
    ImageResource,
    ImageBitmapResource,
    CanvasResource,
    VideoResource,
    VideoFrameResource,
    SVGResource,
    BufferResource,
    CubeResource,
    ArrayResource
);

export * from './autoDetectResource';
export * from './AbstractMultiResource';
export * from './ArrayResource';
export * from './BufferResource';
export * from './CanvasResource';
export * from './CubeResource';
export * from './ImageResource';
export * from './SVGResource';
export * from './VideoResource';
export * from './ImageBitmapResource';
