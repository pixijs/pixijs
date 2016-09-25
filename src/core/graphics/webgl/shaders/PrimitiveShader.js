import Shader from '../../../Shader';

/**
 * This shader is used to draw simple primitive shapes for {@link PIXI.Graphics}.
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 */
export default class PrimitiveShader extends Shader
{
    /**
     * @param {WebGLRenderingContext} gl - The webgl shader manager this shader works for.
     */
    constructor(gl)
    {
        super(gl,
            // vertex shader
            [
                'attribute vec2 aVertexPosition;',
                'attribute vec4 aColor;',

                'uniform mat3 translationMatrix;',
                'uniform mat3 projectionMatrix;',

                'uniform float alpha;',
                'uniform vec3 tint;',

                'varying vec4 vColor;',

                'void main(void){',
                '   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
                '   vColor = aColor * vec4(tint * alpha, alpha);',
                '}',
            ].join('\n'),
            // fragment shader
            [
                'varying vec4 vColor;',

                'void main(void){',
                '   gl_FragColor = vColor;',
                '}',
            ].join('\n')
        );
    }
}
