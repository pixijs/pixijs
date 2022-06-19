import { AppLoaderPlugin, Loader } from '@pixi/loaders';
import { expect } from 'chai';

describe('AppLoaderPlugin', () =>
{
    it('should contain loader property', () =>
    {
        const obj = {} as any;

        AppLoaderPlugin.init.call(obj);

        expect(obj.loader).to.be.not.undefined;
        expect(obj.loader).toBeInstanceOf(Loader);

        AppLoaderPlugin.destroy.call(obj);

        expect(obj.loader).toBeNull();
    });

    it('should use sharedLoader option', () =>
    {
        const obj = {} as any;

        AppLoaderPlugin.init.call(obj, { sharedLoader: true });

        expect(obj.loader).to.be.not.undefined;
        expect(obj.loader).toBeInstanceOf(Loader);
        expect(obj.loader).toEqual(Loader.shared);

        AppLoaderPlugin.destroy.call(obj);

        expect(obj.loader).toBeNull();
    });
});
