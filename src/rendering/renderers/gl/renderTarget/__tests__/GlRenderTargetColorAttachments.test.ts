import { Geometry } from '../../../shared/geometry/Geometry';
import { RenderTarget } from '../../../shared/renderTarget/RenderTarget';
import { Shader } from '../../../shared/shader/Shader';
import { TextureSource } from '../../../shared/texture/sources/TextureSource';
import { Texture } from '../../../shared/texture/Texture';
import { CLEAR } from '../../const';
import { getWebGLRenderer } from '@test-utils';
import { AlphaFilter } from '~/filters';
import { Container, Graphics, Mesh, Sprite } from '~/scene';

import type { WebGLRenderer } from '../../WebGLRenderer';

let renderer: WebGLRenderer;

afterEach(() =>
{
    renderer?.destroy();
    renderer = null;
});

/**
 * A full-target quad writing green to attachment 0 and blue to attachment 1, without blending
 * @param tag - makes the source unique, for a program that GlProgram.from hasn't cached yet
 */
function twoOutputQuad(tag = ''): Mesh<Geometry, Shader>
{
    const mesh = new Mesh({
        geometry: new Geometry({ attributes: { aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1] } }),
        shader: Shader.from({
            gl: {
                vertex: `#version 300 es
                    in vec2 aPosition;
                    void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
                `,
                fragment: `#version 300 es
                    // ${tag}
                    precision mediump float;
                    layout(location = 0) out vec4 color0;
                    layout(location = 1) out vec4 color1;
                    void main()
                    {
                        color0 = vec4(0.0, 1.0, 0.0, 1.0);
                        color1 = vec4(0.0, 0.0, 1.0, 1.0);
                    }
                `,
            },
        }),
    });

    mesh.state.blend = false;

    return mesh;
}

function source(antialias = false, format?: TextureSource['format']): TextureSource
{
    return new TextureSource({ width: 16, height: 16, resolution: 1, antialias, ...(format ? { format } : {}) });
}

/**
 * Reads the centre texel of a resolved color attachment
 * @param r - the renderer
 * @param target - the render target
 * @param index - the color attachment to read
 * @param x - the column to read, on the middle row
 */
function readAttachment(r: WebGLRenderer, target: RenderTarget, index: number, x = 8): number[]
{
    const gl = r.gl as WebGL2RenderingContext;
    const glRenderTarget = r.renderTarget.getGpuRenderTarget(target);
    const pixel = new Uint8Array(4);

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, glRenderTarget.resolveTargetFramebuffer);
    gl.readBuffer(gl.COLOR_ATTACHMENT0 + index);
    gl.readPixels(x, 8, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    gl.readBuffer(gl.COLOR_ATTACHMENT0);
    r.renderTarget.resetState();

    return Array.from(pixel);
}

/**
 * Reads the centre texel's first channel of an unsigned-integer color attachment
 * @param r - the renderer
 * @param target - the render target
 * @param index - the color attachment to read
 */
function readUintAttachment(r: WebGLRenderer, target: RenderTarget, index: number): number
{
    const gl = r.gl as WebGL2RenderingContext;
    const glRenderTarget = r.renderTarget.getGpuRenderTarget(target);
    const texel = new Uint32Array(4);

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, glRenderTarget.resolveTargetFramebuffer);
    gl.readBuffer(gl.COLOR_ATTACHMENT0 + index);
    gl.readPixels(8, 8, 1, 1, gl.RGBA_INTEGER, gl.UNSIGNED_INT, texel);
    gl.readBuffer(gl.COLOR_ATTACHMENT0);
    r.renderTarget.resetState();

    return texel[0];
}

