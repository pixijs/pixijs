import { CLEAR, Geometry, RenderTarget, Shader, State, Texture, TextureSource } from '~/rendering';
import { Container, Mesh, Sprite } from '~/scene';

import type { Renderer, WebGLRenderer, WebGPURenderer } from '~/rendering';

// IMPORTANT NOTE FOR CUSTOM SHADERS ON MESHES:
// Do NOT use the uniform name `uColor` in custom shaders rendered via `Mesh`: in WebGL the mesh's own
// `uColor` tint uniform overwrites it. Use a distinct name like `uTestColor`.
const gpuShaderSrc = /* wgsl */`
    struct Uniforms {
        uTestColor: vec4<f32>,
        uDepth: f32,
    }

    @group(0) @binding(0) var<uniform> uniforms : Uniforms;

    @vertex
    fn vsMain(@location(0) aPosition : vec2<f32>) -> @builtin(position) vec4<f32> {
        return vec4<f32>(aPosition, uniforms.uDepth, 1.0);
    }

    @fragment
    fn fsMain() -> @location(0) vec4<f32> {
        return uniforms.uTestColor;
    }
`;

const glShader = {
    vertex: `#version 300 es
        precision highp float;
        in vec2 aPosition;
        uniform float uDepth;
        void main() {
            gl_Position = vec4(aPosition, uDepth, 1.0);
        }
    `,
    fragment: `#version 300 es
        precision highp float;
        uniform vec4 uTestColor;
        out vec4 fragColor;
        void main() {
            fragColor = uTestColor;
        }
    `,
};

function quad(points: number[], color: number[], depth: number): Mesh<Geometry, Shader>
{
    const state = new State();

    state.depthTest = true;
    state.depthMask = true;
    state.blendMode = 'none';

    return new Mesh({
        geometry: new Geometry({ attributes: { aPosition: points } }),
        shader: Shader.from({
            gl: glShader,
            gpu: {
                vertex: { source: gpuShaderSrc, entryPoint: 'vsMain' },
                fragment: { source: gpuShaderSrc, entryPoint: 'fsMain' },
            },
            resources: {
                uniforms: {
                    uTestColor: { value: color, type: 'vec4<f32>' },
                    uDepth: { value: depth, type: 'f32' },
                },
            },
        }),
        state,
    });
}

/**
 * Copies a region of depth with an offset, then depth-tests against the copy, for `copyDepthTexture` from a
 * render texture or the canvas, antialiased or not. Every variant draws the same picture: red everywhere but a
 * black (depth-blocked) stripe at x 16-48 over rows 0-96.
 *
 * A green left-half quad at depth 0.3 goes into the source (x 0-64). The copy takes source x 32-96, y 16-112 to
 * destination x 16-80, y 0-96, so the quad's depth lands at destination x 16-48 and the source's cleared depth at
 * x 48-80. The copied rows are centred vertically, so the picture doesn't depend on which way up a backend stores
 * the canvas. A full-screen red quad at depth 0.5 then draws into the destination, keeping the copied depth.
 *
 * A failed blit or a WebGPU validation error throws, since either would otherwise go unnoticed.
 * @param scene - the scene to add the result to
 * @param renderer - the renderer to draw with
 * @param source - copy from an `antialias`-matching render texture, or from the canvas
 * @param antialias - whether the render texture is antialiased; for the canvas, the scene's renderer options say
 */
export async function copyDepthRegion(
    scene: Container,
    renderer: Renderer,
    source: 'texture' | 'canvas',
    antialias = false,
): Promise<void>
{
    const gl = (renderer as WebGLRenderer).gl;
    const device = (renderer as WebGPURenderer).gpu?.device;

    device?.pushErrorScope('validation');

    const leftHalf = quad([-1, -1, 0, -1, 0, 1, -1, -1, 0, 1, -1, 1], [0, 1, 0, 1], 0.3);
    let sourceSurface: RenderTarget;

    if (source === 'canvas')
    {
        // the target the canvas is drawn through, which needs a depth attachment to be a copyDepthTexture source
        sourceSurface = renderer.view.renderTarget;
        sourceSurface.ensureDepthStencilTexture();
        renderer.render({ container: leftHalf, clear: true, clearColor: [0, 0, 0, 1] });
    }
    else
    {
        sourceSurface = new RenderTarget({ width: 128, height: 128, antialias, depthStencilTexture: true });
        renderer.render({ target: sourceSurface, container: leftHalf, clear: true, clearColor: [0, 0, 0, 1] });
    }

    const destColorSource = new TextureSource({
        width: 128,
        height: 128,
        resolution: 1,
        mipLevelCount: 1,
        autoGenerateMipmaps: false,
    });
    const destDepthSource = new TextureSource({
        width: 128,
        height: 128,
        resolution: 1,
        format: 'depth24plus-stencil8',
        mipLevelCount: 1,
        autoGenerateMipmaps: false,
    });
    const destRT = new RenderTarget({
        colorAttachments: [{
            texture: destColorSource,
            loadOp: 'clear',
            storeOp: 'store',
            clearValue: [0, 0, 0, 1],
        }],
        depthStencilAttachment: {
            texture: destDepthSource,
            depthLoadOp: 'load',
            depthStoreOp: 'store',
            depthClearValue: 1.0,
        },
    });

    // clear the destination's depth to 1 so only the copied region can block anything
    renderer.render({ target: destRT, container: new Container(), clear: true });

    gl?.getError();
    renderer.renderTarget.copyDepthTexture(
        sourceSurface,
        new Texture({ source: destDepthSource }),
        { x: 32, y: 16 },
        { width: 64, height: 96 },
        { x: 16, y: 0 },
    );

    const glError = gl?.getError();

    if (glError) throw new Error(`copyDepthTexture raised GL error ${glError}`);

    renderer.render({
        target: destRT,
        container: quad([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1], [1, 0, 0, 1], 0.5),
        clear: CLEAR.COLOR,
        clearColor: [0, 0, 0, 1],
    });

    const gpuError = await device?.popErrorScope();

    if (gpuError) throw new Error(`copyDepthTexture raised a WebGPU validation error: ${gpuError.message}`);

    scene.addChild(new Sprite(new Texture({ source: destColorSource })));
}
