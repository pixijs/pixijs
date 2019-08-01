let UID = 0;

/**
 * Uniform group holds uniform map and some ID's for work
 *
 * @class
 * @memberof PIXI
 */
export class UniformGroup
{
    /**
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     * @param {boolean} [_static] - Uniforms wont be changed after creation
     */
    constructor(uniforms, _static)
    {
        /**
         * uniform values
         * @member {object}
         * @readonly
         */
        this.uniforms = uniforms;

        /**
         * Its a group and not a single uniforms
         * @member {boolean}
         * @readonly
         * @default true
         */
        this.group = true;

        // lets generate this when the shader ?
        this.syncUniforms = {};

        /**
         * dirty version
         * @protected
         * @member {number}
         */
        this.dirtyId = 0;

        /**
         * unique id
         * @protected
         * @member {number}
         */
        this.id = UID++;

        /**
         * Uniforms wont be changed after creation
         * @member {boolean}
         */
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
