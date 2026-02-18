import { type PointData } from '../../maths/point/PointData';
import { PlaneGeometry } from '../mesh-plane/PlaneGeometry';

/**
 * Options for the NineSliceGeometry.
 * @category scene
 * @advanced
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

    /**
     * The trim rectangle of the texture, describing the offset and size of the visible
     * pixel area within the original (unpadded) frame. When provided, UV coordinates are
     * clamped to the trimmed region so that transparent padding in the atlas does not
     * bleed into the rendered corners/edges.
     * @default null
     */
    trim?: { x: number; y: number; width: number; height: number } | null
}

/**
 * The NineSliceGeometry class allows you to create a NineSlicePlane object.
 * @category scene
 * @advanced
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

    /** @internal */
    public _leftWidth: number;
    /** @internal */
    public _rightWidth: number;
    /** @internal */
    public _topHeight: number;
    /** @internal */
    public _bottomHeight: number;

    private _originalWidth: number;
    private _originalHeight: number;
    private _trimX: number;
    private _trimY: number;
    private _trimWidth: number;
    private _trimHeight: number;
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

        // Initialise trim fields before update() so updateUvs() has valid values
        this._trimX = 0;
        this._trimY = 0;
        this._trimWidth = options.originalWidth ?? NineSliceGeometry.defaultOptions.originalWidth;
        this._trimHeight = options.originalHeight ?? NineSliceGeometry.defaultOptions.originalHeight;

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

        // Update trim values whenever they are explicitly provided (including null to reset)
        if (options.trim !== undefined)
        {
            this._trimX = options.trim?.x ?? 0;
            this._trimY = options.trim?.y ?? 0;
            this._trimWidth = options.trim?.width ?? this._originalWidth;
            this._trimHeight = options.trim?.height ?? this._originalHeight;
        }

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

        const origW = this._originalWidth;
        const origH = this._originalHeight;

        // Compute the UV bounds for the trimmed region within the original texture space.
        // When the texture has no trim, these default to [0, 1] (the full orig area).
        // When the texture is trimmed, UV coordinates are offset so that only the visible
        // pixel area is sampled, preventing transparent padding from bleeding into corners.
        const u0 = this._trimX / origW;
        const v0 = this._trimY / origH;
        const u1 = (this._trimX + this._trimWidth) / origW;
        const v1 = (this._trimY + this._trimHeight) / origH;

        uvs[0] = uvs[8] = uvs[16] = uvs[24] = u0;
        uvs[1] = uvs[3] = uvs[5] = uvs[7] = v0;

        uvs[6] = uvs[14] = uvs[22] = uvs[30] = u1;
        uvs[25] = uvs[27] = uvs[29] = uvs[31] = v1;

        const _uvw = 1.0 / origW;
        const _uvh = 1.0 / origH;

        uvs[2] = uvs[10] = uvs[18] = uvs[26] = u0 + (_uvw * this._leftWidth);
        uvs[9] = uvs[11] = uvs[13] = uvs[15] = v0 + (_uvh * this._topHeight);

        uvs[4] = uvs[12] = uvs[20] = uvs[28] = u1 - (_uvw * this._rightWidth);
        uvs[17] = uvs[19] = uvs[21] = uvs[23] = v1 - (_uvh * this._bottomHeight);

        this.getBuffer('aUV').update();
    }
}

