import { canUseNewCanvasBlendModes } from './canUseNewCanvasBlendModes';

import type { BLEND_MODES } from '../../shared/state/const';

const FALLBACK_BLEND: GlobalCompositeOperation = 'source-over';

/**
 * Builds the Canvas blend mode map for Pixi blend enums.
 * @returns A mapping of Pixi blend modes to canvas composite ops.
 * @internal
 */
export function mapCanvasBlendModesToPixi(): Record<BLEND_MODES, GlobalCompositeOperation | null>
{
    const supportsAdvanced = canUseNewCanvasBlendModes();
    const map = Object.create(null) as Record<BLEND_MODES, GlobalCompositeOperation>;

    map.inherit = FALLBACK_BLEND;
    map.none = FALLBACK_BLEND;

    map.normal = 'source-over';
    map.add = 'lighter';
    map.multiply = supportsAdvanced ? 'multiply' : FALLBACK_BLEND;
    map.screen = supportsAdvanced ? 'screen' : FALLBACK_BLEND;
    map.overlay = supportsAdvanced ? 'overlay' : FALLBACK_BLEND;
    map.darken = supportsAdvanced ? 'darken' : FALLBACK_BLEND;
    map.lighten = supportsAdvanced ? 'lighten' : FALLBACK_BLEND;
    map['color-dodge'] = supportsAdvanced ? 'color-dodge' : FALLBACK_BLEND;
    map['color-burn'] = supportsAdvanced ? 'color-burn' : FALLBACK_BLEND;
    map['hard-light'] = supportsAdvanced ? 'hard-light' : FALLBACK_BLEND;
    map['soft-light'] = supportsAdvanced ? 'soft-light' : FALLBACK_BLEND;
    map.difference = supportsAdvanced ? 'difference' : FALLBACK_BLEND;
    map.exclusion = supportsAdvanced ? 'exclusion' : FALLBACK_BLEND;
    map.saturation = supportsAdvanced ? 'saturation' : FALLBACK_BLEND;
    map.color = supportsAdvanced ? 'color' : FALLBACK_BLEND;
    map.luminosity = supportsAdvanced ? 'luminosity' : FALLBACK_BLEND;

    map['linear-burn'] = supportsAdvanced ? 'color-burn' : FALLBACK_BLEND;
    map['linear-dodge'] = supportsAdvanced ? 'color-dodge' : FALLBACK_BLEND;
    map['linear-light'] = supportsAdvanced ? 'hard-light' : FALLBACK_BLEND;
    map['pin-light'] = supportsAdvanced ? 'hard-light' : FALLBACK_BLEND;
    map['vivid-light'] = supportsAdvanced ? 'hard-light' : FALLBACK_BLEND;
    map['hard-mix'] = FALLBACK_BLEND;
    map.negation = supportsAdvanced ? 'difference' : FALLBACK_BLEND;

    map['normal-npm'] = map.normal;
    map['add-npm'] = map.add;
    map['screen-npm'] = map.screen;

    map.erase = 'destination-out';
    map.subtract = FALLBACK_BLEND;
    map.divide = FALLBACK_BLEND;
    map.min = FALLBACK_BLEND;
    map.max = FALLBACK_BLEND;

    return map;
}
