import { Color, Filter, GlProgram, GpuProgram, UniformGroup } from 'pixi.js';
import fragment from './cartoonText.frag';
import vertex from './cartoonText.vert';
import source from './cartoonText.wgsl';

const defaultOptions = {
  thickness: 1,
  borderColor: 0xffffff,
  topColor: 0xed427c,
  bottomColor: 0xe91e63,
};

/**
 * CartoonTextFilter creates a cartoon-style text effect with outlines, shadows, and gradients.
 * @example
 * ```js
 * import { CartoonTextFilter } from './CartoonTextFilter';
 *
 * const cartoonFilter = new CartoonTextFilter({
 *   thickness: 2.0,
 *   borderColor: 0x000000,
 *   topColor: 0xFFFFFF,
 *   bottomColor: 0x888888
 * });
 * text.filters = [cartoonFilter];
 * ```
 */
export class CartoonTextFilter extends Filter {
  constructor(options) {
    const { thickness, borderColor, topColor, bottomColor } = { ...defaultOptions, ...options };

    const gpuProgram = GpuProgram.from({
      vertex: {
        source,
        entryPoint: 'mainVertex',
      },
      fragment: {
        source,
        entryPoint: 'mainFragment',
      },
    });

    const glProgram = GlProgram.from({
      vertex,
      fragment,
      name: 'cartoon-text-filter',
    });

    super({
      gpuProgram,
      glProgram,
      padding: thickness * 2.1,
      resources: {
        cartoonTextUniforms: new UniformGroup({
          uThickness: { value: thickness, type: 'f32' },
          uBorderColor: { value: new Color(borderColor), type: 'vec3<f32>' },
          uTopColor: { value: new Color(topColor), type: 'vec3<f32>' },
          uBottomColor: { value: new Color(bottomColor), type: 'vec3<f32>' },
        }),
      },
    });
  }

  /**
   * The thickness of the outline effect.
   * @default 2.0
   */
  get thickness() {
    const uniforms = this.resources.cartoonTextUniforms.uniforms;

    return uniforms.uThickness;
  }

  set thickness(value) {
    const uniforms = this.resources.cartoonTextUniforms.uniforms;

    uniforms.uThickness = value;
  }
}
