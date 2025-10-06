/* eslint-disable dot-notation */
import { type VideoSource, type VideoSourceOptions } from '../../../rendering/renderers/shared/texture/sources/VideoSource';
import { type PixiGL2DVideoSource } from '../../spec/extensions/resources';
import { serializeTextureSource } from './serializeTextureSource';

import type { ToGL2DOptions } from '../../GL2D';
/**
 * Serializes the video source to a gl2D-compatible format.
 * @param instance - The image instance to serialize.
 * @param options - The serialization options.
 * @internal
 */
export async function serializeVideoSource(instance: VideoSource, options: ToGL2DOptions): Promise<ToGL2DOptions>
{
    await serializeTextureSource(instance, options);
    const { gl2D } = options;

    // find the resource
    const source = gl2D.resources.find(
        (texture) => texture.uid === `texture_source_${instance.uid}`) as PixiGL2DVideoSource;

    if (!source)
    {
        throw new Error(`ImageSource: Texture source with uid ${instance.uid} not found.`);
    }

    const sourceOptions = instance['options'] as VideoSourceOptions;
    const fullVideo: PixiGL2DVideoSource = {
        ...source,
        type: 'video_source',
        autoLoad: sourceOptions.autoLoad,
        autoPlay: sourceOptions.autoPlay,
        crossorigin: sourceOptions.crossorigin,
        loop: sourceOptions.loop,
        muted: sourceOptions.muted,
        playsinline: sourceOptions.playsinline,
        extensions: {
            pixi_texture_source_resource: source.extensions.pixi_texture_source_resource,
            pixi_video_source_resource: {
                updateFPS: instance['_updateFPS'],
                alphaMode: instance.alphaMode,
                preload: sourceOptions.preload,
                preloadTimeoutMs: sourceOptions.preloadTimeoutMs,
            }
        }
    };

    // Assign the full video back to the original video
    Object.assign(source, fullVideo);

    gl2D.extensionsUsed.push('pixi_video_source_resource');
    gl2D.extensionsRequired.push('pixi_video_source_resource');

    return options;
}
/**
 * Mixin for serializing a video source to a gl2D-compatible format.
 * @category gl2d
 * @standard
 */
export interface SerializeVideoSourceMixin
{
    /**
     * Serializes the video source to a gl2D-compatible format.
     * @param {ToGL2DOptions} gl2DOptions - The gl2D serialization context and options.
     */
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>;
}

/** @internal */
export const serializeVideoSourceMixin: Partial<VideoSource> = {
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>
    {
        return serializeVideoSource(this, gl2DOptions);
    },
} as VideoSource;
