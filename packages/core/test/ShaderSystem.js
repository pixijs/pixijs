const { Renderer, Shader, resources, Geometry, UniformGroup, BaseTexture } = require('../');
const { CanvasResource } = resources;
const { skipHello } = require('@pixi/utils');

skipHello();

describe('PIXI.systems.ShaderSystem', function ()
{
    const vertexSrc = `
attribute vec2 aVertexPosition;
attribute vec2 aUvs;

uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;

varying vec2 vUvs;

void main() {

    vUvs = aUvs;
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

}`;

    const fragmentSrc = `
varying vec2 vUvs;

uniform sampler2D uSampler2;
uniform sampler2D uSampler1;

void main() {

    gl_FragColor = mix( texture2D(uSampler1, vUvs), texture2D(uSampler2, vUvs), 0.5) ;
 
}`;

    function createTexture(w, h)
    {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = w;
        canvas.height = h;
        context.fillStyle = 'white';
        context.fillRect(0, 0, w, h);

        return new BaseTexture(new CanvasResource(canvas));
    }

    before(function ()
    {
        this.renderer = new Renderer();
    });

    after(function ()
    {
        this.renderer.destroy();
        this.renderer = null;
    });

    it('should set textures in different groups to different locations', function ()
    {
        const renderer = this.renderer;
        const texture1 = createTexture(10, 10);
        const texture2 = createTexture(20, 20);

        const geometry = new Geometry()
            .addAttribute('aVertexPosition', [-100, -100, 100, -100, 100, 100], 2)
            .addAttribute('aUvs', [0, 0, 1, 0, 1, 1], 2);
        const group1 = UniformGroup.from({ uSampler2: texture1 });
        const uniforms = { uSampler1: texture2, group: group1 };
        const shader = Shader.from(vertexSrc, fragmentSrc, uniforms);

        renderer.shader.bind(shader);
        renderer.geometry.bind(geometry);
        // actually, order is not important. But if behaviour changes, we'll be better knowing about that
        expect(renderer.texture.boundTextures[0]).to.equal(texture2);
        expect(renderer.texture.boundTextures[1]).to.equal(texture1);
    });
});
