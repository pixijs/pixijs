import type EventEmitter from 'eventemitter3';
import type { Matrix } from '../../../maths/matrix/Matrix';
import type { BLEND_MODES } from './state/const';
import type { View } from './view/View';

export interface Renderable<VIEW extends View = View> extends EventEmitter
{
    uid: number;
    view: VIEW;
    didViewUpdate: boolean;
    layerTransform: Matrix;
    worldTransform: Matrix;
    layerAlpha: number;
    layerColor: number;
    layerColorAlpha: number;
    layerBlendMode: BLEND_MODES;
    layerVisibleRenderable: number;
    isRenderable: boolean;
}
