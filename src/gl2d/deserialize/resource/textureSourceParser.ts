import { Assets } from '../../../assets/Assets';
import { Cache } from '../../../assets/cache/Cache';
import { ExtensionType } from '../../../extensions/Extensions';
import {
    type TextureSource,
    type TextureSourceOptions
} from '../../../rendering/renderers/shared/texture/sources/TextureSource';
import {
    type VideoSourceOptions
} from '../../../rendering/renderers/shared/texture/sources/VideoSource';
import { type Texture } from '../../../rendering/renderers/shared/texture/Texture';
import {
    type PixiGL2DImageSource,
    type PixiGL2DTextureSource,
    type PixiGL2DVideoSource,
} from '../../extensions/resources';
import { type GL2DResource } from '../../resources';
import { type GL2DResourceParser } from '../parsers';

type TextureSourceType = PixiGL2DTextureSource<'texture_source'> | PixiGL2DImageSource | PixiGL2DVideoSource;

/**
 * Parser for GL2D texture source resources.
 * @private
 */
export const gl2DTextureSourceParser: GL2DResourceParser<TextureSourceType> = {
    extension: ExtensionType.GL2DResourceParser,

    async test(data: TextureSourceType): Promise<boolean>
    {
        return data.type === 'texture_source' || data.type === 'image_source' || data.type === 'video_source';
    },

    async parse(data: TextureSourceType, _resourceCache: GL2DResource[]): Promise<TextureSource>
    {
        const uri = data.uri;

        // check if the resource is already loaded
        if (Cache.has(uri))
        {
            return Cache.get<Texture>(uri).source;
        }

        const formattedData: Required<Omit<TextureSourceOptions, 'sampleCount' | 'wrapMode' | 'uri' | 'resource'>> = {
            width: data.width,
            height: data.height,
            resolution: data.resolution,
            format: data.format,
            antialias: data.antialias,
            alphaMode: data.alphaMode,
            addressMode: data.addressMode,
            addressModeU: data.addressModeU,
            addressModeV: data.addressModeV,
            addressModeW: data.addressModeW,
            scaleMode: data.scaleMode,
            magFilter: data.magFilter,
            minFilter: data.minFilter,
            mipmapFilter: data.mipmapFilter,
            lodMinClamp: data.lodMinClamp,
            lodMaxClamp: data.lodMaxClamp,
            mipLevelCount: data.extensions.pixi_texture_source_resource.mipLevelCount,
            maxAnisotropy: data.extensions.pixi_texture_source_resource.maxAnisotropy,
            dimensions: data.extensions.pixi_texture_source_resource.dimensions,
            compare: data.extensions.pixi_texture_source_resource.compare,
            autoGenerateMipmaps: data.extensions.pixi_texture_source_resource.autoGenerateMipmaps,
            autoGarbageCollect: data.extensions.pixi_texture_source_resource.autoGarbageCollect,
            label: data.name || '',
        };

        if (data.type === 'video_source')
        {
            const videoSourceData: Required<Omit<VideoSourceOptions, 'sampleCount' | 'wrapMode' | 'uri' | 'resource'>>
                = {
                    ...formattedData,
                    autoLoad: data.autoLoad,
                    autoPlay: data.autoPlay,
                    crossorigin: data.crossorigin,
                    loop: data.loop,
                    muted: data.muted,
                    playsinline: data.playsinline,
                    alphaMode: data.alphaMode,
                    updateFPS: data.extensions.pixi_video_source_resource.updateFPS,
                    preload: data.extensions.pixi_video_source_resource.preload,
                    preloadTimeoutMs: data.extensions.pixi_video_source_resource.preloadTimeoutMs,
                };

            return (await Assets.load<Texture>({ src: uri, data: videoSourceData })).source;
        }

        return (await Assets.load<Texture>({ src: uri, data: formattedData })).source;
    },
};
