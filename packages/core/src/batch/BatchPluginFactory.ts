import { BatchShaderGenerator } from './BatchShaderGenerator';
import { BatchGeometry } from './BatchGeometry';
import { AbstractBatchRenderer } from './AbstractBatchRenderer';

import defaultVertex from './texture.vert';
import defaultFragment from './texture.frag';

import type { Renderer } from '../Renderer';

export interface IBatchFactoryOptions
{
    vertex?: string;
    fragment?: string;
    geometryClass?: typeof BatchGeometry;
    vertexSize?: number;
}

/**
 * @class
 * @memberof PIXI
 * @hideconstructor
 */
export class BatchPluginFactory
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
     * @param {string} [options.vertex=PIXI.BatchPluginFactory.defaultVertexSrc] - Vertex shader source
     * @param {string} [options.fragment=PIXI.BatchPluginFactory.defaultFragmentTemplate] - Fragment shader template
     * @param {number} [options.vertexSize=6] - Vertex size
     * @param {object} [options.geometryClass=PIXI.BatchGeometry]
     * @return {*} New batch renderer plugin
     */
    static create(options?: IBatchFactoryOptions): typeof AbstractBatchRenderer
    {
        const { vertex, fragment, vertexSize, geometryClass } = Object.assign({
            vertex: defaultVertex,
            fragment: defaultFragment,
            geometryClass: BatchGeometry,
            vertexSize: 6,
        }, options);

        return class BatchPlugin extends AbstractBatchRenderer
        {
            constructor(renderer: Renderer)
            {
                super(renderer);

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
    static get defaultVertexSrc(): string
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
    static get defaultFragmentTemplate(): string
    {
        return defaultFragment;
    }
}

// Setup the default BatchRenderer plugin, this is what
// we'll actually export at the root level
export const BatchRenderer = BatchPluginFactory.create();
