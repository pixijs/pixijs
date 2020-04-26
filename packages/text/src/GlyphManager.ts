import { RenderTexture } from 'pixi.js';
import { GlyphTiles } from './glyph-tiles';

export class GlyphManager
{
    private _atlasList: Array<RenderTexture>;
    private _atlasTiles: Array<GlyphTiles>;

    constructor()
    {
        this._atlasList = [];
        this._atlasTiles = [];
    }
}
