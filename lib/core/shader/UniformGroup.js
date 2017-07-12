"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UID = 0;

// let math = require('../../../math');
/**
 * @class
 * @memberof PIXI
 * @extends PIXI.UniformGroup
 */

var UniformGroup = function () {
    /**
     * @param {PIXI.Program} [program] - The program the shader will use.
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     */
    function UniformGroup(uniforms, _static) {
        _classCallCheck(this, UniformGroup);

        this.uniforms = uniforms;
        this.group = true;
        // lets generate this when the shader ?
        this.syncUniforms = {};
        this.dirtyId = 0;
        this.id = UID++;

        this.static = !!_static;
    }

    UniformGroup.prototype.update = function update() {
        this.dirtyId++;
    };

    UniformGroup.prototype.add = function add(name, uniforms, _static) {
        this.uniforms[name] = new UniformGroup(uniforms, _static);
    };

    UniformGroup.from = function from(uniforms, _static) {
        return new UniformGroup(uniforms, _static);
    };

    return UniformGroup;
}();

exports.default = UniformGroup;
//# sourceMappingURL=UniformGroup.js.map