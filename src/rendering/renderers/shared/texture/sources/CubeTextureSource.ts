import { warn } from '../../../../../utils/logging/warn';
import { TextureSource } from './TextureSource';

import type { TextureSourceOptions } from './TextureSource';

/**
 * The 6 faces of a cube map.
 *
 * Naming matches common engine conventions:
 * - left/right: -X/+X
 * - bottom/top: -Y/+Y
 * - back/front: -Z/+Z
 * @category rendering
 * @advanced
 */
export interface CubeTextureFaces<T>
{
    left: T;
    right: T;
    top: T;
    bottom: T;
    front: T;
    back: T;
}

/**
 * Options for creating a {@link CubeTextureSource}.
 * @category rendering
 * @advanced
 */
export interface CubeTextureSourceOptions extends Omit<
    TextureSourceOptions<any>,
    'resource' | 'width' | 'height' | 'dimensions' | 'viewDimension' | 'resolution' | 'format' | 'alphaMode'
>
{
    /**
     * The 6 face sources that make up the cube texture.
     *
     * All faces must match in:
     * - size (pixelWidth / pixelHeight)
     * - resolution
     * - format
     * - alphaMode
     */
    faces: CubeTextureFaces<TextureSource>;
}

/**
 * A {@link TextureSource} that represents a cube texture (6 faces).
 *
 * Internally, WebGPU uses a 2D texture with 6 array layers and a `cube` view.
 * WebGL uses `TEXTURE_CUBE_MAP`.
 * @example
 * Create a cube source from 6 already-created {@link TextureSource} instances:
 *
 * ```ts
 * const cubeSource = new CubeTextureSource({
 *   faces: { right, left, top, bottom, front, back },
 *   label: 'env-map',
 * });
 * ```
 * @category rendering
 * @advanced
 */
export class CubeTextureSource extends TextureSource<CubeTextureFaces<TextureSource>>
{
    /** @internal */
    public override readonly uploadMethodId = 'cube';

    /** The 6 face sources that make up this cube texture. */
    public readonly faces: CubeTextureFaces<TextureSource>;

    constructor(options: CubeTextureSourceOptions)
    {
        const { faces, ...rest } = options;

        // Validate faces are compatible (size/format/alpha/resolution).
        CubeTextureSource._validateFaces(faces);

        const first = faces.right;

        // Derived settings from the face sources.
        const derivedResolution = first.resolution;
        const derivedFormat = first.format;
        const derivedAlphaMode = first.alphaMode;

        // #if _DEBUG
        // CubeTextureSourceOptions omits these keys, but warn if someone still passes them at runtime.
        const ignoredKeys = ([
            'resolution',
            'format',
            'alphaMode',
            'dimensions',
            'viewDimension',
        ] as const).filter((key) => (rest as any)[key] !== undefined);

        if (ignoredKeys.length)
        {
            warn(
                `[CubeTextureSource] Ignoring option(s) [${ignoredKeys.join(', ')}]; these are derived from face sources.`
            );
        }
        // #endif

        super({
            ...rest,
            resource: faces,
            // Keep these aligned with the face sources so any code that reads width/height works.
            width: first.width,
            height: first.height,
            dimensions: '2d',
            viewDimension: 'cube',
            arrayLayerCount: 6,
            resolution: derivedResolution,
            format: derivedFormat,
            alphaMode: derivedAlphaMode,
        });

        this.faces = faces;

        // Forward face updates so the cube gets re-uploaded when any face changes.
        for (const key of Object.keys(faces) as (keyof CubeTextureFaces<TextureSource>)[])
        {
            const face = faces[key];

            face.on('update', this._onFaceUpdate, this);
            face.on('resize', this._onFaceResize, this);
            face.on('unload', this._onFaceUpdate, this);
        }
    }

    public override destroy(): void
    {
        const faces = this.faces;

        if (faces)
        {
            for (const key of Object.keys(faces) as (keyof CubeTextureFaces<TextureSource>)[])
            {
                const face = faces[key];

                face.off('update', this._onFaceUpdate, this);
                face.off('resize', this._onFaceResize, this);
                face.off('unload', this._onFaceUpdate, this);
            }
        }

        super.destroy();
    }

    private _onFaceUpdate()
    {
        this.emit('update', this);
    }

    private _onFaceResize(face: TextureSource)
    {
        // Re-validate and resize the cube source to match the face.
        CubeTextureSource._validateFaces(this.faces);

        this.resize(face.width, face.height, face.resolution);
    }

    private static _validateFaces(faces: CubeTextureFaces<TextureSource>): void
    {
        if (!faces.right || !faces.left || !faces.top || !faces.bottom || !faces.front || !faces.back)
        {
            throw new Error('[CubeTextureSource] Requires { left, right, top, bottom, front, back } faces.');
        }

        const first = faces.right;
        const expectedPixelWidth = first.pixelWidth;
        const expectedPixelHeight = first.pixelHeight;
        const expectedFormat = first.format;
        const expectedAlphaMode = first.alphaMode;
        const expectedResolution = first.resolution;

        for (const key of Object.keys(faces) as (keyof CubeTextureFaces<TextureSource>)[])
        {
            const face = faces[key];

            if (face.pixelWidth !== expectedPixelWidth || face.pixelHeight !== expectedPixelHeight)
            {
                throw new Error(`[CubeTextureSource] Face '${String(key)}' has a different size. All faces must match.`);
            }

            if (face.format !== expectedFormat)
            {
                throw new Error(`[CubeTextureSource] Face '${String(key)}' has a different format. All faces must match.`);
            }

            if (face.alphaMode !== expectedAlphaMode)
            {
                throw new Error(
                    `[CubeTextureSource] Face '${String(key)}' has a different alphaMode. All faces must match.`
                );
            }

            if (face.resolution !== expectedResolution)
            {
                throw new Error(
                    `[CubeTextureSource] Face '${String(key)}' has a different resolution. All faces must match.`
                );
            }
        }
    }
}

