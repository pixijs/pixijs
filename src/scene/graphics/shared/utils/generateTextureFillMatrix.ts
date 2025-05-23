import { Matrix } from '../../../../maths/matrix/Matrix';
import { Rectangle } from '../../../../maths/shapes/Rectangle';
import { FillGradient } from '../fill/FillGradient';

import type { ShapePrimitive } from '../../../../maths/shapes/ShapePrimitive';
import type { FillStyle, StrokeStyle } from '../FillTypes';

/**
 * Temporary matrix used for matrix calculations
 * @internal
 */
const tempTextureMatrix = new Matrix();

/**
 * Temporary rectangle used for bounds calculations
 * @internal
 */
const tempRect = new Rectangle();

/**
 * Generates a texture matrix for mapping textures onto shapes.
 * This function handles both local and global texture space mapping.
 *
 * In local space, the texture is mapped to fit exactly within the bounds of the shape.
 * In global space, the texture is mapped using its own dimensions and position.
 * @param out - The matrix to store the result in
 * @param style - The fill style containing texture and mapping properties
 * @param shape - The shape to map the texture onto
 * @param matrix - Optional transform matrix to apply
 * @returns The generated texture matrix for UV mapping
 * @example
 * ```ts
 * const matrix = new Matrix();
 * const textureMatrix = generateTextureMatrix(matrix, fillStyle, shape);
 * // textureMatrix now contains the proper UV mapping for the texture
 * ```
 * @internal
 */
export function generateTextureMatrix(out: Matrix, style: FillStyle | StrokeStyle, shape: ShapePrimitive, matrix?: Matrix)
{
    // Start with either the style's matrix inverted, or identity matrix
    const textureMatrix = style.matrix
        ? out.copyFrom(style.matrix).invert()
        : out.identity();

    if (style.textureSpace === 'local')
    {
        // For local space, map texture to shape's bounds
        const bounds = shape.getBounds(tempRect);

        if ((style as StrokeStyle).width)
        {
            bounds.pad((style as StrokeStyle).width);
        }

        const { x: tx, y: ty } = bounds;
        const sx = 1 / bounds.width;
        const sy = 1 / bounds.height;

        const mTx = -tx * sx;
        const mTy = -ty * sy;

        const a1 = textureMatrix.a;
        const b1 = textureMatrix.b;
        const c1 = textureMatrix.c;
        const d1 = textureMatrix.d;

        textureMatrix.a *= sx;
        textureMatrix.b *= sx;
        textureMatrix.c *= sy;
        textureMatrix.d *= sy;

        textureMatrix.tx = (mTx * a1) + (mTy * c1) + textureMatrix.tx;
        textureMatrix.ty = (mTx * b1) + (mTy * d1) + textureMatrix.ty;
    }
    else
    {
        // For global space, use texture's own dimensions
        textureMatrix.translate(style.texture.frame.x, style.texture.frame.y);
        textureMatrix.scale(1 / (style.texture.source.width), 1 / (style.texture.source.height));
    }

    const sourceStyle = style.texture.source.style;

    // we don't want to set the address mode if the fill is a gradient as this handles its own address mode
    if (!(style.fill instanceof FillGradient) && sourceStyle.addressMode === 'clamp-to-edge')
    {
        sourceStyle.addressMode = 'repeat';
        sourceStyle.update();
    }

    // Apply any additional transform matrix
    if (matrix)
    {
        textureMatrix.append(tempTextureMatrix.copyFrom(matrix).invert());
    }

    return textureMatrix;
}
