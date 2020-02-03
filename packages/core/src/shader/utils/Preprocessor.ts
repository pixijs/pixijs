/**
 * Created by hazed on 30.01.2020.
 */

import { setPrecision } from './setPrecision';
import { getMaxFragmentPrecision } from './getMaxFragmentPrecision';
import { PRECISION } from '@pixi/constants';
import { settings } from '@pixi/settings';

const nameCache: { [key: string]: number } = {};

export interface IOptions
{
    isRawShader?: boolean;
    defines?: { [key: string]: any };
    [key: string]: any;
}

/**
 * Helper class to preprocessing a shader program.
 *
 * @class
 * @memberof PIXI
 */
export class Preprocessor
{
    public vertex: string;
    public fragment: string;

    /**
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     * @param {string} [name=pixi-shader] - Name for shader
     * @param {IOptions} [options = { isRawShader: false, defines: {} }] - Options for preprocessor,
     *  include isRawShader and defines, of other for custom preprocessors
     */
    constructor(vertexSrc: string,
        fragmentSrc: string,
        name = 'pixi-shader',
        options: IOptions = { isRawShader: false, defines: {} })
    {
        this.vertex = vertexSrc.trim();
        this.fragment = fragmentSrc.trim();

        options.isRawShader = options.isRawShader || (this.vertex.substring(0, 8) === '#version');

        if (!options.isRawShader)
        {
            name = name.replace(/\s+/g, '-');

            if (nameCache[name])
            {
                nameCache[name]++;
                // TODO: incremented name in shader code breaks ProgramCache functionality
                // name += `-${nameCache[name]}`;
            }
            else
            {
                nameCache[name] = 1;
            }

            // Setup default define for shader name
            options.defines.SHADER_NAME = name;

            // Setup custom defines
            for (const define in options.defines)
            {
                const value = options.defines[define];

                this.vertex = `#define ${define} ${value}\n${this.vertex}`;
                this.fragment = `#define ${define} ${value}\n${this.fragment}`;
            }

            this.vertex = setPrecision(this.vertex, settings.PRECISION_VERTEX, PRECISION.HIGH);
            this.fragment = setPrecision(this.fragment, settings.PRECISION_FRAGMENT, getMaxFragmentPrecision());
        }
    }
}
