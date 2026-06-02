import type { TextureSourceOptions } from '../rendering/renderers/shared/texture/sources/TextureSource';
import type { ElementImage, HTMLSourceResource } from './HTMLSourceTypes';

declare global
{
    namespace PixiMixins
    {
        interface TextureSourceResources
        {
            html: HTMLSourceResource;
            htmlOptions: TextureSourceOptions<HTMLSourceResource>;
            elementImage: ElementImage;
            elementImageOptions: TextureSourceOptions<ElementImage>;
        }
    }
}

export {};
