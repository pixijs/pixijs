import TransformBase from './TransformBase';

/**
 * Generic class to deal with traditional 2D matrix transforms
 * local transformation is calculated from position,scale,skew and rotation
 *
 * @class
 * @extends PIXI.TransformBase
 * @memberof PIXI
 */
export default class Transform extends TransformBase
{
    /**
     *
     */
    constructor()
    {
        const cache = false;

        super(cache);
    }
}
