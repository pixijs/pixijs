import { getWebGLRenderer } from '@test-utils';
import { Texture, TextureSource } from '~/rendering';
import { Container, Sprite } from '~/scene';
import { BigPool } from '~/utils/pool/PoolGroup';

describe('AlphaMaskPipe', () =>
{
    it('should release the mask bindings when the pooled effect returns to the pool', async () =>
    {
        const returned: any[] = [];
        const originalReturn = BigPool.return;

        (BigPool as any).return = function poolReturn(item: any)
        {
            originalReturn.call(this, item);

            if (item.constructor.name === 'AlphaMaskEffect')
            {
                returned.push(item);
            }
        };

        const renderer = await getWebGLRenderer();

        const stage = new Container();
        const content = new Sprite(Texture.WHITE);
        const maskTexture = new Texture({ source: new TextureSource({ width: 16, height: 16 }) });
        const mask = new Sprite(maskTexture);

        stage.addChild(content, mask);
        content.mask = mask;

        try
        {
            renderer.render(stage);
        }
        finally
        {
            (BigPool as any).return = originalReturn;
        }

        expect(returned).toHaveLength(1);

        const effect = returned[0];

        // parked on the placeholder — the pooled effect must not pin the last mask
        expect(effect.sprite).not.toBe(mask);
        expect(effect.sprite.texture).toBe(Texture.EMPTY);
        expect(effect.filters[0].resources.uMaskTexture).toBe(Texture.EMPTY.source);

        // and the bind group's 'change' subscription must have left the mask texture
        const maskSource = maskTexture.source as any;
        const changeListeners = maskSource.listeners('change').map((fn: any) => fn.name);

        expect(changeListeners).not.toContain('onResourceChange');

        renderer.destroy();
    });

    it('should survive destroying a texture source that was used as a sprite mask', async () =>
    {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        const renderer = await getWebGLRenderer();

        const stage = new Container();
        const content = new Sprite(Texture.WHITE);
        const maskTexture = new Texture({ source: new TextureSource({ width: 16, height: 16 }) });
        const mask = new Sprite(maskTexture);

        stage.addChild(content, mask);
        content.mask = mask;

        // the pooled AlphaMaskEffect applies maskTexture and goes back to the pool
        renderer.render(stage);

        // fully release the mask, then destroy its texture — nothing of pixi's
        // may still be subscribed to the destroyed source
        content.mask = null;
        stage.removeChild(mask);
        mask.destroy();
        maskTexture.destroy(true);

        // the next sprite-mask render pulls the pooled effect again
        const nextMask = new Sprite(Texture.WHITE);

        stage.addChild(nextMask);
        content.mask = nextMask;

        expect(() => renderer.render(stage)).not.toThrow();

        const bindGroupWarnings = warnSpy.mock.calls.filter((call) => call.join(' ').includes('[BindGroup]'));

        expect(bindGroupWarnings).toHaveLength(0);

        warnSpy.mockRestore();
        renderer.destroy();
    });

    it('should not leave listeners on Texture.EMPTY after pooled effects are destroyed', async () =>
    {
        // reap effects parked by earlier tests, then measure the clean baseline
        BigPool.clear();

        const listenersBefore = Texture.EMPTY.listenerCount('update');

        const renderer = await getWebGLRenderer();

        const stage = new Container();
        const content = new Sprite(Texture.WHITE);
        const mask = new Sprite(Texture.WHITE);

        stage.addChild(content, mask);
        content.mask = mask;

        renderer.render(stage);

        // true -> GlobalResourceRegistry.release() -> BigPool.clear() destroys the parked effect
        renderer.destroy(true);

        expect(Texture.EMPTY.listenerCount('update')).toBe(listenersBefore);
    });
});
