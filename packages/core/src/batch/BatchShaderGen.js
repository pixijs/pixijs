import Shader from '../shader/Shader';
import Program from '../shader/Program';
import UniformGroup from '../shader/UniformGroup';
import { Matrix } from '@pixi/math';

import defaultVertex from './texture.vert';
import defaultFragment from './texture.frag';

/**
 * Helper that generates batching multi-texture shader. Use it with your new BatchRenderer
 *
 * @class
 * @memberof PIXI
 */
export default class BatchShaderGen
{
    /**
     * @param {string} vertexSrc
     * @param {string} fragTemplate
     */
    constructor(vertexSrc = BatchShaderGen.defaultVertexSrc, fragTemplate = BatchShaderGen.defaultFragmentTemplate)
    {
        this.vertexSrc = vertexSrc;
        this.fragTemplate = fragTemplate;
        this.programCache = {};
        this.defaultGroupCache = {};
    }

    generateShader(maxTextures)
    {
        if (!this.programCache[maxTextures])
        {
            const sampleValues = new Int32Array(maxTextures);

            for (let i = 0; i < maxTextures; i++)
            {
                sampleValues[i] = i;
            }

            this.defaultGroupCache[maxTextures] = UniformGroup.from({ uSamplers: sampleValues }, true);

            let fragmentSrc = this.fragTemplate;

            fragmentSrc = fragmentSrc.replace(/%count%/gi, `${maxTextures}`);
            fragmentSrc = fragmentSrc.replace(/%forloop%/gi, this.generateSampleSrc(maxTextures));

            this.programCache[maxTextures] = new Program(this.vertexSrc, fragmentSrc);
        }

        const uniforms = {
            tint: new Float32Array([1, 1, 1, 1]),
            translationMatrix: new Matrix(),
            default: this.defaultGroupCache[maxTextures],
        };

        return new Shader(this.programCache[maxTextures], uniforms);
    }

    generateSampleSrc(maxTextures)
    {
        let src = '';

        src += '\n';
        src += '\n';

        for (let i = 0; i < maxTextures; i++)
        {
            if (i > 0)
            {
                src += '\nelse ';
            }

            if (i < maxTextures - 1)
            {
                src += `if(vTextureId < ${i}.5)`;
            }

            src += '\n{';
            src += `\n\tcolor = texture2D(uSamplers[${i}], vTextureCoord);`;
            src += '\n}';
        }

        src += '\n';
        src += '\n';

        return src;
    }

    /**
     * The default vertex shader source
     *
     * @static
     * @type {string}
     * @constant
     */
    static get defaultVertexSrc()
    {
        return defaultVertex;
    }

    /**
     * The default fragment shader source
     *
     * @static
     * @type {string}
     * @constant
     */
    static get defaultFragmentTemplate()
    {
        return defaultFragment;
    }
}
