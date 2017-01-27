import extractUniformsFromSrc from './extractUniformsFromSrc';
import extractAttributesFromSrc from './extractAttributesFromSrc';
import generateUniformsSync from './generateUniformsSync';

let UID = 0;

// let math = require('../../../math');
/**
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 */
class Program
{
    /**
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     */
    constructor(vertexSrc, fragmentSrc)
    {
        /**
         * The vertex shader.
         *
         * @member {string}
         */
        this.vertexSrc = vertexSrc || Shader.defaultVertexSrc;

        /**
         * The fragment shader.
         *
         * @member {string}
         */
        this.fragmentSrc = fragmentSrc || Shader.defaultFragmentSrc;

        // pull out the vertex and shader uniforms if they are not specified..
        // currently this does not extract structs only default types
        this.uniformData = extractUniformsFromSrc(this.vertexSrc, this.fragmentSrc);
        // TODO - 'projectionMatrix|uSampler|translationMatrix');

        this.attributeData = extractAttributesFromSrc(this.vertexSrc);

        this.uniforms = {};

        // time to build some getters and setters!
        // I guess down the line this could sort of generate an instruction list rather than use dirty ids?
        // does the trick for now though!
        for (const i in this.uniformData)
        {
            if (!this.uniforms[i])
            {
                this.uniforms[i] = this.uniformData[i].value;
            }
        }

        // this is where we store shader references..
        // TODO we could cache this!
        this.glShaders = {};

        this.syncUniforms = generateUniformsSync(this.uniformData);
        this.id = UID++;
    }

    /**
     * The default vertex shader source
     *
     * @static
     * @constant
     */
    static get defaultVertexSrc()
    {
        return [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',

            'uniform mat3 projectionMatrix;',
            'uniform mat3 filterMatrix;',

            'varying vec2 vTextureCoord;',
            'varying vec2 vFilterCoord;',

            'void main(void){',
            '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '   vFilterCoord = ( filterMatrix * vec3( aTextureCoord, 1.0)  ).xy;',
            '   vTextureCoord = aTextureCoord ;',
            '}',
        ].join('\n');
    }

    /**
     * The default fragment shader source
     *
     * @static
     * @constant
     */
    static get defaultFragmentSrc()
    {
        return [
            'varying vec2 vTextureCoord;',
            'varying vec2 vFilterCoord;',

            'uniform sampler2D uSampler;',
            'uniform sampler2D filterSampler;',

            'void main(void){',
            '   vec4 masky = texture2D(filterSampler, vFilterCoord);',
            '   vec4 sample = texture2D(uSampler, vTextureCoord);',
            '   vec4 color;',
            '   if(mod(vFilterCoord.x, 1.0) > 0.5)',
            '   {',
            '     color = vec4(1.0, 0.0, 0.0, 1.0);',
            '   }',
            '   else',
            '   {',
            '     color = vec4(0.0, 1.0, 0.0, 1.0);',
            '   }',
            '   gl_FragColor = mix(sample, masky, 0.5);',
            '   gl_FragColor *= sample.a;',
            '}',
        ].join('\n');
    }
}

export default Program;
