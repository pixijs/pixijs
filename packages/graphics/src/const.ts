/**
 * Supported line joints in `PIXI.LineStyle` for graphics.
 *
 * @see PIXI.Graphics#lineStyle
 * @see https://graphicdesign.stackexchange.com/questions/59018/what-is-a-bevel-join-of-two-lines-exactly-illustrator
 *
 * @name LINE_JOIN
 * @memberof PIXI
 * @static
 * @enum {string}
 * @property {string} MITER - 'miter': make a sharp corner where outer part of lines meet
 * @property {string} BEVEL - 'bevel': add a square butt at each end of line segment and fill the triangle at turn
 * @property {string} ROUND - 'round': add an arc at the joint
 */
export enum LINE_JOIN {
    MITER = 'miter',
    BEVEL = 'bevel',
    ROUND = 'round'
}

/**
 * Support line caps in `PIXI.LineStyle` for graphics.
 *
 * @see PIXI.Graphics#lineStyle
 *
 * @name LINE_CAP
 * @memberof PIXI
 * @static
 * @enum {string}
 * @property {string} BUTT - 'butt': don't add any cap at line ends (leaves orthogonal edges)
 * @property {string} ROUND - 'round': add semicircle at ends
 * @property {string} SQUARE - 'square': add square at end (like `BUTT` except more length at end)
 */
export enum LINE_CAP {
    BUTT = 'butt',
    ROUND = 'round',
    SQUARE = 'square'
}

export interface IGraphicsCurvesSettings {
    adaptive: boolean;
    maxLength: number;
    minSegments: number;
    maxSegments: number;

    epsilon: number;

    _segmentsCount(length: number, defaultSegments?: number): number;
}

/**
 * Graphics curves resolution settings. If `adaptive` flag is set to `true`,
 * the resolution is calculated based on the curve's length to ensure better visual quality.
 * Adaptive draw works with `bezierCurveTo` and `quadraticCurveTo`.
 *
 * @static
 * @constant
 * @memberof PIXI
 * @name GRAPHICS_CURVES
 * @type {object}
 * @property {boolean} adaptive=false - flag indicating if the resolution should be adaptive
 * @property {number} maxLength=10 - maximal length of a single segment of the curve (if adaptive = false, ignored)
 * @property {number} minSegments=8 - minimal number of segments in the curve (if adaptive = false, ignored)
 * @property {number} maxSegments=2048 - maximal number of segments in the curve (if adaptive = false, ignored)
 */
export const GRAPHICS_CURVES: IGraphicsCurvesSettings = {
    adaptive: true,
    maxLength: 10,
    minSegments: 8,
    maxSegments:  2048,

    epsilon: 0.0001,

    _segmentsCount(length: number, defaultSegments = 20)
    {
        if (!this.adaptive || !length || isNaN(length))
        {
            return defaultSegments;
        }

        let result = Math.ceil(length / this.maxLength);

        if (result < this.minSegments)
        {
            result = this.minSegments;
        }
        else if (result > this.maxSegments)
        {
            result = this.maxSegments;
        }

        return result;
    },
};
