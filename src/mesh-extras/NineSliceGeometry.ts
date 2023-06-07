import { Matrix } from '../maths/Matrix';
import { PlaneGeometry } from './PlaneGeometry';

export interface NineSliceGeometryOptions
{
    width?: number
    height?: number
    originalWidth?: number
    originalHeight?: number
    leftWidth?: number
    topHeight?: number
    rightWidth?: number
    bottomHeight?: number
    textureMatrix?: Matrix
}

export class NineSliceGeometry extends PlaneGeometry
{
    static defaultOptions: NineSliceGeometryOptions = {
        width: 100,
        height: 100,
        leftWidth: 10,
        topHeight: 10,
        rightWidth: 10,
        bottomHeight: 10,

        originalWidth: 100,
        originalHeight: 100,
    };

    _originalWidth: number;
    _originalHeight: number;
    _leftWidth: number;
    _rightWidth: number;
    _topHeight: number;
    _bottomHeight: number;
    _textureMatrix: Matrix = new Matrix();

    constructor(options: NineSliceGeometryOptions)
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

    update(options: NineSliceGeometryOptions)
    {
        this.updateUvs(options);
        this.updatePositions(options);
    }

    updatePositions(options: NineSliceGeometryOptions)
    {
        this.width = options.width ?? this.width;
        this.height = options.height ?? this.height;

        this._leftWidth = options.leftWidth ?? this._leftWidth;
        this._rightWidth = options.rightWidth ?? this._rightWidth;
        this._topHeight = options.topHeight ?? this._topHeight;
        this._bottomHeight = options.bottomHeight ?? this._bottomHeight;

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

    updateUvs(options: NineSliceGeometryOptions)
    {
        this._originalWidth = options.originalWidth ?? this._originalWidth;
        this._originalHeight = options.originalHeight ?? this._originalHeight;
        this._leftWidth = options.leftWidth ?? this._leftWidth;
        this._rightWidth = options.rightWidth ?? this._rightWidth;
        this._topHeight = options.topHeight ?? this._topHeight;
        this._bottomHeight = options.bottomHeight ?? this._bottomHeight;

        if (options.textureMatrix)
        {
            this._textureMatrix.copyFrom(options.textureMatrix);
        }

        const textureMatrix = this._textureMatrix;

        const a = textureMatrix.a;
        const b = textureMatrix.b;
        const c = textureMatrix.c;
        const d = textureMatrix.d;
        const tx = textureMatrix.tx;
        const ty = textureMatrix.ty;

        const uvs = this.uvs;

        let x = 0;
        let y = 0;

        uvs[0] = uvs[8] = uvs[16] = uvs[24] = (a * x) + (c * y) + tx;
        uvs[1] = uvs[3] = uvs[5] = uvs[7] = (b * x) + (d * y) + ty;

        x = this._originalWidth;
        y = this._originalHeight;

        uvs[6] = uvs[14] = uvs[22] = uvs[30] = (a * x) + (c * y) + tx;
        uvs[25] = uvs[27] = uvs[29] = uvs[31] = (b * x) + (d * y) + ty;

        x = this._leftWidth;
        y = this._topHeight;

        uvs[2] = uvs[10] = uvs[18] = uvs[26] = (a * x) + (c * y) + tx;
        uvs[9] = uvs[11] = uvs[13] = uvs[15] = (b * x) + (d * y) + ty;

        x = this._originalWidth - this._rightWidth;
        y = this._originalHeight - this._bottomHeight;

        uvs[4] = uvs[12] = uvs[20] = uvs[28] = (a * x) + (c * y) + tx;
        uvs[17] = uvs[19] = uvs[21] = uvs[23] = (b * x) + (d * y) + ty;

        this.getBuffer('aUV').update();
    }
}
