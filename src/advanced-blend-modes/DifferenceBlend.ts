import { ExtensionType } from '../extensions/Extensions';
import { BlendModeFilter } from '../filters/blend-modes/BlendModeFilter';

import type { ExtensionMetadata } from '../extensions/Extensions';

/**
 * The final color is the result of subtracting the darker of the two colors from the lighter one.
 * black layer has no effect, while a white layer inverts the other layer's color.
 *
 * Available as `container.blendMode = 'difference'` after importing `pixi.js/advanced-blend-modes`.
 * @example
 * import 'pixi.js/advanced-blend-modes';
 * import { Sprite } from 'pixi.js';
 *
 * const sprite = Sprite.from('something.png');
 * sprite.blendMode = 'difference'
 * @category filters
 * @noInheritDoc
 */
export class DifferenceBlend extends BlendModeFilter
{
    /** @ignore */
    public static extension: ExtensionMetadata = {
        name: 'difference',
        type: ExtensionType.BlendMode
    };

    constructor()
    {
        super({
            gl: {
                functions: `
                vec3 blendDifference(vec3 base, vec3 blend,  float opacity)
                {
                    return (abs(blend - base) * opacity + base * (1.0 - opacity));
                }
            `,
                main: `
                finalColor = vec4(blendDifference(back.rgb, front.rgb,front.a), blendedAlpha) * uBlend;
            `
            },
            gpu: {
                functions: `
                fn blendDifference(base:vec3<f32>,  blend:vec3<f32>,  opacity:f32) -> vec3<f32>
                {
                    return (abs(blend - base) * opacity + base * (1.0 - opacity));
                }
            `,
                main: `
                out = vec4<f32>(blendDifference(back.rgb, front.rgb, front.a), blendedAlpha) * blendUniforms.uBlend;
            `
            }
        });
    }
}
