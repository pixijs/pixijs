import { BlendModeFilter } from './BlendModeFilter';

/** Uses each color channel to select the darker of the following two values; base or blend color */
export class DarkenBlend extends BlendModeFilter
{
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
                fragColor = vec4(blendDarken(back.rgb, front.rgb, front.a), uBlend);
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
                out = vec4<f32>(blendDarken(back.rgb, front.rgb, front.a), blendUniforms.uBlend);
                `
            }
        });
    }
}
