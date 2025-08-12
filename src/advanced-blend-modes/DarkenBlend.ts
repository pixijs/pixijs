import { ExtensionType } from '../extensions/Extensions';
import { BlendModeFilter } from '../filters/blend-modes/BlendModeFilter';

import type { ExtensionMetadata } from '../extensions/Extensions';

const typeSymbol = Symbol.for('pixijs.DarkenBlend');

/**
 * The final color is composed of the darkest values of each color channel.
 *
 * Available as `container.blendMode = 'darken'` after importing `pixi.js/advanced-blend-modes`.
 * @example
 * import 'pixi.js/advanced-blend-modes';
 * import { Sprite } from 'pixi.js';
 *
 * const sprite = Sprite.from('something.png');
 * sprite.blendMode = 'darken'
 * @category filters
 * @noInheritDoc
 * @standard
 */
export class DarkenBlend extends BlendModeFilter
{
    /**
     * Type symbol used to identify instances of DarkenBlend.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a DarkenBlend.
     * @param obj - The object to check.
     * @returns True if the object is a DarkenBlend, false otherwise.
     */
    public static isDarkenBlend(obj: any): obj is DarkenBlend
    {
        return !!obj && !!obj[typeSymbol];
    }

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
