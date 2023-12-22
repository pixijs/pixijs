import type EventEmitter from 'eventemitter3';
import type { Matrix } from '../../../maths/matrix/Matrix';
import type { BLEND_MODES } from './state/const';
import type { View } from './view/View';

export interface Renderable<VIEW extends View = View> extends EventEmitter
{
    uid: number;
    view: VIEW;
    didViewUpdate: boolean;
    rgTransform: Matrix;
    worldTransform: Matrix;
    rgAlpha: number;
    rgColor: number;
    rgColorAlpha: number;
    rgBlendMode: BLEND_MODES;
    rgVisibleRenderable: number;
    isRenderable: boolean;
}
