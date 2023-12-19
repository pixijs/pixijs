/* eslint-disable max-len */

import { ExtensionType } from '../../extensions/Extensions';
import { BlendModeFilter } from './BlendModeFilter';

import type { ExtensionMetadata } from '../../extensions/Extensions';

/**
 Looks at the color information in each channel and darkens the base color to
 reflect the blend color by increasing the contrast between the two.
 @memberof filters
 */
export class LinearBurnBlend extends BlendModeFilter
{
    /** @ignore */
    public static extension: ExtensionMetadata = {
        name: 'linear-burn',
        type: ExtensionType.BlendMode
    };

    constructor()
    {
        super({
            gl: {
                functions: `
                float linearBurn(float base, float blend)
                {
                    return max(0.0, base + blend - 1.0);
                }

                vec3 blendLinearBurn(vec3 base, vec3 blend, float opacity)
                {
                    vec3 blended = vec3(
                        linearBurn(base.r, blend.r),
                        linearBurn(base.g, blend.g),
                        linearBurn(base.b, blend.b)
                    );

                    return (blended * opacity + base * (1.0 - opacity));
                }
                `,
                main: `
                fragColor = vec4(blendLinearBurn(back.rgb, front.rgb, front.a), uBlend);
                `
            },
            gpu: {
                functions: `
                fn linearBurn(base: f32, blend: f32) -> f32
                {
                    return max(0.0, base + blend - 1.0);
                }

                fn blendLinearBurn(base:vec3<f32>,  blend:vec3<f32>,  opacity:f32) -> vec3<f32>
                {
                    let blended = vec3<f32>(
                        linearBurn(base.r, blend.r),
                        linearBurn(base.g, blend.g),
                        linearBurn(base.b, blend.b)
                    );

                    return (blended * opacity + base * (1.0 - opacity));
                }
                `,
                main: `
                out = vec4<f32>(blendLinearBurn(back.rgb, front.rgb, front.a), blendUniforms.uBlend);
                `
            }
        });
    }
}
