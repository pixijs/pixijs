'use strict';

exports.__esModule = true;

var _WebGLExtract = require('./webgl/WebGLExtract');

Object.defineProperty(exports, 'webgl', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_WebGLExtract).default;
  }
});

var _CanvasExtract = require('./canvas/CanvasExtract');

Object.defineProperty(exports, 'canvas', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_CanvasExtract).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=index.js.map