import { ExtensionType } from '../extensions/Extensions';
import { BlendModeFilter } from '../filters/blend-modes/BlendModeFilter';

import type { ExtensionMetadata } from '../extensions/Extensions';

/**
 * Uses each color channel to select the darker of the following two values; base or blend color
 * Available as `container.blendMode = 'darken'` after importing `pixi.js/advanced-blend-modes`.
 * @example
 * import 'pixi.js/advanced-blend-modes';
 * import { Sprite } from 'pixi.js';
 *
 * const sprite = Sprite.from('something.png');
 * sprite.blendMode = 'darken'
 * @memberof filters
 */
export class DarkenBlend extends BlendModeFilter
{
    /** @ignore */
    public static extension: ExtensionMetadata = {
        name: 'darken',
        type: ExtensionType.BlendMode
    };

    constructor()
    {
        super({
            gl: {
                functions: `
                vec3 blendDarken(vec3 base, vec3 blend, float opacity)
                {
                    return (min(base, blend) * opacity + base * (1.0 - opacity));
                }
                `,
                main: `
                finalColor = vec4(blendDarken(back.rgb, front.rgb,front.a), blendedAlpha) * uBlend;
                `
            },
            gpu: {
                functions: `
                fn blendDarken(base:vec3<f32>,  blend:vec3<f32>,  opacity:f32) -> vec3<f32>
                {
                    return (min(blend,base) * opacity + base * (1.0 - opacity));
                }
                `,
                main: `
                out = vec4<f32>(blendDarken(back.rgb, front.rgb, front.a), blendedAlpha) * blendUniforms.uBlend;
                `
            }
        });
    }
}
