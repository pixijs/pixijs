import type { PRECISION } from '../../const';

interface EnsurePrecisionOptions
{
    requestedVertexPrecision: PRECISION;
    requestedFragmentPrecision: PRECISION;
    maxSupportedVertexPrecision: PRECISION;
    maxSupportedFragmentPrecision: PRECISION;
}

/**
 * Sets the float precision on the shader, ensuring the device supports the request precision.
 * If the precision is already present, it just ensures that the device is able to handle it.
 * @param src
 * @param options
 * @param options.requestedVertexPrecision
 * @param options.requestedFragmentPrecision
 * @param options.maxSupportedVertexPrecision
 * @param options.maxSupportedFragmentPrecision
 * @param isFragment
 * @private
 */
export function ensurePrecision(
    src: string,
    options: EnsurePrecisionOptions,
    isFragment: boolean,
): string
{
    const maxSupportedPrecision = isFragment ? options.maxSupportedFragmentPrecision : options.maxSupportedVertexPrecision;

    if (src.substring(0, 9) !== 'precision')
    {
        // no precision supplied, so PixiJS will add the requested level.
        let precision = isFragment ? options.requestedFragmentPrecision : options.requestedVertexPrecision;

        // If highp is requested but not supported, downgrade precision to a level all devices support.
        if (precision === 'highp' && maxSupportedPrecision !== 'highp')
        {
            precision = 'mediump';
        }

        return `precision ${precision} float;\n${src}`;
    }
    else if (maxSupportedPrecision !== 'highp' && src.substring(0, 15) === 'precision highp')
    {
        // precision was supplied, but at a level this device does not support, so downgrading to mediump.
        return src.replace('precision highp', 'precision mediump');
    }

    return src;
}
