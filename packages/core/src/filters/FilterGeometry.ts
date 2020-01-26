import { Buffer } from '../geometry/Buffer';
import { FilterState } from './FilterState';
import { Geometry } from '../geometry/Geometry';
import { Rectangle } from '@pixi/math';

/**
 * Specialized geometry for default filter vertex-shader.
 *
 * @namespace PIXI
 * @class
 */
export class FilterGeometry extends Geometry
{
    private vertices: Float32Array;
    private vertexBuffer: Buffer;

    constructor()
    {
        super();

        // Initialized later
        this.vertices = new Float32Array(8);
        this.vertexBuffer = new Buffer(this.vertices);

        this.addAttribute('aVertexPosition', this.vertexBuffer)
            .addIndex([0, 1, 2, 0, 2, 3]);
    }

    /**
     * Build geometry from a frame for a filter-state.
     */
    useFrame(frame: Rectangle, state: FilterState): void
    {
        const { sourceFrame } = state;

        const left = (frame.x - sourceFrame.x) / sourceFrame.width;
        const right = left + (frame.width / sourceFrame.width);

        const top = (frame.y - sourceFrame.y) / sourceFrame.height;
        const bottom = right + (frame.height / sourceFrame.height);

        this.copyIntoVerticies(left, right, top, bottom);
    }

    private copyIntoVerticies(left: number, right: number, top: number, bottom: number): void
    {
        this.vertices[0] = left;
        this.vertices[1] = top;
        this.vertices[2] = right;
        this.vertices[3] = top;
        this.vertices[4] = right;
        this.vertices[5] = bottom;
        this.vertices[6] = right;
        this.vertices[7] = top;
    }
}
