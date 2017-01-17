'use strict';

exports.__esModule = true;

var _Matrix = require('./Matrix');

var _Matrix2 = _interopRequireDefault(_Matrix);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ux = [1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1, 0, 1]; // Your friendly neighbour https://en.wikipedia.org/wiki/Dihedral_group of order 16

var uy = [0, 1, 1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1];
var vx = [0, -1, -1, -1, 0, 1, 1, 1, 0, 1, 1, 1, 0, -1, -1, -1];
var vy = [1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, 1, 1, 1, 0, -1];
var tempMatrices = [];

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

    for (var _i = 0; _i < 16; _i++) {
        var mat = new _Matrix2.default();

        mat.set(ux[_i], uy[_i], vx[_i], vy[_i], 0, 0);
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
    uX: function uX(ind) {
        return ux[ind];
    },
    uY: function uY(ind) {
        return uy[ind];
    },
    vX: function vX(ind) {
        return vx[ind];
    },
    vY: function vY(ind) {
        return vy[ind];
    },
    inv: function inv(rotation) {
        if (rotation & 8) {
            return rotation & 15;
        }

        return -rotation & 7;
    },
    add: function add(rotationSecond, rotationFirst) {
        return mul[rotationSecond][rotationFirst];
    },
    sub: function sub(rotationSecond, rotationFirst) {
        return mul[rotationSecond][GroupD8.inv(rotationFirst)];
    },

    /**
     * Adds 180 degrees to rotation. Commutative operation.
     *
     * @memberof PIXI.GroupD8
     * @param {number} rotation - The number to rotate.
     * @returns {number} rotated number
     */
    rotate180: function rotate180(rotation) {
        return rotation ^ 4;
    },

    /**
     * I dont know why sometimes width and heights needs to be swapped. We'll fix it later.
     *
     * @memberof PIXI.GroupD8
     * @param {number} rotation - The number to check.
     * @returns {boolean} Whether or not the width/height should be swapped.
     */
    isSwapWidthHeight: function isSwapWidthHeight(rotation) {
        return (rotation & 3) === 2;
    },

    /**
     * @memberof PIXI.GroupD8
     * @param {number} dx - TODO
     * @param {number} dy - TODO
     *
     * @return {number} TODO
     */
    byDirection: function byDirection(dx, dy) {
        if (Math.abs(dx) * 2 <= Math.abs(dy)) {
            if (dy >= 0) {
                return GroupD8.S;
            }

            return GroupD8.N;
        } else if (Math.abs(dy) * 2 <= Math.abs(dx)) {
            if (dx > 0) {
                return GroupD8.E;
            }

            return GroupD8.W;
        } else if (dy > 0) {
            if (dx > 0) {
                return GroupD8.SE;
            }

            return GroupD8.SW;
        } else if (dx > 0) {
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
    matrixAppendRotationInv: function matrixAppendRotationInv(matrix, rotation) {
        var tx = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var ty = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

        // Packer used "rotation", we use "inv(rotation)"
        var mat = tempMatrices[GroupD8.inv(rotation)];

        mat.tx = tx;
        mat.ty = ty;
        matrix.append(mat);
    }
};

exports.default = GroupD8;
//# sourceMappingURL=GroupD8.js.map