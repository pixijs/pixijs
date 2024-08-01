import { ExtensionType } from '../extensions/Extensions';
import { BlendModeFilter } from '../filters/blend-modes/BlendModeFilter';

import type { ExtensionMetadata } from '../extensions/Extensions';

/**
 * Available as `container.blendMode = 'lighten'` after importing `pixi.js/advanced-blend-modes`.
 * @example
 * import 'pixi.js/advanced-blend-modes';
 * import { Sprite } from 'pixi.js';
 *
 * const sprite = Sprite.from('something.png');
 * sprite.blendMode = 'lighten'
 * @memberof filters
 */
export class LightenBlend extends BlendModeFilter
{
    /** @ignore */
    public static extension: ExtensionMetadata = {
        name: 'lighten',
        type: ExtensionType.BlendMode
    };

    constructor()
    {
        super({
            gl: {
                functions: `
                vec3 blendLighten(vec3 base, vec3 blend, float opacity)
                {
                    return (max(base, blend) * opacity + base * (1.0 - opacity));
                }
                `,
                main: `
                finalColor = vec4(blendLighten(back.rgb, front.rgb,front.a), blendedAlpha) * uBlend;
                `
            },
            gpu: {
                functions: `
                fn blendLighten(base:vec3<f32>,  blend:vec3<f32>,  opacity:f32) -> vec3<f32>
                {
                    return (max(base, blend) * opacity + base * (1.0 - opacity));
                }
            `,
                main: `
                out = vec4<f32>(blendLighten(back.rgb, front.rgb, front.a), blendedAlpha) * blendUniforms.uBlend;
            `
            }
        });
    }
}
