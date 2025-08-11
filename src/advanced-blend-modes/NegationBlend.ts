import { ExtensionType } from '../extensions/Extensions';
import { BlendModeFilter } from '../filters/blend-modes/BlendModeFilter';

import type { ExtensionMetadata } from '../extensions/Extensions';

const typeSymbol = Symbol.for('pixijs.NegationBlend');

/**
 * Implements the Negation blend mode which creates an inverted effect based on the brightness values.
 *
 * Available as `container.blendMode = 'negation'` after importing `pixi.js/advanced-blend-modes`.
 * @example
 * import 'pixi.js/advanced-blend-modes';
 * import { Sprite } from 'pixi.js';
 *
 * const sprite = Sprite.from('something.png');
 * sprite.blendMode = 'negation'
 * @category filters
 * @noInheritDoc
 */
export class NegationBlend extends BlendModeFilter
{
    /**
     * Type symbol used to identify instances of NegationBlend.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a NegationBlend.
     * @param obj - The object to check.
     * @returns True if the object is a NegationBlend, false otherwise.
     */
    public static isNegationBlend(obj: any): obj is NegationBlend
    {
        return !!obj && !!obj[typeSymbol];
    }

    /** @ignore */
    public static extension: ExtensionMetadata = {
        name: 'negation',
        type: ExtensionType.BlendMode
    };

    constructor()
    {
        super({
            gl: {
                functions: `
                vec3 negation(vec3 base, vec3 blend)
                {
                    return 1.0-abs(1.0-base-blend);
                }

                vec3 blendNegation(vec3 base, vec3 blend, float opacity)
                {
                    return (negation(base, blend) * opacity + base * (1.0 - opacity));
                }
                `,
                main: `
                finalColor = vec4(blendNegation(back.rgb, front.rgb, front.a), blendedAlpha) * uBlend;
                `
            },
            gpu: {
                functions: `
                fn blendNegation(base: vec3<f32>, blend: vec3<f32>) -> vec3<f32>
                {
                    return 1.0-abs(1.0-base-blend);
                }

                fn blendNegationOpacity(base: vec3<f32>, blend: vec3<f32>, opacity: f32) -> vec3<f32>
                {
                    return (blendNegation(base, blend) * opacity + base * (1.0 - opacity));
                }
            `,
                main: `
                out = vec4<f32>(blendNegationOpacity(back.rgb, front.rgb, front.a), blendedAlpha) * blendUniforms.uBlend;
            `
            }
        });
    }
}
