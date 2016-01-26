// Your friendly neighbour https://en.wikipedia.org/wiki/Dihedral_group of order 16

var ux = [1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1, 0, 1];
var uy = [0, 1, 1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1];
var vx = [0, -1, -1, -1, 0, 1, 1, 1, 0, 1, 1, 1, 0, -1, -1, -1];
var vy = [1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, 1, 1, 1, 0, -1];
var tempMatrices = [];
var Matrix = require('./Matrix');

var mul = [];

function signum(x) {
    if (x < 0) {
        return -1;
    }
    if (x > 0) {
        return 1;
    }
    return 0;
}

function init() {
    for (var i = 0; i < 16; i++) {
        var row = [];
        mul.push(row);
        for (var j = 0; j < 16; j++) {
            var _ux = signum(ux[i] * ux[j] + vx[i] * uy[j]);
            var _uy = signum(uy[i] * ux[j] + vy[i] * uy[j]);
            var _vx = signum(ux[i] * vx[j] + vx[i] * vy[j]);
            var _vy = signum(uy[i] * vx[j] + vy[i] * vy[j]);
            for (var k = 0; k < 16; k++) {
                if (ux[k] === _ux && uy[k] === _uy && vx[k] === _vx && vy[k] === _vy) {
                    row.push(k);
                    break;
                }
            }
        }
    }

    for (i=0;i<16;i++) {
        var mat = new Matrix();
        mat.set(ux[i], uy[i], vx[i], vy[i], 0, 0);
        tempMatrices.push(mat);
    }
}

init();

/**
 * Implements Dihedral Group D_8, see [group D4]{@link http://mathworld.wolfram.com/DihedralGroupD4.html}, D8 is the same but with diagonals
 * Used for texture rotations
 * Vector xX(i), xY(i) is U-axis of sprite with rotation i
 * Vector yY(i), yY(i) is V-axis of sprite with rotation i
 * Rotations: 0 grad (0), 90 grad (2), 180 grad (4), 270 grad (6)
 * Mirrors: vertical (8), main diagonal (10), horizontal (12), reverse diagonal (14)
 * This is the small part of gameofbombs.com portal system. It works.
 * @author Ivan @ivanpopelyshev
 *
 * @namespace PIXI.GroupD8
 */
var GroupD8 = {
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
    uX: function (ind) {
        return ux[ind];
    },
    uY: function (ind) {
        return uy[ind];
    },
    vX: function (ind) {
        return vx[ind];
    },
    vY: function (ind) {
        return vy[ind];
    },
    inv: function (rotation) {
        if (rotation & 8) {
            return rotation & 15;
        }
        return (-rotation) & 7;
    },
    add: function (rotationSecond, rotationFirst) {
        return mul[rotationSecond][rotationFirst];
    },
    sub: function (rotationSecond, rotationFirst) {
        return mul[rotationSecond][GroupD8.inv(rotationFirst)];
    },
    /**
     * Adds 180 degrees to rotation. Commutative operation
     * @param rotation
     * @returns {number}
     */
    rotate180: function (rotation) {
        return rotation ^ 4;
    },
    /**
     * I dont know why sometimes width and heights needs to be swapped. We'll fix it later.
     * @param rotation
     * @returns {boolean}
     */
    isSwapWidthHeight: function(rotation) {
        return (rotation & 3) === 2;
    },
    byDirection: function (dx, dy) {
        if (Math.abs(dx) * 2 <= Math.abs(dy)) {
            if (dy >= 0) {
                return GroupD8.S;
            }
            else {
                return GroupD8.N;
            }
        } else if (Math.abs(dy) * 2 <= Math.abs(dx)) {
            if (dx > 0) {
                return GroupD8.E;
            }
            else {
                return GroupD8.W;
            }
        } else {
            if (dy > 0) {
                if (dx > 0) {
                    return GroupD8.SE;
                }
                else {
                    return GroupD8.SW;
                }
            }
            else if (dx > 0) {
                return GroupD8.NE;
            }
            else {
                return GroupD8.NW;
            }
        }
    },
    /**
     * Helps sprite to compensate texture packer rotation.
     * @param matrix {PIXI.Matrix} sprite world matrix
     * @param rotation {number}
     * @param tx {number|*} sprite anchoring
     * @param ty {number|*} sprite anchoring
     */
    matrixAppendRotationInv: function (matrix, rotation, tx, ty) {
        //Packer used "rotation", we use "inv(rotation)"
        var mat = tempMatrices[GroupD8.inv(rotation)];
        tx = tx || 0;
        ty = ty || 0;
        mat.tx = tx;
        mat.ty = ty;
        matrix.append(mat);
    }
};

module.exports = GroupD8;
