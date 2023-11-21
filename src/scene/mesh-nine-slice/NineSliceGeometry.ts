import { Matrix } from '../../maths/matrix/Matrix';
import { PlaneGeometry } from '../mesh-plane/PlaneGeometry';

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
    public static defaultOptions: NineSliceGeometryOptions = {
        width: 100,
        height: 100,
        leftWidth: 10,
        topHeight: 10,
        rightWidth: 10,
        bottomHeight: 10,

        originalWidth: 100,
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
    private readonly _textureMatrix: Matrix = new Matrix();

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

    public update(options: NineSliceGeometryOptions)
    {
        this.updateUvs(options);
        this.updatePositions(options);
    }

    public updatePositions(options: NineSliceGeometryOptions)
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

    public updateUvs(options: NineSliceGeometryOptions)
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

        multiplyUvs(textureMatrix, uvs);

        this.getBuffer('aUV').update();
    }
}

function multiplyUvs(matrix: Matrix, uvs: Float32Array, out?: Float32Array)
{
    out ??= uvs;

    const a = matrix.a;
    const b = matrix.b;
    const c = matrix.c;
    const d = matrix.d;
    const tx = matrix.tx;
    const ty = matrix.ty;

    for (let i = 0; i < uvs.length; i += 2)
    {
        const x = uvs[i];
        const y = uvs[i + 1];

        out[i] = (x * a) + (y * c) + tx;
        out[i + 1] = (x * b) + (y * d) + ty;
    }

    return out;
}
