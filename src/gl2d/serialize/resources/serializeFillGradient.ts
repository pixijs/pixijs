/* eslint-disable dot-notation */
import { Color } from '../../../color/Color';
import { type FillGradient } from '../../../scene/graphics/shared/fill/FillGradient';
import { type ToGL2DOptions } from '../../GL2D';
import { type PixiGL2DCanvasGradient } from '../../spec/extensions/resources';

/**
 * Serializes the fill gradient to a gl2D-compatible format.
 * @param instance - The fill gradient instance to serialize.
 * @param options - The serialization options.
 * @internal
 */
export async function serializeFillGradient(instance: FillGradient, options: ToGL2DOptions): Promise<ToGL2DOptions>
{
    const { gl2D } = options;

    // check if the source is already serialized
    const sourceIndex = gl2D.resources.findIndex((texture) => texture.uid === `canvas_gradient_${instance.uid}`);

    if (sourceIndex !== -1)
    {
        return options;
    }

    // If not serialized, add it to the GL2D instance
    const data: PixiGL2DCanvasGradient = {
        uid: `canvas_gradient_${instance.uid}`,
        type: 'canvas_gradient',
        radial: instance.type === 'radial' ? {
            innerCircle: [instance.center.x, instance.center.y, instance.innerRadius],
            outerCircle: [instance.outerCenter.x, instance.outerCenter.y, instance.outerRadius],
        } : null,
        linear: instance.type === 'linear' ? {
            start: [instance.start.x, instance.start.y],
            end: [instance.end.x, instance.end.y],
        } : null,
        stops: instance.colorStops.map((stop) => ([
            stop.offset,
            Color.shared.setValue(stop.color).toRgbaString(),
        ])),
        gradientType: instance.type,
        gradientUnits: instance.textureSpace,
        extensions: {
            pixi_canvas_gradient: {
                rotation: instance.rotation,
                wrapMode: instance['_wrapMode'] as 'clamp-to-edge' | 'repeat',
                scale: instance.scale,
                textureSize: instance['_textureSize']
            },
        },
    };

    gl2D.resources.push(data);
    gl2D.extensionsUsed.push('pixi_canvas_gradient_resource');

    // we need to pass web fonts and bitmaps

    return options;
}

/**
 * Mixin for serializing a fill gradient to a gl2D-compatible format.
 * @category gl2d
 * @standard
 */
export interface SerializeFillGradientMixin
{
    /**
     * Serializes the fill gradient to a gl2D-compatible format.
     * @param {ToGL2DOptions} gl2DOptions - The gl2D serialization context and options.
     */
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>;
}

/** @internal */
export const serializeFillGradientMixin: Partial<FillGradient> = {
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>
    {
        return serializeFillGradient(this, gl2DOptions);
    },
} as FillGradient;