describe('GlRenderTargetAdaptor with several color attachments', () =>
{
    it('leaves the attachments a shader does not write alone', async () =>
    {
        renderer = await getWebGLRenderer();

        const target = new RenderTarget({ colorTextures: [source(), source()] });
        const sprite = new Sprite(Texture.WHITE);

        sprite.width = 16;
        sprite.height = 16;

        renderer.render({ target, container: twoOutputQuad(), clear: true, clearColor: [0, 0, 0, 0] });
        // the sprite's shader writes location 0 only
        renderer.render({ target, container: sprite, clear: false });

        expect(readAttachment(renderer, target, 0)).toEqual([255, 255, 255, 255]);
        expect(readAttachment(renderer, target, 1)).toEqual([0, 0, 255, 255]);
    });

    it('writes nothing when the shader\'s only output is past the last attachment', async () =>
    {
        renderer = await getWebGLRenderer();

        const gl = renderer.gl as WebGL2RenderingContext;
        const target = new RenderTarget({ colorTextures: [source(), source()] });
        const outOfRange = new Mesh({
            geometry: new Geometry({ attributes: { aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1] } }),
            shader: Shader.from({
                gl: {
                    vertex: `#version 300 es
                        in vec2 aPosition;
                        void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
                    `,
                    fragment: `#version 300 es
                        precision mediump float;
                        layout(location = 2) out vec4 extra;
                        void main() { extra = vec4(1.0); }
                    `,
                },
            }),
        });

        outOfRange.state.blend = false;

        renderer.render({ target, container: twoOutputQuad(), clear: true, clearColor: [0, 0, 0, 0] });
        // no attachment is on (mask 0, drawBuffers([NONE])), so both keep the first draw's values
        renderer.render({ target, container: outOfRange, clear: false });

        expect(gl.getError()).toBe(gl.NO_ERROR);
        expect(renderer.renderTarget.getGpuRenderTarget(target)._drawBuffersMask).toBe(0);
        expect(readAttachment(renderer, target, 0)).toEqual([0, 255, 0, 255]);
        expect(readAttachment(renderer, target, 1)).toEqual([0, 0, 255, 255]);
    });

    it('only reads a program\'s outputs once it draws into a target with several attachments', async () =>
    {
        renderer = await getWebGLRenderer();

        const mesh = twoOutputQuad('lazy outputs');
        const program = mesh.shader.glProgram as unknown as { _fragmentOutputMask: unknown };

        expect(program._fragmentOutputMask).toBeUndefined();

        renderer.render({ target: new RenderTarget({ colorTextures: [source()] }), container: mesh });
        expect(program._fragmentOutputMask).toBeUndefined();

        renderer.render({ target: new RenderTarget({ colorTextures: [source(), source()] }), container: mesh });
        expect(program._fragmentOutputMask).toBe(0b11);
    });

    it('still clears every attachment after a draw that switched some off', async () =>
    {
        renderer = await getWebGLRenderer();

        const target = new RenderTarget({ colorTextures: [source(), source()] });
        const sprite = new Sprite(Texture.WHITE);

        renderer.render({ target, container: twoOutputQuad(), clear: true, clearColor: [0, 0, 0, 0] });
        renderer.render({ target, container: sprite, clear: false });
        renderer.render({ target, container: sprite, clear: true, clearColor: [1, 0, 0, 1] });

        expect(readAttachment(renderer, target, 1)).toEqual([255, 0, 0, 255]);
    });

    it('clearing a target that is not bound leaves the bound target\'s draw buffers alone', async () =>
    {
        renderer = await getWebGLRenderer();

        const gl = renderer.gl as WebGL2RenderingContext;
        const bound = new RenderTarget({ colorTextures: [source(), source()] });
        const other = new RenderTarget({ colorTextures: [source(), source()] });
        const sprite = new Sprite(Texture.WHITE);
        const mesh = twoOutputQuad();

        // `other` ends with only attachment 0 on (a sprite), `bound` with both on (the two-output mesh)
        renderer.render({ target: other, container: sprite });
        renderer.render({ target: bound, container: mesh });

        renderer.renderTarget.bind(bound, false);
        renderer.renderTarget.clear(other, CLEAR.COLOR);

        // the bound framebuffer must still write attachment 1, as its record says
        expect(gl.getParameter(gl.DRAW_BUFFER1)).toBe(gl.COLOR_ATTACHMENT1);
        expect(renderer.renderTarget.getGpuRenderTarget(bound)._drawBuffersMask).toBe(0b11);
    });

    it('resolves every attachment of an antialiased target', async () =>
    {
        renderer = await getWebGLRenderer();

        const target = new RenderTarget({ colorTextures: [source(true), source(true)] });

        renderer.render({ target, container: twoOutputQuad(), clear: true, clearColor: [0, 0, 0, 0] });
        // a pass resolves when something reads the target (a filter, a copy); do it directly
        renderer.renderTarget.adaptor.finishRenderPass(target);

        expect(readAttachment(renderer, target, 0)).toEqual([0, 255, 0, 255]);
        expect(readAttachment(renderer, target, 1)).toEqual([0, 0, 255, 255]);
    });

    it('clears an integer attachment, and a blended draw overwrites it rather than blending', async () =>
    {
        renderer = await getWebGLRenderer();

        const gl = renderer.gl as WebGL2RenderingContext;
        const target = new RenderTarget({ colorTextures: [source(), source(false, 'r32uint')] });

        // blended (a mesh's default state): attachment 0 blends, the r32uint ids attachment can't
        const ids = new Mesh({
            geometry: new Geometry({ attributes: { aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1] } }),
            shader: Shader.from({
                gl: {
                    vertex: `#version 300 es
                        in vec2 aPosition;
                        void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
                    `,
                    fragment: `#version 300 es
                        precision mediump float;
                        layout(location = 0) out vec4 color;
                        layout(location = 1) out uint id;
                        void main() { color = vec4(0.5, 0.0, 0.0, 0.5); id = 42u; }
                    `,
                },
            }),
        });

        const readId = (): number => readUintAttachment(renderer, target, 1);

        gl.getError();

        renderer.render({ target, container: ids, clear: true, clearColor: [0, 0, 0, 0] });
        expect(gl.getError()).toBe(gl.NO_ERROR);
        expect(readId()).toBe(42);

        // the ids attachment takes the clear color's numbers, truncated
        renderer.render({ target, container: new Sprite(Texture.EMPTY), clear: true, clearColor: [7, 0, 0, 0] });
        expect(gl.getError()).toBe(gl.NO_ERROR);
        expect(readId()).toBe(7);
    });

    it('clears an attachment to its own clearValue, and the rest to the bind\'s colour, then the default', async () =>
    {
        renderer = await getWebGLRenderer();

        const target = new RenderTarget({ colorTextures: [source(), source(), source(false, 'r32uint')] });

        target.colorAttachments[1].clearValue = [1, 0, 0, 1];
        // above 2^24, so a float on the way would round it
        target.colorAttachments[2].clearValue = [0xffffffff, 0, 0, 0];

        renderer.render({ target, container: new Sprite(Texture.EMPTY), clear: true, clearColor: [0, 0, 1, 1] });

        expect(readAttachment(renderer, target, 0)).toEqual([0, 0, 255, 255]);
        expect(readAttachment(renderer, target, 1)).toEqual([255, 0, 0, 255]);
        expect(readUintAttachment(renderer, target, 2)).toBe(0xffffffff);

        renderer.render({ target, container: new Sprite(Texture.EMPTY), clear: true });

        expect(readAttachment(renderer, target, 0)).toEqual([0, 0, 0, 0]);
        expect(readAttachment(renderer, target, 1)).toEqual([255, 0, 0, 255]);
    });

    it('a depth-only shader leaves every color attachment alone', async () =>
    {
        renderer = await getWebGLRenderer();

        const target = new RenderTarget({ colorTextures: [source(), source()] });
        const depthOnly = new Mesh({
            geometry: new Geometry({ attributes: { aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1] } }),
            shader: Shader.from({
                gl: {
                    vertex: `#version 300 es
                        in vec2 aPosition;
                        void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
                    `,
                    fragment: `#version 300 es
                        precision mediump float;
                        void main() { }
                    `,
                },
            }),
        });

        renderer.render({ target, container: twoOutputQuad(), clear: true, clearColor: [0, 0, 0, 0] });
        renderer.render({ target, container: depthOnly, clear: false });

        expect(renderer.renderTarget.getGpuRenderTarget(target)._drawBuffersMask).toBe(0);
        expect(readAttachment(renderer, target, 0)).toEqual([0, 255, 0, 255]);
        expect(readAttachment(renderer, target, 1)).toEqual([0, 0, 255, 255]);
    });

    it('the bind decides whether anything clears, and loadOp: load opts an attachment out, on clear() too', async () =>
    {
        renderer = await getWebGLRenderer();

        const target = new RenderTarget({ colorTextures: [source(), source()] });

        renderer.render({ target, container: twoOutputQuad(), clear: true, clearColor: [0, 0, 0, 0] });

        // the bind clears, attachment 1 opts out
        target.colorAttachments[1].loadOp = 'load';
        renderer.render({ target, container: new Container(), clear: true, clearColor: [1, 0, 0, 1] });

        expect(readAttachment(renderer, target, 0)).toEqual([255, 0, 0, 255]);
        expect(readAttachment(renderer, target, 1)).toEqual([0, 0, 255, 255]);

        // the bind doesn't clear: nothing clears, whatever an attachment says
        target.colorAttachments[0].loadOp = 'clear';
        target.colorAttachments[1].loadOp = 'clear';
        renderer.render({ target, container: new Container(), clear: false });

        expect(readAttachment(renderer, target, 0)).toEqual([255, 0, 0, 255]);
        expect(readAttachment(renderer, target, 1)).toEqual([0, 0, 255, 255]);

        // an explicit clear follows the same rule: attachment 1 still opts out
        target.colorAttachments[1].loadOp = 'load';
        renderer.renderTarget.bind(target, false);
        renderer.renderTarget.clear(target, CLEAR.COLOR, [0, 1, 0, 1]);

        expect(readAttachment(renderer, target, 0)).toEqual([0, 255, 0, 255]);
        expect(readAttachment(renderer, target, 1)).toEqual([0, 0, 255, 255]);
    });

    it('a filter handing back to a target with loadOp: clear attachments keeps what was drawn', async () =>
    {
        renderer = await getWebGLRenderer();

        const target = new RenderTarget({
            colorAttachments: [{ texture: source(), loadOp: 'clear', clearValue: [0, 0, 0, 1] }],
        });

        // the left half drawn first; the right half through a filter, which pops back to `target` with clear: false
        const scene = new Container();
        const filtered = new Graphics().rect(8, 0, 8, 16).fill(0xffffff);

        filtered.filters = [new AlphaFilter()];
        scene.addChild(new Graphics().rect(0, 0, 8, 16).fill(0xffffff), filtered);

        renderer.render({ target, container: scene, clear: true });

        expect(readAttachment(renderer, target, 0, 4)).toEqual([255, 255, 255, 255]);
        expect(readAttachment(renderer, target, 0, 12)).toEqual([255, 255, 255, 255]);

        // and a plain rebind that doesn't clear keeps it too
        renderer.render({ target, container: new Container(), clear: false });

        expect(readAttachment(renderer, target, 0, 4)).toEqual([255, 255, 255, 255]);
    });

    it('clears a lone integer attachment to its clearValue', async () =>
    {
        renderer = await getWebGLRenderer();

        const gl = renderer.gl as WebGL2RenderingContext;
        const target = new RenderTarget({ colorTextures: [source(false, 'r32uint')] });

        target.colorAttachments[0].clearValue = [7, 0, 0, 0];
        gl.getError();

        // gl.clear would raise INVALID_OPERATION on an integer attachment and leave it unchanged. Nothing is
        // drawn: a float-output shader into an integer attachment is its own INVALID_OPERATION on WebGL2
        renderer.render({ target, container: new Container(), clear: true });

        expect(gl.getError()).toBe(gl.NO_ERROR);
        expect(readUintAttachment(renderer, target, 0)).toBe(7);
    });

    it('clearing an integer-attachment target that is not bound raises no GL error', async () =>
    {
        renderer = await getWebGLRenderer();

        const gl = renderer.gl as WebGL2RenderingContext;
        const bound = new RenderTarget({ colorTextures: [source(), source()] });
        const ids = new RenderTarget({ colorTextures: [source(), source(false, 'r32uint')] });

        renderer.render({ target: ids, container: new Sprite(Texture.EMPTY) });
        renderer.render({ target: bound, container: twoOutputQuad() });
        renderer.renderTarget.bind(bound, false);
        gl.getError();

        // the per-attachment clear would send clearBufferuiv to `bound`'s float attachment 1
        renderer.renderTarget.clear(ids, CLEAR.COLOR);

        expect(gl.getError()).toBe(gl.NO_ERROR);
    });

    it('rejects an integer attachment on an antialiased target, naming it', async () =>
    {
        renderer = await getWebGLRenderer();

        const target = new RenderTarget({ colorTextures: [source(true), source(false, 'r32uint')] });

        expect(() => renderer.renderTarget.getGpuRenderTarget(target))
            .toThrow('color attachment 1 is r32uint');
    });
});
