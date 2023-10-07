import { ExtensionType } from '../../extensions/Extensions';
import { BlendModeFilter } from './BlendModeFilter';
import { hslgl } from './hls/GLhls';
import { hslgpu } from './hls/GPUhls';

import type { ExtensionMetadata } from '../../extensions/Extensions';

export class SaturationBlend extends BlendModeFilter
{
    /** @ignore */
    public static extension: ExtensionMetadata = {
        name: 'saturation',
        type: ExtensionType.BlendMode
    };

    constructor()
    {
        super({
            gl: {
                functions: `
                ${hslgl}

                vec3 blendSaturation(vec3 base, vec3 blend,  float opacity)
                {
                    vec3 blendSaturation = setLuminosity(setSaturation(base, getSaturation(blend)), getLuminosity(base));
                    return (blendSaturation * opacity + base * (1.0 - opacity));
                }
            `,
                main: `
                fragColor = vec4(blendSaturation(back.rgb, front.rgb, front.a), uBlend);
            `
            },
            gpu: {
                functions: `
                ${hslgpu}

                fn blendSaturation(base:vec3<f32>,  blend:vec3<f32>,  opacity:f32) -> vec3<f32>
                {
                    let blendSaturation = setLuminosity(setSaturation(base, getSaturation(blend)), getLuminosity(base));
                    return (blendSaturation * opacity + base * (1.0 - opacity));
                }
            `,
                main: `
                out = vec4<f32>(blendSaturation(back.rgb, front.rgb, front.a), blendUniforms.uBlend);
            `
            }
        });
    }
}
