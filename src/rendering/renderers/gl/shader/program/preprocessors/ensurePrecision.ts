import type { PRECISION } from '../../const';

interface EnsurePrecisionOptions
{
    requestedVertexPrecision: PRECISION;
    requestedFragmentPrecision: PRECISION;
    maxSupportedVertexPrecision: PRECISION;
    maxSupportedFragmentPrecision: PRECISION;
}

/** Matches uniform sampler declarations that carry no precision qualifier of their own. */
const unqualifiedSamplerPattern = /\buniform\s+([iu]?sampler\w+)/g;

/** Matches precision statements for a sampler type, e.g. `precision highp usampler2D;`. */
const declaredSamplerPattern = /\bprecision\s+\w+\s+([iu]?sampler\w+)\s*;/g;

/**
 * The precision GLSL predeclares for `sampler2D` and `samplerCube`. Restating it changes nothing, so existing
 * shaders keep reading colour at the precision they always had.
 */
const defaultSamplerPrecisions: Record<string, PRECISION> = {
    sampler2D: 'lowp',
    samplerCube: 'lowp',
};

/**
 * Sets the float precision on the shader, ensuring the device supports the request precision.
 * If the precision is already present, it just ensures that the device is able to handle it.
 *
 * It also declares a precision for every sampler type the shader uses, unless the shader already declares one:
 * `lowp` for `sampler2D` and `samplerCube`, their GLSL default, and `highp` for every other type. GLSL ES 3.00
 * gives those types no default, so the shader wouldn't compile without one, and they mostly hold data, where a
 * lower precision would silently truncate values such as 32-bit integer ids.
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

        src = `precision ${precision} float;\n${src}`;
    }
    else if (maxSupportedPrecision !== 'highp' && src.substring(0, 15) === 'precision highp')
    {
        // precision was supplied, but at a level this device does not support, so downgrading to mediump.
        src = src.replace('precision highp', 'precision mediump');
    }

    // a sampler used in both stages must have the same precision in each, so this ignores the stage
    const samplerPrecision = options.maxSupportedFragmentPrecision === 'highp' ? 'highp' : 'mediump';

    return ensureSamplerPrecision(src, samplerPrecision);
}

/**
 * Prepends a precision statement for each sampler type that is declared without one.
 * @param src - the shader source
 * @param dataPrecision - the precision for sampler types GLSL gives no default
 */
function ensureSamplerPrecision(src: string, dataPrecision: PRECISION): string
{
    // sampler types that already have a precision, from the shader or from this header
    const done = new Set<string>();
    let header = '';

    for (const [, type] of src.matchAll(declaredSamplerPattern)) done.add(type);

    for (const [, type] of src.matchAll(unqualifiedSamplerPattern))
    {
        if (done.has(type)) continue;

        done.add(type);
        header += `precision ${defaultSamplerPrecisions[type] ?? dataPrecision} ${type};\n`;
    }

    return header + src;
}
