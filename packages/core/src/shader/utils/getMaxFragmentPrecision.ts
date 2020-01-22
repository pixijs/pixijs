import { getTestContext } from './getTestContext';
import { PRECISION } from '@pixi/constants';

let maxFragmentPrecision: string;

export function getMaxFragmentPrecision(): string
{
    if (!maxFragmentPrecision)
    {
        maxFragmentPrecision = PRECISION.MEDIUM;
        const gl = getTestContext();

        if (gl)
        {
            if (gl.getShaderPrecisionFormat)
            {
                const shaderFragment = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);

                maxFragmentPrecision = shaderFragment.precision ? PRECISION.HIGH : PRECISION.MEDIUM;
            }
        }
    }

    return maxFragmentPrecision;
}
