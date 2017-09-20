import Shader from '../../core/Shader';

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI
 */
export default class ParticleShader extends Shader
{
    /**
     * @param {PIXI.Shader} gl - The webgl shader manager this shader works for.
     */
    constructor(gl)
    {
        super(
            gl,
            // vertex shader
            [
                'attribute vec2 aVertexPosition;',
                'attribute vec2 aTextureCoord;',
                'attribute vec4 aColor;',

                'attribute vec2 aPositionCoord;',
                'attribute vec2 aScale;',
                'attribute float aRotation;',

                'uniform mat3 projectionMatrix;',
                'uniform vec4 uColor;',

                'varying vec2 vTextureCoord;',
                'varying vec4 vColor;',

                'void main(void){',
                '   vec2 v = aVertexPosition;',

                '   v.x = (aVertexPosition.x) * cos(aRotation) - (aVertexPosition.y) * sin(aRotation);',
                '   v.y = (aVertexPosition.x) * sin(aRotation) + (aVertexPosition.y) * cos(aRotation);',
                '   v = v + aPositionCoord;',

                '   gl_Position = vec4((projectionMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);',

                '   vTextureCoord = aTextureCoord;',
                '   vColor = aColor * uColor;',
                '}',
            ].join('\n'),
            // hello
            [
                'varying vec2 vTextureCoord;',
                'varying vec4 vColor;',

                'uniform sampler2D uSampler;',

                'void main(void){',
                '  vec4 color = texture2D(uSampler, vTextureCoord) * vColor;',
                '  if (color.a == 0.0) discard;',
                '  gl_FragColor = color;',
                '}',
            ].join('\n')
        );
    }
}
