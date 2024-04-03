import { PlaneGeometry } from '../mesh-plane/PlaneGeometry';

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

        this.updateUvs();
        this.updatePositions();
    }

    /** Updates the positions of the vertices. */
    public updatePositions()
    {
        const positions = this.positions;

        const w = this._leftWidth + this._rightWidth;
        const scaleW = this.width > w ? 1.0 : this.width / w;

        const h = this._topHeight + this._bottomHeight;
        const scaleH = this.height > h ? 1.0 : this.height / h;

        const scale = Math.min(scaleW, scaleH);

        positions[9] = positions[11] = positions[13] = positions[15] = this._topHeight * scale;
        positions[17] = positions[19] = positions[21] = positions[23] = this.height - (this._bottomHeight * scale);
        positions[25] = positions[27] = positions[29] = positions[31] = this.height;

        positions[2] = positions[10] = positions[18] = positions[26] = this._leftWidth * scale;
        positions[4] = positions[12] = positions[20] = positions[28] = this.width - (this._rightWidth * scale);
        positions[6] = positions[14] = positions[22] = positions[30] = this.width;

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

