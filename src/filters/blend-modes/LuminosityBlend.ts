import { ExtensionType } from '../../extensions/Extensions';
import { BlendModeFilter } from './BlendModeFilter';
import { hslgl } from './hls/GLhls';
import { hslgpu } from './hls/GPUhls';

import type { ExtensionMetadata } from '../../extensions/Extensions';

export class LuminosityBlend extends BlendModeFilter
{
    /** @ignore */
    public static extension: ExtensionMetadata = {
        name: 'luminosity',
        type: ExtensionType.BlendMode
    };

    constructor()
    {
        super({
            gl: {
                functions: `
                ${hslgl}

                vec3 blendLuminosity(vec3 base, vec3 blend,  float opacity)
                {
                    vec3 blendLuminosity = setLuminosity(base, getLuminosity(blend));
                    return (blendLuminosity * opacity + base * (1.0 - opacity));
                }
                `,
                main: `
                fragColor = vec4(blendLuminosity(back.rgb, front.rgb, front.a), uBlend);
                `
            },
            gpu: {
                functions: `
                ${hslgpu}

                fn blendLuminosity(base:vec3<f32>,  blend:vec3<f32>,  opacity:f32) -> vec3<f32>
                {
                    let blendLuminosity: vec3<f32> = setLuminosity(base, getLuminosity(blend));
                    return (blendLuminosity * opacity + base * (1.0 - opacity));
                }
            `,
                main: `
                out = vec4<f32>(blendLuminosity(back.rgb, front.rgb, front.a), blendUniforms.uBlend);
            `
            }
        });
    }
}
