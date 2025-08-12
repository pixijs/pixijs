import { ExtensionType } from '../extensions/Extensions';
import { BlendModeFilter } from '../filters/blend-modes/BlendModeFilter';
import { hslgl } from '../filters/blend-modes/hls/GLhls';
import { hslgpu } from '../filters/blend-modes/hls/GPUhls';

import type { ExtensionMetadata } from '../extensions/Extensions';

const typeSymbol = Symbol.for('pixijs.ColorBlend');

/**
 * The final color has the hue and saturation of the top color, while using the luminosity of the bottom color.
 * The effect preserves gray levels and can be used to colorize the foreground.
 *
 * Available as `container.blendMode = 'color'` after importing `pixi.js/advanced-blend-modes`.
 * @example
 * import 'pixi.js/advanced-blend-modes';
 * import { Sprite } from 'pixi.js';
 *
 * const sprite = Sprite.from('something.png');
 * sprite.blendMode = 'color'
 * @category filters
 * @noInheritDoc
 * @standard
 */
export class ColorBlend extends BlendModeFilter
{
    /**
     * Type symbol used to identify instances of ColorBlend.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a ColorBlend.
     * @param obj - The object to check.
     * @returns True if the object is a ColorBlend, false otherwise.
     */
    public static isColorBlend(obj: any): obj is ColorBlend
    {
        return !!obj && !!obj[typeSymbol];
    }

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
