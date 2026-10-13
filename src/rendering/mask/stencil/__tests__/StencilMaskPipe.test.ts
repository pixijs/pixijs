import {
    describeLocalOnly,
    getWebGLRenderer,
    getWebGPURenderer,
    loseAndRestoreContext,
    loseAndRestoreDevice,
} from '@test-utils';
import { RenderTarget, RenderTexture, STENCIL_MODES, Texture, TextureSource } from '~/rendering';
import { Container, Graphics, Sprite } from '~/scene';

import type { WebGLRenderer, WebGPURenderer } from '~/rendering';

type GpuRenderer = WebGLRenderer | WebGPURenderer;

// a red sprite filling the texture, with a mask that only uncovers its left half
function createMaskedScene(): Container
{
    const scene = new Container();
    const content = new Sprite(Texture.WHITE);

    content.setSize(32, 32);
    content.tint = 0xff0000;

    const mask = new Graphics().rect(0, 0, 16, 32).fill(0xffffff);

    scene.addChild(content, mask);
    content.mask = mask;

    return scene;
}

function createRenderTarget(): RenderTarget
{
    return new RenderTarget({ colorTextures: [new TextureSource({ width: 32, height: 32 })] });
}

function pixelAt(renderer: GpuRenderer, texture: RenderTexture, x: number, y: number): number[]
{
    const { pixels, width } = renderer.extract.pixels(texture);
    const i = ((y * width) + x) * 4;

    return Array.from(pixels.slice(i, i + 4));
}

function stencilMaskSuite(
    getRenderer: () => Promise<GpuRenderer>,
    loseAndRestore: (renderer: GpuRenderer) => Promise<void>
)
{
    let renderer: GpuRenderer;
    let scene: Container;
    let textureA: RenderTexture;
    let textureB: RenderTexture;

    beforeEach(async () =>
    {
        renderer = await getRenderer();
        scene = createMaskedScene();
        textureA = RenderTexture.create({ width: 32, height: 32 });
        textureB = RenderTexture.create({ width: 32, height: 32 });
    });

    afterEach(() =>
    {
        jest.restoreAllMocks();
        renderer.destroy();
    });

    it('should track the mask stack and stencil state per render target', () =>
    {
        const spy = jest.spyOn(renderer.stencil, 'setStencilMode');

        for (let i = 0; i < 3; i++)
        {
            renderer.render({ container: scene, target: textureA });
            renderer.render({ container: scene, target: textureB });
        }

        const targetA = renderer.renderTarget.getRenderTarget(textureA);
        const targetB = renderer.renderTarget.getRenderTarget(textureB);
        const gpuTargetA = renderer.renderTarget.getGpuRenderTarget(targetA);
        const gpuTargetB = renderer.renderTarget.getGpuRenderTarget(targetB);

        expect(gpuTargetA).not.toBe(gpuTargetB);

        // every mask push started at reference 0: neither target's counter bled into the other's frames
        const pushes = spy.mock.calls.filter(([mode]) => mode === STENCIL_MODES.RENDERING_MASK_ADD);

        expect(pushes).toHaveLength(6);
        expect(pushes.every(([, reference]) => reference === 0)).toBe(true);

        // and every push was matched by a pop
        expect(gpuTargetA.maskStackIndex).toBe(0);
        expect(gpuTargetB.maskStackIndex).toBe(0);

        // the state a masked frame leaves behind stays on the target's own backend object
        expect(gpuTargetA.stencilMode).toBe(STENCIL_MODES.MASK_ACTIVE);
        expect(gpuTargetB.stencilMode).toBe(STENCIL_MODES.MASK_ACTIVE);

        renderer.render({ container: scene, target: textureA });

        // a target seen again keeps its backend object rather than getting a fresh one
        expect(renderer.renderTarget.getGpuRenderTarget(targetA)).toBe(gpuTargetA);
    });

    it('should restore each render target\'s own stencil state when switching between them', () =>
    {
        const plain = new Sprite(Texture.WHITE);

        renderer.render({ container: scene, target: textureA });
        renderer.render({ container: plain, target: textureB });

        const spy = jest.spyOn(renderer.stencil, 'setStencilMode');

        // binding A brings back the state its last masked frame left behind
        renderer.render({ container: scene, target: textureA });

        expect(spy.mock.calls[0]).toEqual([STENCIL_MODES.MASK_ACTIVE, 0]);

        spy.mockClear();

        // binding B brings back its own untouched default, not A's state
        renderer.render({ container: plain, target: textureB });

        expect(spy.mock.calls[0]).toEqual([STENCIL_MODES.DISABLED, 0]);
    });

    it('should keep masking into a surviving render texture after another one is destroyed', () =>
    {
        renderer.render({ container: scene, target: textureA });
        renderer.render({ container: scene, target: textureB });

        textureA.destroy(true);

        expect(() => renderer.render({ container: scene, target: textureB })).not.toThrow();

        expect(pixelAt(renderer, textureB, 8, 16)).toEqual([255, 0, 0, 255]);
        expect(pixelAt(renderer, textureB, 24, 16)[0]).toBe(0);
    });

    it('should free the tracked state with the backend object when a caller-owned target is destroyed', () =>
    {
        const target = createRenderTarget();

        renderer.render({ container: scene, target });

        expect(renderer.renderTarget.getGpuRenderTarget(target).stencilMode).toBe(STENCIL_MODES.MASK_ACTIVE);

        target.destroy();

        expect(renderer.renderTarget['_gpuRenderTargetHash'][target.uid]).toBeNull();

        // a new target starts from the defaults rather than inheriting anything the old one left behind
        const next = createRenderTarget();
        const spy = jest.spyOn(renderer.stencil, 'setStencilMode');

        renderer.render({ container: new Sprite(Texture.WHITE), target: next });

        expect(spy.mock.calls[0]).toEqual([STENCIL_MODES.DISABLED, 0]);
        expect(renderer.renderTarget.getGpuRenderTarget(next)).toMatchObject({
            stencilMode: STENCIL_MODES.DISABLED,
            stencilReference: 0,
            maskStackIndex: 0,
        });
    });

    it('should track the state on the rebuilt backend object after the context is restored', async () =>
    {
        renderer.render({ container: scene, target: textureA });

        const targetA = renderer.renderTarget.getRenderTarget(textureA);
        const before = renderer.renderTarget.getGpuRenderTarget(targetA);

        await loseAndRestore(renderer);

        // the same target is bound again, so no change event announces the rebuilt backend object
        renderer.render({ container: scene, target: textureA });

        const after = renderer.renderTarget.getGpuRenderTarget(targetA);

        expect(after).not.toBe(before);
        expect(after.stencilMode).toBe(STENCIL_MODES.MASK_ACTIVE);
        expect(after.maskStackIndex).toBe(0);
        expect(pixelAt(renderer, textureA, 8, 16)).toEqual([255, 0, 0, 255]);
        expect(pixelAt(renderer, textureA, 24, 16)[0]).toBe(0);
    });
}

describe('StencilMaskPipe (WebGL)', () =>
{
    stencilMaskSuite(getWebGLRenderer, (renderer) => loseAndRestoreContext(renderer as WebGLRenderer));
});

describeLocalOnly('StencilMaskPipe (WebGPU)', () =>
{
    stencilMaskSuite(getWebGPURenderer, (renderer) => loseAndRestoreDevice(renderer as WebGPURenderer));
});
