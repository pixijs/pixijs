'use strict';

exports.__esModule = true;
exports.default = interleaveTypedArrays;

var _getBufferType = require('./getBufferType');

var _getBufferType2 = _interopRequireDefault(_getBufferType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable object-shorthand */
var map = { Float32Array: Float32Array, Uint32Array: Uint32Array, Int32Array: Int32Array, Uint8Array: Uint8Array };

function interleaveTypedArrays(arrays, sizes) {
    var outSize = 0;
    var stride = 0;
    var views = {};

    for (var i = 0; i < arrays.length; i++) {
        stride += sizes[i];
        outSize += arrays[i].length;
    }

    var buffer = new ArrayBuffer(outSize * 4);

    var out = null;
    var littleOffset = 0;

    for (var _i = 0; _i < arrays.length; _i++) {
        var size = sizes[_i];
        var array = arrays[_i];

        var type = (0, _getBufferType2.default)(array);

        if (!views[type]) {
            views[type] = new map[type](buffer);
        }

        out = views[type];

        for (var j = 0; j < array.length; j++) {
            var indexStart = (j / size | 0) * stride + littleOffset;
            var index = j % size;

            out[indexStart + index] = array[j];
        }

        littleOffset += size;
    }

    return new Float32Array(buffer);
}
//# sourceMappingURL=interleaveTypedArrays.js.map