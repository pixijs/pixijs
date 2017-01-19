// Your friendly neighbour https://en.wikipedia.org/wiki/Dihedral_group of order 16
import Matrix from './Matrix';

const ux = [1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1, 0, 1];
const uy = [0, 1, 1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1];
const vx = [0, -1, -1, -1, 0, 1, 1, 1, 0, 1, 1, 1, 0, -1, -1, -1];
const vy = [1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, 1, 1, 1, 0, -1];
const tempMatrices = [];

const mul = [];

function signum(x)
{
    if (x < 0)
    {
        return -1;
    }
    if (x > 0)
    {
        return 1;
    }

    return 0;
}

function init()
{
    for (let i = 0; i < 16; i++)
    {
        const row = [];

        mul.push(row);

        for (let j = 0; j < 16; j++)
        {
            const _ux = signum((ux[i] * ux[j]) + (vx[i] * uy[j]));
            const _uy = signum((uy[i] * ux[j]) + (vy[i] * uy[j]));
            const _vx = signum((ux[i] * vx[j]) + (vx[i] * vy[j]));
            const _vy = signum((uy[i] * vx[j]) + (vy[i] * vy[j]));

            for (let k = 0; k < 16; k++)
            {
                if (ux[k] === _ux && uy[k] === _uy && vx[k] === _vx && vy[k] === _vy)
                {
                    row.push(k);
                    break;
                }
            }
        }
    }

    for (let i = 0; i < 16; i++)
    {
        const mat = new Matrix();

        mat.set(ux[i], uy[i], vx[i], vy[i], 0, 0);
        tempMatrices.push(mat);
    }
}

init();

/**
 * Implements Dihedral Group D_8, see [group D4]{@link http://mathworld.wolfram.com/DihedralGroupD4.html},
 * D8 is the same but with diagonals. Used for texture rotations.
 *
 * Vector xX(i), xY(i) is U-axis of sprite with rotation i
 * Vector yY(i), yY(i) is V-axis of sprite with rotation i
 * Rotations: 0 grad (0), 90 grad (2), 180 grad (4), 270 grad (6)
 * Mirrors: vertical (8), main diagonal (10), horizontal (12), reverse diagonal (14)
 * This is the small part of gameofbombs.com portal system. It works.
 *
 * @author Ivan @ivanpopelyshev
 * @class
 * @memberof PIXI
 */
const GroupD8 = {
    E: 0,
    SE: 1,
    S: 2,
    SW: 3,
    W: 4,
    NW: 5,
    N: 6,
    NE: 7,
    MIRROR_VERTICAL: 8,
    MIRROR_HORIZONTAL: 12,
    uX: (ind) => ux[ind],
    uY: (ind) => uy[ind],
    vX: (ind) => vx[ind],
    vY: (ind) => vy[ind],
    inv: (rotation) =>
    {
        if (rotation & 8)
        {
            return rotation & 15;
        }

        return (-rotation) & 7;
    },
    add: (rotationSecond, rotationFirst) => mul[rotationSecond][rotationFirst],
    sub: (rotationSecond, rotationFirst) => mul[rotationSecond][GroupD8.inv(rotationFirst)],

    /**
     * Adds 180 degrees to rotation. Commutative operation.
     *
     * @memberof PIXI.GroupD8
     * @param {number} rotation - The number to rotate.
     * @returns {number} rotated number
     */
    rotate180: (rotation) => rotation ^ 4,

    /**
     * I dont know why sometimes width and heights needs to be swapped. We'll fix it later.
     *
     * @memberof PIXI.GroupD8
     * @param {number} rotation - The number to check.
     * @returns {boolean} Whether or not the width/height should be swapped.
     */
    isSwapWidthHeight: (rotation) => (rotation & 3) === 2,

    /**
     * @memberof PIXI.GroupD8
     * @param {number} dx - TODO
     * @param {number} dy - TODO
     *
     * @return {number} TODO
     */
    byDirection: (dx, dy) =>
    {
        if (Math.abs(dx) * 2 <= Math.abs(dy))
        {
            if (dy >= 0)
            {
                return GroupD8.S;
            }

            return GroupD8.N;
        }
        else if (Math.abs(dy) * 2 <= Math.abs(dx))
        {
            if (dx > 0)
            {
                return GroupD8.E;
            }

            return GroupD8.W;
        }
        else if (dy > 0)
        {
            if (dx > 0)
            {
                return GroupD8.SE;
            }

            return GroupD8.SW;
        }
        else if (dx > 0)
        {
            return GroupD8.NE;
        }

        return GroupD8.NW;
    },

    /**
     * Helps sprite to compensate texture packer rotation.
     *
     * @memberof PIXI.GroupD8
     * @param {PIXI.Matrix} matrix - sprite world matrix
     * @param {number} rotation - The rotation factor to use.
     * @param {number} tx - sprite anchoring
     * @param {number} ty - sprite anchoring
     */
    matrixAppendRotationInv: (matrix, rotation, tx = 0, ty = 0) =>
    {
        // Packer used "rotation", we use "inv(rotation)"
        const mat = tempMatrices[GroupD8.inv(rotation)];

        mat.tx = tx;
        mat.ty = ty;
        matrix.append(mat);
    },
};

export default GroupD8;
