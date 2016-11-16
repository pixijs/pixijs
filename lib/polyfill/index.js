'use strict';

require('./Object.assign');

require('./requestAnimationFrame');

require('./Math.sign');

if (!window.ArrayBuffer) {
    window.ArrayBuffer = Array;
}

if (!window.Float32Array) {
    window.Float32Array = Array;
}

if (!window.Uint32Array) {
    window.Uint32Array = Array;
}

if (!window.Uint16Array) {
    window.Uint16Array = Array;
}
//# sourceMappingURL=index.js.map