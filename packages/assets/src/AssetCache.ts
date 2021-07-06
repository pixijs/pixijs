import { loadAssets } from './loader';

export class AssetCache<
    META,
    ASSET,
    ITEM_SRC = META & {src: string},
    PREFERRED_META = {[K in keyof META]: META[K][]} & {priority: Array<keyof META>}
>
{
    private _metaHash: Record<string, ITEM_SRC[]> = {};
    private _preferredMeta: PREFERRED_META;

    add(id: string, asset: ITEM_SRC | ITEM_SRC[]): void
    {
        if (!(asset instanceof Array))
        {
            asset = [asset];
        }

        this._metaHash[id] = asset;
    }

    prefer(meta: PREFERRED_META): void
    {
        this._preferredMeta = meta;
    }

    getSrc(id: string): ITEM_SRC
    {
        const asset = this._metaHash[id];

        if (!asset) return null;

        const preferredMeta = this._preferredMeta;

        const priority = preferredMeta.priority;

        let highestValue = -Infinity;
        let closest = asset[0];

        for (let j = 0; j < asset.length; j++)
        {
            let value = 0;
            const meta = asset[j];

            for (let i = 0; i < priority.length; i++)
            {
                const preferredKey = priority[i];
                const preferredKeyValues = preferredMeta[preferredKey];

                for (let k = 0; k < preferredKeyValues.length; k++)
                {
                    if (meta[preferredKey] === preferredKeyValues[k])
                    {
                        value += ((preferredKeyValues.length - k) << (4 - i));
                        break;
                    }
                }
            }

            if (value > highestValue)
            {
                highestValue = value;
                closest = meta;
            }
        }

        return closest;
    }

    async get(id: string): Promise<ASSET>
    {
        const meta = this.getSrc(id);
        const url = meta?.src ?? id;

        const asset = await loadAssets(url);

        return asset as ASSET;
    }
}
