import { Renderer, Shader, Geometry } from '@pixi/core';
import { skipHello } from '@pixi/utils';

skipHello();

describe('Shader', () =>
{
    const vertexSrc = `
attribute vec2 aVertexPosition;

void main() {

    gl_Position = vec4(aVertexPosition.x, aVertexPosition.y, 0.0, 1.0);

}`;

    let renderer: Renderer;
    let geometry: Geometry;

    before(() =>
    {
        renderer = new Renderer();
        geometry = new Geometry()
            .addAttribute('aVertexPosition', [-100, -100, 100, -100, 100, 100], 2);
    });

    after(() =>
    {
        renderer.destroy();
        renderer = null;
    });

    it('should be able to set uniform value', () =>
    {
        const fragmentSrc = `
uniform float uTestFloat;

void main() {

    gl_FragColor = vec4(uTestFloat, uTestFloat, uTestFloat, 1.0);

}`;

        const shader = Shader.from(vertexSrc, fragmentSrc);

        shader.uniforms.uTestFloat = 0.88;

        renderer.shader.bind(shader);
        renderer.geometry.bind(geometry);
    });

    it('should be able to set uniform arrays', () =>
    {
        const fragmentSrc = `
uniform float uTestFloat[3];

void main() {

    gl_FragColor = vec4(uTestFloat[0], uTestFloat[1], uTestFloat[2], 1.0);

}`;

        const shader = Shader.from(vertexSrc, fragmentSrc);

        shader.uniforms.uTestFloat = [1, 2, 3];

        renderer.shader.bind(shader);
        renderer.geometry.bind(geometry);
    });

    it('should be able to set uniform structs', () =>
    {
        const fragmentSrc = `
struct Test {
  float testFloat;
};

uniform Test uTest;

void main() {

    gl_FragColor = vec4(uTest.testFloat, 0.0, 0.0, 1.0);

}`;

        const shader = Shader.from(vertexSrc, fragmentSrc);

        shader.uniforms['uTest.testFloat'] = 1;

        renderer.shader.bind(shader);
        renderer.geometry.bind(geometry);
    });

    it('should be able to set uniform struct arrays', () =>
    {
        const fragmentSrc = `
struct Test {
  float testFloat;
  vec3 testVec3;
};

uniform Test uTest[3];

void main() {

    gl_FragColor = vec4(
        uTest[0].testFloat * uTest[0].testVec3.x,
        uTest[1].testFloat * uTest[1].testVec3.y,
        uTest[2].testFloat * uTest[2].testVec3.z,
        1.0);

}`;

        const shader = Shader.from(vertexSrc, fragmentSrc);

        shader.uniforms['uTest[0].testFloat'] = 1.0;
        shader.uniforms['uTest[0].testVec3'] = [1, 2, 3];

        shader.uniforms['uTest[1].testFloat'] = 2.5;
        shader.uniforms['uTest[1].testVec3'] = [1, 2, 3];

        shader.uniforms['uTest[2].testFloat'] = 3.3;
        shader.uniforms['uTest[2].testVec3'] = [1, 2, 3];

        renderer.shader.bind(shader);
        renderer.geometry.bind(geometry);
    });
});
