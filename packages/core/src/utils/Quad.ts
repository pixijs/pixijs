import { Geometry } from '../geometry/Geometry';

/**
 * Helper class to create a quad
 *
 * @class
 * @memberof PIXI
 */
export class Quad extends Geometry
{
    constructor()
    {
        super();

        this.addAttribute('aVertexPosition', new Float32Array([
            0, 0,
            1, 0,
            1, 1,
            0, 1,
        ]))
            .addIndex([0, 1, 3, 2]);
    }
}
