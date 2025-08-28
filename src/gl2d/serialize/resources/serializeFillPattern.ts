import { type FillPattern } from '../../../scene/graphics/shared/fill/FillPattern';
import { type ToGL2DOptions } from '../../GL2D';
import { type PixiGL2DCanvasPattern } from '../../spec/extensions/resources';

/**
 * Serializes the fill pattern to a gl2D-compatible format.
 * @param instance - The fill pattern instance to serialize.
 * @param options - The serialization options.
 * @internal
 */
export async function serializeFillPattern(instance: FillPattern, options: ToGL2DOptions): Promise<ToGL2DOptions>
{
    const { gl2D } = options;

    // check if the source is already serialized
    const sourceIndex = gl2D.resources.findIndex((texture) => texture.uid === `canvas_pattern_${instance.uid}`);

    if (sourceIndex !== -1)
    {
        return options;
    }

    await instance.texture.serialize(options);
    const textureIndex = options.gl2D.resources.findIndex((res) => res.uid === `texture_${instance.texture.uid}`);

    // If not serialized, add it to the GL2D instance
    const data: PixiGL2DCanvasPattern = {
        uid: `canvas_pattern_${instance.uid}`,
        type: 'canvas_pattern',
        repeat: instance._repeat,
        source: textureIndex,
    };

    gl2D.resources.push(data);

    return options;
}

/**
 * Mixin for serializing a fill pattern to a gl2D-compatible format.
 * @category gl2d
 * @standard
 */
export interface SerializeFillPatternMixin
{
    /**
     * Serializes the fill pattern to a gl2D-compatible format.
     * @param {ToGL2DOptions} gl2DOptions - The gl2D serialization context and options.
     */
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>;
}

/** @internal */
export const serializeFillPatternMixin: Partial<FillPattern> = {
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>
    {
        return serializeFillPattern(this, gl2DOptions);
    },
} as FillPattern;
