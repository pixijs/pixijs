import { ExtensionType } from '../extensions/Extensions';
import { BlendModeFilter } from '../filters/blend-modes/BlendModeFilter';
import { hslgl } from '../filters/blend-modes/hls/GLhls';
import { hslgpu } from '../filters/blend-modes/hls/GPUhls';

import type { ExtensionMetadata } from '../extensions/Extensions';

/**
 * Available as `container.blendMode = 'color'` after importing `pixi.js/advanced-blend-modes`.
 * @example
 * import 'pixi.js/advanced-blend-modes';
 * import { Sprite } from 'pixi.js';
 *
 * const sprite = Sprite.from('something.png');
 * sprite.blendMode = 'color'
 * @memberof filters
 */
export class ColorBlend extends BlendModeFilter
{
    /** @ignore */
    public static extension: ExtensionMetadata = {
        name: 'color',
        type: ExtensionType.BlendMode
    };

    constructor()
    {
        super({
            gl: {
                functions: `
                ${hslgl}

                vec3 blendColor(vec3 base, vec3 blend,  float opacity)
                {
                    return (setLuminosity(blend, getLuminosity(base)) * opacity + base * (1.0 - opacity));
                }
                `,
                main: `
                finalColor = vec4(blendColor(back.rgb, front.rgb,front.a), blendedAlpha) * uBlend;
                `
            },
            gpu: {
                functions: `
                ${hslgpu}

                fn blendColorOpacity(base:vec3<f32>,  blend:vec3<f32>,  opacity:f32) -> vec3<f32>
                {
                    return (setLuminosity(blend, getLuminosity(base)) * opacity + base * (1.0 - opacity));
                }
                `,
                main: `
                out = vec4<f32>(blendColorOpacity(back.rgb, front.rgb, front.a), blendedAlpha) * blendUniforms.uBlend;
                `
            }
        });
    }
}
