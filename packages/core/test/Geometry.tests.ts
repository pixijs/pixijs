import { Buffer, Geometry, Program, Renderer, Shader, Texture } from '@pixi/core';
import { expect } from 'chai';

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

describe('Geometry', function ()
{
    it('should dispose shared index buffer after all geometries were disposed/destroyed', function ()
    {
        const renderer = new Renderer({ width: 1, height: 1 });

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
        const renderer = new Renderer({ width: 1, height: 1 });

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

    it('should correctly merge the index buffers of geometries with different length', function ()
    {
        const geom0 = new Geometry()
            .addAttribute('aVertexPosition', [0, 0, 1, 1, 2, 2], 2)
            .addIndex([0, 1, 2]);
        const geom1 = new Geometry()
            .addAttribute('aVertexPosition', [0, 0, 1, 1, 2, 2, 3, 3], 2)
            .addIndex([0, 1, 2, 3]);

        const geom = Geometry.merge([geom0, geom1]);

        expect([...geom.getIndex().data]).to.have.members([0, 1, 2, 3, 4, 5, 6]);
    });

    it('should create one VAO for shaders with the same attributes and same location specifiers', function ()
    {
        const renderer = new Renderer({ width: 1, height: 1 });

        try
        {
            const indices = new Buffer([0, 1, 2], true, true);
            const prog1 = new Program(`\
                #version 300 es

                precision mediump float;

                layout(location = 0) in vec2 aAttribute1;
                layout(location = 1) in vec3 aAttribute2;

                void main() {
                    gl_Position = vec4(vec3(aAttribute1, 0.0) + aAttribute2, 1.0);
                }`, `\
                #version 300 es

                precision mediump float;

                out vec4 fragColor;

                void main() {
                    fragColor = vec4(1.0);
                }`);
            const shader1 = new Shader(prog1);
            const prog2 = new Program(`\
                #version 300 es

                precision mediump float;

                layout(location = 0) in vec2 aAttribute1;
                layout(location = 1) in vec3 aAttribute2;

                void main() {
                    gl_Position = vec4(vec3(aAttribute1 + aAttribute2.z, aAttribute2.x) + aAttribute2.y, 1.0);
                }`, `\
                #version 300 es

                precision mediump float;

                out vec4 fragColor;

                void main() {
                    fragColor = vec4(1.0);
                }`);
            const shader2 = new Shader(prog2);

            const geometry = new Geometry()
                .addAttribute('aAttribute1', [0, 0, 1, 0, 0, 1], 2)
                .addAttribute('aAttribute2', [0, 0, 0, 1, 0, 0, 0, 1, 0], 3)
                .addIndex(indices);

            renderer.geometry.bind(geometry, shader1);

            const vao1 = renderer.geometry._activeVao;

            renderer.geometry.bind(geometry, shader2);

            const vao2 = renderer.geometry._activeVao;

            expect(vao1).to.equal(vao2);

            geometry.destroy();
        }
        finally
        {
            renderer.destroy();
        }
    });

    it('should create different VAOs for shaders with the same attributes but different location specifiers', function ()
    {
        const renderer = new Renderer({ width: 1, height: 1 });

        try
        {
            const indices = new Buffer([0, 1, 2], true, true);
            const prog1 = new Program(`\
                #version 300 es

                precision mediump float;

                layout(location = 0) in vec2 aAttribute1;
                layout(location = 1) in vec3 aAttribute2;

                void main() {
                    gl_Position = vec4(vec3(aAttribute1, 0.0) + aAttribute2, 1.0);
                }`, `\
                #version 300 es

                precision mediump float;

                out vec4 fragColor;

                void main() {
                    fragColor = vec4(1.0);
                }`);
            const shader1 = new Shader(prog1);
            const prog2 = new Program(`\
                #version 300 es

                precision mediump float;

                layout(location = 1) in vec2 aAttribute1;
                layout(location = 0) in vec3 aAttribute2;

                void main() {
                    gl_Position = vec4(vec3(aAttribute1, 0.0) + aAttribute2, 1.0);
                }`, `\
                #version 300 es

                precision mediump float;

                out vec4 fragColor;

                void main() {
                    fragColor = vec4(1.0);
                }`);
            const shader2 = new Shader(prog2);

            const geometry = new Geometry()
                .addAttribute('aAttribute1', [0, 0, 1, 0, 0, 1], 2)
                .addAttribute('aAttribute2', [0, 0, 0, 1, 0, 0, 0, 1, 0], 3)
                .addIndex(indices);

            renderer.geometry.bind(geometry, shader1);

            const vao1 = renderer.geometry._activeVao;

            renderer.geometry.bind(geometry, shader2);

            const vao2 = renderer.geometry._activeVao;

            expect(vao1).to.not.equal(vao2);

            geometry.destroy();
        }
        finally
        {
            renderer.destroy();
        }
    });

    it('should create compatible VAOs if GeometrySystem.checkCompatibility is disabled', function ()
    {
        const renderer = new Renderer({ width: 1, height: 1 });

        renderer.geometry.checkCompatibility = function () {};

        try
        {
            const indices = new Buffer([0, 1, 2], true, true);
            const prog1 = new Program(`\
                #version 100

                precision mediump float;

                attribute vec2 aAttribute1; // location 0, because "aAttribute1" < "aAttribute2"
                attribute vec3 aAttribute2; // location 1

                void main() {
                    gl_Position = vec4(vec3(aAttribute1, 0.0) + aAttribute2, 1.0);
                }`, `\
                #version 100

                precision mediump float;

                void main() {
                    gl_FragColor = vec4(1.0);
                }`);
            const shader1 = new Shader(prog1);
            const prog2 = new Program(`\
                #version 100

                precision mediump float;

                attribute vec3 aAttribute2; // location 0

                void main() {
                    gl_Position = vec4(aAttribute2, 1.0);
                }`, `\
                #version 100

                precision mediump float;

                void main() {
                    gl_FragColor = vec4(1.0);
                }`);
            const shader2 = new Shader(prog2);

            const geometry = new Geometry()
                .addAttribute('aAttribute2', [0, 0, 0, 1, 0, 0, 0, 1, 0], 3)
                .addIndex(indices);

            renderer.geometry.bind(geometry, shader1);

            const vao1 = renderer.geometry._activeVao;

            renderer.geometry.bind(geometry, shader2);

            const vao2 = renderer.geometry._activeVao;

            expect(vao1).to.not.equal(vao2);

            geometry.destroy();
        }
        finally
        {
            renderer.destroy();
        }
    });
});
