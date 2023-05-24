import { Renderer, Shader, UniformGroup } from '@pixi/core';
import '@pixi/unsafe-eval';

describe('unsafe-eval', () =>
{
    const vertexSrc = `

uniform bool testBool;
uniform float testFloat;

void main() {
    bool t1 = testBool;
    float t2 = testFloat;
    if(!t1) t2 = 0.0;
    gl_Position = vec4(t2, t2, t2, t2);
}`;

    const fragmentSrc = `
void main() {

    gl_FragColor = vec4(1., 1., 1., 1.) ;

}`;

    let renderer: Renderer;

    beforeAll(() =>
    {
        renderer = new Renderer();
    });

    afterAll(() =>
    {
        renderer.destroy();
    });

    it('should be able to set float and bool uniforms', () =>
    {
        const testBool = true;
        const testFloat = 1.0;
        const group1 = UniformGroup.from({ testBool });
        const uniforms = { testFloat, group: group1 };
        const shader = Shader.from(vertexSrc, fragmentSrc, uniforms);

        renderer.shader.bind(shader);
        expect(renderer.shader.getGlProgram().uniformData.testBool.value).toEqual(testBool);
        expect(renderer.shader.getGlProgram().uniformData.testFloat.value).toEqual(testFloat);
    });
});
