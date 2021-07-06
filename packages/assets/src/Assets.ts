import { Texture } from 'packages/core';
import { loadAssets } from './loader/Loader';
import { AssetCache } from './AssetCache';

export interface ImageMeta {
    resolution: number;
    format: string;
}

class AssetsClass
{
    texture: AssetCache<ImageMeta, Texture> = new AssetCache();

    constructor()
    {
        this.texture.prefer({

            resolution: [2, 1],
            format: ['png', 'jpg'],
            priority: ['format', 'resolution']

        });
    }
    async load(assets: string[])
    {
        let singleAsset = false;

        if (!(assets instanceof Array))
        {
            singleAsset = true;
            assets = [assets];
        }

        // could be keys.. or urls!
        const urls = assets.map((asset) =>
            this.texture.getSrc(asset)?.src ?? asset);

        return loadAssets(singleAsset ? urls[0] : urls);
    }
}

export const Assets = new AssetsClass();
