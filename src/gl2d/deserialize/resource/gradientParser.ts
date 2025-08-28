import { ExtensionType } from '../../../extensions/Extensions';
import { type Texture } from '../../../rendering/renderers/shared/texture/Texture';
import { FillGradient } from '../../../scene/graphics/shared/fill/FillGradient';
import { FillPattern } from '../../../scene/graphics/shared/fill/FillPattern';
import { GL2D } from '../../GL2D';
import { type PixiGL2DCanvasGradient, type PixiGL2DCanvasPattern } from '../../spec/extensions/resources';
import { deepRemoveUndefinedOrNull } from '../../utils/deepRemoveUndefinedOrNull';
import { type GL2DResourceParser } from '../parsers';
import { toPointData } from '../utils/arrayTo';

/**
 * Parser for GL2D gradient resources.
 * @internal
 */
export const gl2DGradientParser: GL2DResourceParser<PixiGL2DCanvasGradient | PixiGL2DCanvasPattern> = {
    extension: ExtensionType.GL2DResourceParser,

    async test(data: PixiGL2DCanvasGradient | PixiGL2DCanvasPattern): Promise<boolean>
    {
        return data.type === 'canvas_gradient' || data.type === 'canvas_pattern';
    },

    async parse(
        data: PixiGL2DCanvasGradient | PixiGL2DCanvasPattern,
        resources,
        serializedAssets,
    ): Promise<FillGradient | FillPattern>
    {
        if (data.type === 'canvas_gradient')
        {
            const gradient = new FillGradient(deepRemoveUndefinedOrNull({
                type: 'radial',
                center: toPointData([data.radial.innerCircle[0], data.radial.innerCircle[1]]),
                outerCenter: toPointData([data.radial.outerCircle[0], data.radial.outerCircle[1]]),
                innerRadius: data.radial.innerCircle[2],
                outerRadius: data.radial.outerCircle[2],
                textureSize: data.extensions.pixi_canvas_gradient.textureSize,
                textureSpace: data.gradientUnits,
                wrapMode: data.extensions.pixi_canvas_gradient.wrapMode,
                colorStops: data.stops.map(([offset, color]) => ({
                    offset,
                    color
                })),
            }));

            return gradient;
        }

        let existingSource = serializedAssets[data.source] as Texture;

        if (!existingSource)
        {
            // load the resource we need as it is not already loaded due to being later on in the array
            await GL2D.parseResource(resources[data.source], resources, serializedAssets);
        }

        existingSource = serializedAssets[data.source];

        const pattern = new FillPattern(existingSource, data.repeat);

        return pattern;
    },
};
