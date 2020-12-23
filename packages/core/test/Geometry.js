const { Buffer, Geometry, Program, Renderer, Shader, Texture } = require('../');

const vert = `
attribute vec2 aVertexPosition;
attribute vec2 aUvs;
uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;
varying vec2 vUvs;

void main() {
    vUvs = aUvs;
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
}`;
const vert2 = `
attribute vec2 aVertexPosition;
uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;
varying vec2 vUvs;

void main() {
    vUvs = aVertexPosition;
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
}`;
const frag = `
varying vec2 vUvs;
uniform sampler2D uSampler;

void main() {
    gl_FragColor = texture2D(uSampler, vUvs);
}`;

describe('PIXI.Geometry', function ()
{
    it('should dispose shared index buffer after all geometries were disposed/destroyed', function ()
    {
        const renderer = new Renderer(1, 1);

        try
        {
            const indices = new Buffer([0, 1, 2, 0, 2, 3], true, true);
            const geometry1 = new Geometry();
            const geometry2 = new Geometry();
            const prog = new Program(vert, frag);
            const shader = new Shader(prog, { uSampler: Texture.WHITE });

            geometry1.addAttribute('aVertexPosition', [-100, -100, 100, -100, 100, 100, -100, 100], 2)
                .addAttribute('aUvs', [0, 0, 1, 0, 1, 1, 0, 1], 2)
                .addIndex(indices);
            geometry2.addAttribute('aVertexPosition', [-100, -100, 100, -100, 100, 100, -100, 100], 2)
                .addAttribute('aUvs', [0, 0, 1, 0, 1, 1, 0, 1], 2)
                .addIndex(indices);

            renderer.geometry.bind(geometry1, shader);
            renderer.geometry.bind(geometry2, shader);

            geometry1.destroy();
            expect(indices.data).to.be.not.null;
            expect(Object.keys(indices._glBuffers).length).to.equal(1);
            geometry2.destroy();
            expect(Object.keys(indices._glBuffers).length).to.equal(0);
        }
        finally
        {
            renderer.destroy();
        }
    });

    it('should dispose buffer if geometry is used by two shaders', function ()
    {
        const renderer = new Renderer(1, 1);

        try
        {
            const indices = new Buffer([0, 1, 2, 0, 2, 3], true, true);
            const geometry = new Geometry();
            const prog = new Program(vert, frag);
            const prog2 = new Program(vert2, frag);
            const shader = new Shader(prog, { uSampler: Texture.WHITE });
            const shader2 = new Shader(prog2, { uSampler: Texture.WHITE });

            geometry.addAttribute('aVertexPosition', [-100, -100, 100, -100, 100, 100, -100, 100], 2)
                .addAttribute('aUvs', [0, 0, 1, 0, 1, 1, 0, 1], 2)
                .addIndex(indices);

            renderer.geometry.bind(geometry, shader);
            renderer.geometry.bind(geometry, shader2);

            // 2 signatures and 2 by shader-ids
            expect(Object.keys(geometry.glVertexArrayObjects).length).to.equal(1);
            expect(Object.keys(geometry.glVertexArrayObjects[renderer.CONTEXT_UID]).length).to.equal(4);
            expect(Object.keys(renderer.geometry.managedGeometries).length).to.equal(1);
            expect(Object.keys(indices._glBuffers).length).to.equal(1);
            expect(indices._glBuffers[renderer.CONTEXT_UID].refCount).to.equal(1);
            geometry.dispose();
            expect(Object.keys(geometry.glVertexArrayObjects).length).to.equal(0);
            expect(Object.keys(renderer.geometry.managedGeometries).length).to.equal(0);
            expect(Object.keys(indices._glBuffers).length).to.equal(0);
            geometry.destroy();
        }
        finally
        {
            renderer.destroy();
        }
    });
});
