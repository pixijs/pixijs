import BatchShaderGenerator from './BatchShaderGenerator';
import BatchGeometry from './BatchGeometry';
import AbstractBatchRenderer from './AbstractBatchRenderer';
import ViewableBuffer from '../geometry/ViewableBuffer';
import { TYPES } from '@pixi/constants';

import defaultVertex from './texture.vert';
import defaultFragment from './texture.frag';

/**
 * @class
 * @memberof PIXI
 * @hideconstructor
 */
export default class BatchPluginFactory
{
    /**
     * Create a new BatchRenderer plugin for Renderer. this convenience can provide an easy way
     * to extend BatchRenderer with all the necessary pieces.
     * @example
     * const fragment = `
     * varying vec2 vTextureCoord;
     * varying vec4 vColor;
     * varying float vTextureId;
     * uniform sampler2D uSamplers[%count%];
     *
     * void main(void){
     *     vec4 color;
     *     %forloop%
     *     gl_FragColor = vColor * vec4(color.a - color.rgb, color.a);
     * }
     * `;
     * const InvertBatchRenderer = PIXI.BatchPluginFactory.create({ fragment });
     * PIXI.Renderer.registerPlugin('invert', InvertBatchRenderer);
     * const sprite = new PIXI.Sprite();
     * sprite.pluginName = 'invert';
     *
     * @static
     * @param {object} [options]
     * @param {object} [option.attributeDefinitions=Array<Object>] -
     *     Attribute definitions, see PIXI.AbstractBatchRenderer#attributeDefinitions
     * @param {string} [options.vertex=PIXI.BatchPluginFactory.defaultVertexSrc] - Vertex shader source
     * @param {string} [options.fragment=PIXI.BatchPluginFactory.defaultFragmentTemplate] - Fragment shader template
     * @param {number} [options.vertexSize=6] - Vertex size
     * @param {object} [options.geometryClass=PIXI.BatchGeometry]
     * @return {PIXI.BatchRenderer} New batch renderer plugin.
     */
    static create(options)
    {
        const {
            attributeDefinitions,
            fragment,
            geometryClass,
            vertex,
        } = Object.assign({
            attributeDefinitions: [
                {
                    property: 'vertexData',
                    name: 'aVertexPosition',
                    type: 'float32',
                    size: 2,
                    glType: TYPES.FLOAT,
                    glSize: 2,
                },
                {
                    property: 'uvs',
                    name: 'aTextureCoord',
                    type: 'float32',
                    size: 2,
                    glType: TYPES.FLOAT,
                    glSize: 2,
                },
                'aColor', // built-in attribute
                'aTextureId',
            ],
            vertex: defaultVertex,
            fragment: defaultFragment,
            geometryClass: BatchGeometry,
        }, options);

        BatchPluginFactory._checkAttributeDefinitionCompatibility(attributeDefinitions);

        const vertexSize = AbstractBatchRenderer.vertexSizeOf(attributeDefinitions);

        return class BatchPlugin extends AbstractBatchRenderer
        {
            constructor(renderer)
            {
                super(renderer);

                this.attributeDefinitions = attributeDefinitions;
                this.shaderGenerator = new BatchShaderGenerator(vertex, fragment);
                this.geometryClass = geometryClass;
                this.vertexSize = vertexSize;
            }
        };
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

    static _checkAttributeDefinitionCompatibility(definitions)
    {
        definitions.forEach((def) =>
        {
            if (typeof def === 'string')
            {
                return;// built-in attribute
            }

            const inputSize = ViewableBuffer.sizeOf(def.type) * def.size;

            if (inputSize % 4 !== 0)
            {
                throw new Error('Batch rendering requires that your object '
                    + 'attributes be of net size multiple of four. The attribute '
                    + `${def.property}, a.k.a ${def.name}, has a source size of`
                    + `${inputSize}, which is not a multiple of 4. Consider padding`
                    + 'your elements with additional bytes.');
            }

            const outputSize = TYPES.sizeOf(def.glType) * def.glSize;

            if (outputSize !== inputSize)
            {
                throw new Error('Your object- and gl- types do not match in size.'
                    + 'The size of each attribute in the object property array is '
                    + `${inputSize}, while the buffered size is ${outputSize} in bytes.`);
            }

            def._wordSize = inputSize / 4;
        });
    }
}

// Setup the default BatchRenderer plugin, this is what
// we'll actually export at the root level
export const BatchRenderer = BatchPluginFactory.create();
