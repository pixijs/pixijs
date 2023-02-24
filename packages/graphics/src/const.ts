/**
 * Supported line joints in `PIXI.LineStyle` for graphics.
 * @see PIXI.Graphics#lineStyle
 * @see https://graphicdesign.stackexchange.com/questions/59018/what-is-a-bevel-join-of-two-lines-exactly-illustrator
 * @memberof PIXI
 * @static
 * @enum {string}
 */
export enum LINE_JOIN
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * 'miter': make a sharp corner where outer part of lines meet
     * @default miter
     */
    MITER = 'miter',
    /**
     * 'bevel': add a square butt at each end of line segment and fill the triangle at turn
     * @default bevel
     */
    BEVEL = 'bevel',
    /**
     * 'round': add an arc at the joint
     * @default round
     */
    ROUND = 'round'
}

/**
 * Support line caps in `PIXI.LineStyle` for graphics.
 * @see PIXI.Graphics#lineStyle
 * @memberof PIXI
 * @static
 * @enum {string}
 */
export enum LINE_CAP
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * 'butt': don't add any cap at line ends (leaves orthogonal edges)
     * @default butt
     */
    BUTT = 'butt',
    /**
     * 'round': add semicircle at ends
     * @default round
     */
    ROUND = 'round',
    /**
     * 'square': add square at end (like `BUTT` except more length at end)
     * @default square
     */
    SQUARE = 'square'
}

/**
 * @memberof PIXI
 * @deprecated
 */
export interface IGraphicsCurvesSettings
{
    adaptive: boolean;
    maxLength: number;
    minSegments: number;
    maxSegments: number;

    epsilon: number;

    _segmentsCount(length: number, defaultSegments?: number): number;
}

/**
 * @private
 */
export const curves = {
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

/**
 * @static
 * @readonly
 * @memberof PIXI
 * @name GRAPHICS_CURVES
 * @type {object}
 * @deprecated since 7.1.0
 * @see PIXI.Graphics.curves
 */
export const GRAPHICS_CURVES = curves;
