import {
    type VideoSource,
    type VideoSourceOptions,
} from '../../../../rendering/renderers/shared/texture/sources/VideoSource';
import { VIDEO_SOURCE_DEFAULTS } from '../../../defaults';
import { type Gl2dSerializeContext } from '../../../serializeContext';
import { type Gl2dRef } from '../../../types/Gl2dTypes';
import { type Gl2dPixiVideoSourceResource } from '../../../types/pixi/PixiGl2dResources';
import { gl2dUtils } from '../../../utils';
import { serializeCoreTextureSource } from './serializeTextureSource';

/** @internal */
export type SerializeVideoSource = () => void;

/**
 * Serializes a VideoSource into a video_source resource (sync).
 * @param source - The VideoSource to serialize
 * @param ctx - The serialization context
 * @returns Index into ctx.gl2d.resources
 * @category gl2d
 * @internal
 */
export function serializeVideoSource(source: VideoSource, ctx: Gl2dSerializeContext): Gl2dRef
{
    const existing = ctx.resourceMap.get(source);

    if (existing !== undefined) return existing;

    const base = serializeCoreTextureSource(source, ctx);
    // eslint-disable-next-line dot-notation
    const opts = source['options'] as VideoSourceOptions;

    const crossorigin = typeof opts.crossorigin === 'string' ? opts.crossorigin : undefined;

    const resource: Gl2dPixiVideoSourceResource = gl2dUtils.removeUndefinedOrNull(
        {
            ...base,
            type: 'video_source' as const,
            uid: `video_source_${String(source.uid)}` as const,
            // eslint-disable-next-line dot-notation
            autoPlay: gl2dUtils.checkValue(source['autoPlay'], VIDEO_SOURCE_DEFAULTS.autoPlay),
            autoLoad: gl2dUtils.checkValue(opts.autoLoad, VIDEO_SOURCE_DEFAULTS.autoLoad),
            loop: gl2dUtils.checkValue(opts.loop, VIDEO_SOURCE_DEFAULTS.loop),
            muted: gl2dUtils.checkValue(opts.muted, VIDEO_SOURCE_DEFAULTS.muted),
            playsinline: gl2dUtils.checkValue(opts.playsinline, VIDEO_SOURCE_DEFAULTS.playsinline),
            preload: gl2dUtils.checkValue(opts.preload, VIDEO_SOURCE_DEFAULTS.preload),
            fps: gl2dUtils.checkValue(
                // eslint-disable-next-line dot-notation
                source['_updateFPS'] === 0 ? 'auto' : source['_updateFPS'],
                VIDEO_SOURCE_DEFAULTS.fps,
            ),
            crossorigin,
        },
        1,
    );

    const index = ctx.gl2d.resources.length;

    ctx.gl2d.resources.push(resource);
    ctx.resourceMap.set(source, index);

    return index;
}
