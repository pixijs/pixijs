import { ExternalSource } from '../sources/ExternalSource';
import { Texture } from '../Texture';
import { getWebGLRenderer } from '@test-utils';

describe('ExternalSource', () =>
{
    // Mock gl.isTexture since it doesn't work properly in the test environment
    function mockIsTexture(gl: WebGLRenderingContext): void
    {
        const createdTextures = new Set<WebGLTexture>();
        const originalCreateTexture = gl.createTexture.bind(gl);

        gl.createTexture = () =>
        {
            const texture = originalCreateTexture();

            if (texture) createdTextures.add(texture);

            return texture;
        };

        gl.isTexture = (texture: WebGLTexture) => createdTextures.has(texture);
    }

    it('should create with a WebGL texture resource', async () =>
    {
        const renderer = await getWebGLRenderer();
        const gl = renderer.gl;

        mockIsTexture(gl);
        const glTexture = gl.createTexture();

        const source = new ExternalSource({
            resource: glTexture,
            renderer,
            width: 64,
            height: 64,
        });

        expect(source.width).toBe(64);
        expect(source.height).toBe(64);
        expect(source.resource).toBe(glTexture);

        source.destroy();
        renderer.destroy();
    });

    it('should create without a resource using placeholder', async () =>
    {
        const renderer = await getWebGLRenderer();

        mockIsTexture(renderer.gl);

        const source = new ExternalSource({
            renderer,
            label: 'test-placeholder',
        });

        // Should have default 1x1 dimensions
        expect(source.width).toBe(1);
        expect(source.height).toBe(1);
        expect(source.label).toBe('test-placeholder');
        // Resource should be the placeholder (not null)
        expect(source.resource).not.toBeNull();

        source.destroy();
        renderer.destroy();
    });

    it('should initialize WebGL placeholder with 1x1 pixel texture', async () =>
    {
        const renderer = await getWebGLRenderer();
        const gl = renderer.gl;

        mockIsTexture(gl);

        const bindTextureSpy = jest.spyOn(gl, 'bindTexture');
        const texImage2DSpy = jest.spyOn(gl, 'texImage2D');

        const source = new ExternalSource({ renderer });

        // Verify placeholder texture was bound and initialized
        expect(bindTextureSpy).toHaveBeenCalledWith(gl.TEXTURE_2D, source.resource);
        expect(texImage2DSpy).toHaveBeenCalledWith(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        );

        source.destroy();
        renderer.destroy();
    });

    it('should create without resource but with explicit dimensions', async () =>
    {
        const renderer = await getWebGLRenderer();

        mockIsTexture(renderer.gl);

        const source = new ExternalSource({
            renderer,
            width: 256,
            height: 128,
        });

        expect(source.width).toBe(256);
        expect(source.height).toBe(128);

        source.destroy();
        renderer.destroy();
    });

    it('should share placeholder between multiple instances', async () =>
    {
        const renderer = await getWebGLRenderer();

        mockIsTexture(renderer.gl);

        const source1 = new ExternalSource({ renderer });
        const source2 = new ExternalSource({ renderer });

        // Both should use the same placeholder texture
        expect(source1.resource).toBe(source2.resource);

        source1.destroy();
        source2.destroy();
        renderer.destroy();
    });

    it('should update from placeholder to real texture via updateGPUTexture', async () =>
    {
        const renderer = await getWebGLRenderer();
        const gl = renderer.gl;

        mockIsTexture(gl);
        const realTexture = gl.createTexture();

        const source = new ExternalSource({
            renderer,
            label: 'deferred',
        });

        const placeholder = source.resource;

        // Update to real texture
        source.updateGPUTexture(realTexture, 512, 512);

        expect(source.resource).not.toBe(placeholder);
        expect(source.width).toBe(512);
        expect(source.height).toBe(512);

        source.destroy();
        renderer.destroy();
    });

    it('should emit update event when updateGPUTexture is called', async () =>
    {
        const renderer = await getWebGLRenderer();
        const gl = renderer.gl;

        mockIsTexture(gl);
        const realTexture = gl.createTexture();

        const source = new ExternalSource({ renderer });
        const updateSpy = jest.fn();

        source.on('update', updateSpy);
        source.updateGPUTexture(realTexture, 100, 100);

        expect(updateSpy).toHaveBeenCalledWith(source);

        source.destroy();
        renderer.destroy();
    });

    it('should not destroy external texture on destroy()', async () =>
    {
        const renderer = await getWebGLRenderer();
        const gl = renderer.gl;

        mockIsTexture(gl);
        const externalTexture = gl.createTexture();

        const source = new ExternalSource({
            resource: externalTexture,
            renderer,
            width: 64,
            height: 64,
        });

        source.destroy();

        // External texture should still be valid
        expect(gl.isTexture(externalTexture)).toBe(true);

        renderer.destroy();
    });

    it('should not destroy placeholder on destroy()', async () =>
    {
        const renderer = await getWebGLRenderer();

        mockIsTexture(renderer.gl);

        const source1 = new ExternalSource({ renderer });
        const placeholder = source1.resource;

        source1.destroy();

        // Create another instance - should still be able to use the placeholder
        const source2 = new ExternalSource({ renderer });

        expect(source2.resource).toBe(placeholder);

        source2.destroy();
        renderer.destroy();
    });

    it('should work with Texture wrapper', async () =>
    {
        const renderer = await getWebGLRenderer();
        const gl = renderer.gl;

        mockIsTexture(gl);
        const glTexture = gl.createTexture();

        const texture = new Texture({
            source: new ExternalSource({
                renderer,
            }),
        });

        // Should start with placeholder
        expect(texture.width).toBe(1);
        expect(texture.height).toBe(1);

        // Update to real texture
        const externalSource = texture.source as ExternalSource;

        externalSource.updateGPUTexture(glTexture, 256, 256);

        expect(texture.width).toBe(256);
        expect(texture.height).toBe(256);

        texture.destroy();
        renderer.destroy();
    });

    it('static test() should identify WebGLTexture', async () =>
    {
        const renderer = await getWebGLRenderer();
        const gl = renderer.gl;
        const glTexture = gl.createTexture();

        expect(ExternalSource.test(glTexture)).toBe(true);
        expect(ExternalSource.test(null)).toBe(false);
        expect(ExternalSource.test({})).toBe(false);
        expect(ExternalSource.test('string')).toBe(false);

        renderer.destroy();
    });

    it('should throw when using wrong texture type for renderer', async () =>
    {
        const renderer = await getWebGLRenderer();

        // Mock a GPUTexture-like object
        const mockGPUTexture = { width: 100, height: 100 };

        // Temporarily mock globalThis.GPUTexture
        const originalGPUTexture = globalThis.GPUTexture;

        (globalThis as any).GPUTexture = class GPUTexture {};
        Object.setPrototypeOf(mockGPUTexture, (globalThis as any).GPUTexture.prototype);

        expect(() => new ExternalSource({
            resource: mockGPUTexture as any,
            renderer,
        })).toThrow('Cannot use GPUTexture with a WebGL renderer');

        // Restore
        if (originalGPUTexture)
        {
            globalThis.GPUTexture = originalGPUTexture;
        }
        else
        {
            delete (globalThis as any).GPUTexture;
        }

        renderer.destroy();
    });
});
