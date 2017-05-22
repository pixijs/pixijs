let UID = 0;

// let math = require('../../../math');
/**
 * @class
 * @memberof PIXI
 * @extends PIXI.UniformGroup
 */
class UniformGroup
{
    /**
     * @param {PIXI.Program} [program] - The program the shader will use.
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     */
    constructor(uniforms, _static)
    {
        this.uniforms = uniforms;
        this.group = true;
        // lets generate this when the shader ?
        this.syncUniforms = {};
        this.dirtyId = 0;
        this.id = UID++;

        this.static = !!_static;
    }

    update()
    {
        this.dirtyId++;
    }

    add(name, uniforms, _static)
    {
        this.uniforms[name] = new UniformGroup(uniforms, _static);
    }

    static from(uniforms, _static)
    {
        return new UniformGroup(uniforms, _static);
    }
}

export default UniformGroup;
