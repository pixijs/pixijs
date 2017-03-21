import Program from './Program';
import UniformGroup from './UniformGroup';

// let math = require('../../../math');
/**
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 */
class Shader
{
    /**
     * @param {PIXI.Program} [program] - The program the shader will use.
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     */
    constructor(program, uniforms)
    {
        this.program = program;

        // lets see whats been passed in
        // uniforms should be converted to a uniform group
        if(uniforms)
        {
            if(uniforms instanceof UniformGroup)
            {
                this.uniformGroup = uniforms;
            }
            else
            {
                this.uniformGroup = new UniformGroup(uniforms)
            }
        }
        else
        {
            this.uniformGroup = new UniformGroup({});
        }

        // time to build some getters and setters!
        // I guess down the line this could sort of generate an instruction list rather than use dirty ids?
        // does the trick for now though!
        for (const i in program.uniformData)
        {
            const uniform = this.uniformGroup.uniforms[i];

            if (!uniform) // bad as we need check wher ethe uniforms are..
            {
                //this.uniformGroup.uniforms[i] = program.uniformData[i].value;
            }
            else if (uniform instanceof Array)
            {
                this.uniformGroup.uniforms[i] = new Float32Array(uniform);
            }
        }
    }

    get uniforms()
    {
        return this.uniformGroup.uniforms;
    }
/*

var offsetBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer);
gl.bufferData(gl.ARRAY_BUFFER, offsets, gl.STATIC_DRAW);

var colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

var instanceCount = 4;
var ext = gl.getExtension("ANGLE_instanced_arrays"); // Vendor prefixes may apply!

// Bind the rest of the vertex attributes normally
bindMeshArrays(gl);

// Bind the instance position data
gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer);
gl.enableVertexAttribArray(offsetLocation);
gl.vertexAttribPointer(offsetLocation, 3, gl.FLOAT, false, 12, 0);
ext.vertexAttribDivisorANGLE(offsetLocation, 1); // This makes it instanced!

// Bind the instance color data
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 16, 0);
ext.vertexAttribDivisorANGLE(colorLocation, 1); // This makes it instanced!

// Draw the instanced meshes
ext.drawElementsInstancedANGLE(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0, instanceCount);
*/
    /**
     * A short hand function to create a shader based of a vertex and fragment shader
     *
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     *
     * @returns {PIXI.Shader} an shiney new pixi shader.
     */
    static from(vertexSrc, fragmentSrc, uniforms)
    {
        const program = Program.from(vertexSrc, fragmentSrc);

        return new Shader(program, uniforms);
    }
}

export default Shader;
