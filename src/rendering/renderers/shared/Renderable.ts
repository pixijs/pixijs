import type { Matrix } from '../../../maths/Matrix';
import type { BLEND_MODES } from './state/const';
import type { View } from './View';

export interface Renderable<VIEW extends View = View>
{
    uid: number;
    view: VIEW;
    didViewUpdate: boolean;
    layerTransform: Matrix;
    worldTransform: Matrix;
    layerColor: number;
    layerBlendMode: BLEND_MODES;
    layerVisibleRenderable: number;
}
