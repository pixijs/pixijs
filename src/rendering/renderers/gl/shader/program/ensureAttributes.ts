import { warn } from '../../../../../utils/logging/warn';
import { getAttributeInfoFromFormat } from '../../../shared/geometry/utils/getAttributeInfoFromFormat';

import type { Geometry } from '../../../shared/geometry/Geometry';
import type { ExtractedAttributeData } from './extractAttributesFromGlProgram';

/**
 * This function looks at the attribute information provided to the geometry and attempts
 * to fill in an gaps. WE do this by looking at the extracted data from the shader and
 * making best guesses.
 *
 * Most of th etime users don't need to provide all the attribute info beyond the data itself, so we
 * can fill in the gaps for them. If you are using attributes in a more advanced way, you can
 * don't forget to add all the info at creation!
 * @param geometry - the geometry to ensure attributes for
 * @param extractedData - the extracted data from the shader
 */
export function ensureAttributes(
    geometry: Geometry,
    extractedData: Record<string, ExtractedAttributeData>
): void
{
    for (const i in geometry.attributes)
    {
        const attribute = geometry.attributes[i];
        const attributeData = extractedData[i];

        if (attributeData)
        {
            attribute.format ??= attributeData.format;
            attribute.offset ??= attributeData.offset;
            attribute.instance ??= attributeData.instance;
        }
        else
        {
            // eslint-disable-next-line max-len
            warn(`Attribute ${i} is not present in the shader, but is present in the geometry. Unable to infer attribute details.`);
        }
    }

    ensureStartAndStride(geometry);
}

function ensureStartAndStride(geometry: Geometry): void
{
    const { buffers, attributes } = geometry;

    const tempStride: Record<string, number> = {};
    const tempStart: Record<string, number> = {};

    for (const j in buffers)
    {
        const buffer = buffers[j];

        tempStride[buffer.uid] = 0;
        tempStart[buffer.uid] = 0;
    }

    for (const j in attributes)
    {
        const attribute = attributes[j];

        tempStride[attribute.buffer.uid] += getAttributeInfoFromFormat(attribute.format).stride;
    }

    for (const j in attributes)
    {
        const attribute = attributes[j];

        attribute.stride ??= tempStride[attribute.buffer.uid];

        attribute.start ??= tempStart[attribute.buffer.uid];

        tempStart[attribute.buffer.uid] += getAttributeInfoFromFormat(attribute.format).stride;
    }
}
