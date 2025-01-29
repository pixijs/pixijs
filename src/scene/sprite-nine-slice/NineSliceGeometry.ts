import { PlaneGeometry } from '../mesh-plane/PlaneGeometry';
import { type PointData } from '~/maths/point/PointData';

/**
 * Options for the NineSliceGeometry.
 * @memberof scene
 */
export interface NineSliceGeometryOptions
{

    /** The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane. */
    width?: number
    /** The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane. */
    height?: number
    /** The original width of the texture */
    originalWidth?: number
    /** The original height of the texture */
    originalHeight?: number
    /** The width of the left column. */
    leftWidth?: number
    /** The height of the top row. */
    topHeight?: number
    /** The width of the right column. */
    rightWidth?: number
    /** The height of the bottom row. */
    bottomHeight?: number

    /** The anchor point of the NineSliceSprite. */
    anchor?: PointData
}

/**
 * The NineSliceGeometry class allows you to create a NineSlicePlane object.
 * @memberof scene
 */
export class NineSliceGeometry extends PlaneGeometry
{
    /** The default options for the NineSliceGeometry. */
    public static defaultOptions: NineSliceGeometryOptions = {
        /** The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane. */
        width: 100,
        /** The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane. */
        height: 100,
        /** The width of the left column. */
        leftWidth: 10,
        /** The height of the top row. */
        topHeight: 10,
        /** The width of the right column. */
        rightWidth: 10,
        /** The height of the bottom row. */
        bottomHeight: 10,

        /** The original width of the texture */
        originalWidth: 100,
        /** The original height of the texture */
        originalHeight: 100,
    };

    public _leftWidth: number;
    public _rightWidth: number;
    public _topHeight: number;
    public _bottomHeight: number;

    private _originalWidth: number;
    private _originalHeight: number;
    private _anchorX: any;
    private _anchorY: number;

    constructor(options: NineSliceGeometryOptions = {})
    {
        options = { ...NineSliceGeometry.defaultOptions, ...options };

        super({
            width: options.width,
            height: options.height,
            verticesX: 4,
            verticesY: 4,
        });

        this.update(options);
    }

    /**
     * Updates the NineSliceGeometry with the options.
     * @param options - The options of the NineSliceGeometry.
     */
    public update(options: NineSliceGeometryOptions)
    {
        this.width = options.width ?? this.width;
        this.height = options.height ?? this.height;
        this._originalWidth = options.originalWidth ?? this._originalWidth;
        this._originalHeight = options.originalHeight ?? this._originalHeight;
        this._leftWidth = options.leftWidth ?? this._leftWidth;
        this._rightWidth = options.rightWidth ?? this._rightWidth;
        this._topHeight = options.topHeight ?? this._topHeight;
        this._bottomHeight = options.bottomHeight ?? this._bottomHeight;

        this._anchorX = options.anchor?.x;
        this._anchorY = options.anchor?.y;

        this.updateUvs();
        this.updatePositions();
    }

    /** Updates the positions of the vertices. */
    public updatePositions()
    {
        const p = this.positions;
        const {
            width,
            height,
            _leftWidth,
            _rightWidth,
            _topHeight,
            _bottomHeight,
            _anchorX,
            _anchorY,
        } = this;

        const w = _leftWidth + _rightWidth;
        const scaleW = width > w ? 1.0 : width / w;

        const h = _topHeight + _bottomHeight;
        const scaleH = height > h ? 1.0 : height / h;

        const scale = Math.min(scaleW, scaleH);

        const anchorOffsetX = _anchorX * width;
        const anchorOffsetY = _anchorY * height;

        p[0] = p[8] = p[16] = p[24] = -anchorOffsetX;
        p[2] = p[10] = p[18] = p[26] = (_leftWidth * scale) - anchorOffsetX;
        p[4] = p[12] = p[20] = p[28] = width - (_rightWidth * scale) - anchorOffsetX;
        p[6] = p[14] = p[22] = p[30] = width - anchorOffsetX;

        p[1] = p[3] = p[5] = p[7] = -anchorOffsetY;
        p[9] = p[11] = p[13] = p[15] = (_topHeight * scale) - anchorOffsetY;
        p[17] = p[19] = p[21] = p[23] = height - (_bottomHeight * scale) - anchorOffsetY;
        p[25] = p[27] = p[29] = p[31] = height - anchorOffsetY;

        this.getBuffer('aPosition').update();
    }

    /** Updates the UVs of the vertices. */
    public updateUvs()
    {
        const uvs = this.uvs;

        uvs[0] = uvs[8] = uvs[16] = uvs[24] = 0;
        uvs[1] = uvs[3] = uvs[5] = uvs[7] = 0;

        uvs[6] = uvs[14] = uvs[22] = uvs[30] = 1;
        uvs[25] = uvs[27] = uvs[29] = uvs[31] = 1;

        const _uvw = 1.0 / this._originalWidth;
        const _uvh = 1.0 / this._originalHeight;

        uvs[2] = uvs[10] = uvs[18] = uvs[26] = _uvw * this._leftWidth;
        uvs[9] = uvs[11] = uvs[13] = uvs[15] = _uvh * this._topHeight;

        uvs[4] = uvs[12] = uvs[20] = uvs[28] = 1 - (_uvw * this._rightWidth);
        uvs[17] = uvs[19] = uvs[21] = uvs[23] = 1 - (_uvh * this._bottomHeight);

        this.getBuffer('aUV').update();
    }
}

